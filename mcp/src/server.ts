import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function createMcpServer(): McpServer {
  const server = new McpServer({name: 'excel-tools', version: '0.1.0'});

  let pingCount = 0;
  
  server.registerTool(
    'ping',
    {
      description: 'Health check. Returns "pong" and how many times ping was called in this session.',
      inputSchema: {},
    },
    async () => {
      pingCount++;
      return {content: [{type: 'text', text: `pong #${pingCount}` }] };
    },
  );

  return server;
}