import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { createMcpServer } from './server.js';
import type { Request, Response } from 'express';
import { SessionStore } from './session-store.js';
import type { SessionContext } from './interfaces/session-interface.js';


const PORT = Number(process.env.MCP_PORT ?? 3100);
const HOST = process.env.MCP_HOST ?? '127.0.0.1';

const app = createMcpExpressApp({ host: HOST });
const sessions = new SessionStore();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/mcp', async (_req, res) => {
  const sessionId = _req.header('mcp-session-id');

  // Case 1: existing session -> route to its transport 
  if (sessionId){
    const transport = sessions.get(sessionId)?.transport;
    if (!transport){
      res.status(404).json({jsonrpc: '2.0', error: {code: -32001, message: 'Session not found' }, id: null });
      return;
    }
    await transport.handleRequest(_req, res, _req.body);
    return;
  }

  // Case 2: no session id -> only initialize is allowed
  if(!isInitializeRequest(_req.body)){
    res.status(400).json({jsonrpc: '2.0', error: {code: -32000, message: 'Missing Mcp-Session-Id header' }, id: null})
    return;
  }

  // Case 3: new session -> new transport + server
  const ctx: SessionContext = {createdAt: new Date()};
  const server = createMcpServer(ctx);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => {
      sessions.add(id, {ctx, server, transport, lastSeenAt: Date.now()})
      console.error(`[mcp] session opened ${id}`);
    },
    onsessionclosed: (id) => {
      sessions.delete(id);
      console.error(`[mcp] session closed ${id}`);
    }
  });
  await server.connect(transport);
  await transport.handleRequest(_req, res, _req.body);
})

async function handleSessionRequest(req: Request, res: Response) : Promise<void>{
  const sessionId = req.header('mcp-session-id');
  const transport = sessionId ? sessions.get(sessionId)?.transport : undefined;
  if(!transport) {
    res.status(404).json({jsonrpc: '2.0', error: { code: -32001, message: 'Session not found'}, id: null});
    return;
  }
  await transport.handleRequest(req, res);
}

app.get('/mcp', handleSessionRequest);
app.delete('/mcp', handleSessionRequest);

app.listen(PORT, HOST, () => {
  console.error(`[mcp] listening on http://${HOST}:${PORT}`);
});