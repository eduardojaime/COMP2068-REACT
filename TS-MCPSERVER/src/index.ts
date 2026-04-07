// Import packages
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";

import { z } from "zod";
import express from "express";

// Create MCP server instance
const server = new McpServer({
    name: "sushi-restaurant-server",
    description: " MCP Server for managing sushi restaurant data",
    version: "1.0.0"
});

// Add simple tool, with hardcoded data in JSON format
server.registerTool(
    "getMenu",
    {
        title: "Get Menu",
        description: "Get the sushi restaurant menu",
        inputSchema: z.object({}), // No input parameters
    },
    async ({}): Promise<CallToolResult> => {
        // Hardcoded menu data
        const menu = [
            { id: 1, name: "California Roll", price: 8.99 },
            { id: 2, name: "Spicy Tuna Roll", price: 9.99 },
            { id: 3, name: "Salmon Nigiri", price: 4.99 },
        ]
        return {
            content: [{ type: "text", text: JSON.stringify(menu) }]
        }
    }
)


// Option 1) Start server with HTTP transport
const app = createMcpExpressApp();
app.use(express.json());
app.use("/", async (req, res) => {
    const transport = new StreamableHTTPServerTransport();
    await transport.handleRequest(req, res, req.body);
    await server.connect(transport);
    return;
});
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Sushi restaurant server is running on port ${PORT}`);
    console.log(`Use the 'getMenu' tool to retrieve the menu data.`);
});

// Option 2) Start server with stdio transport
// const transport = new StdioServerTransport();
// await server.connect(transport); // use this for local development and testing with tools like VSCode

// Print success message but using console.error() since stdio transport uses stdout for communication
console.error("Sushi restaurant server started successfully!" + " Use the 'getMenu' tool to retrieve the menu data.");