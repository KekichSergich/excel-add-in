import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";

export interface SessionContext{
  createdAt: Date;
}

export interface Session{
  ctx: SessionContext;
  server: McpServer;
  transport: StreamableHTTPServerTransport;
  lastSeenAt: number;
}