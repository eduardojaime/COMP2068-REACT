# Week 13: Agentic AI and Model Context Protocol (MCP)

## Agentic Workflow Diagram

```
┌──────┐                                                             ┌──────────┐
│ User │                                                             │ MongoDB  │
└──┬───┘                                                             └────▲─────┘
   │                                                                      │
   │ "Show me today's                                                    │
   │  sushi specials"                                                    │
   │                                                                      │
   ▼                                                                      │
┌─────────────┐         ┌────────────┐         ┌──────────────┐         │
│  AI Agent   │────────▶│ MCP Server │────────▶│ MERN Backend │─────────┘
│             │         │            │         │              │
│ 1. Analyze  │         │ Exposes    │         │ API Endpoint │
│    intent   │         │ Tools      │         │              │
│ 2. Plan     │◀────────│            │◀────────│              │
│    actions  │         │            │         │              │
│ 3. Format   │         └────────────┘         └──────────────┘
│    response │              │                         │
└─────────────┘              │                         │
       │                     │                         │
       │                     ▼                         ▼
       │            Tool: getSushiSpecials()    GET /api/sushi?special=true
       │                     │
       │                     │
       ▼                     ▼
   "Here are today's    Returns JSON with
    specials: ..."     structured sushi data

   Agent orchestrates multiple steps autonomously
```

---

## What is Agentic AI?

### Traditional AI vs. Agentic AI

| Feature | Traditional AI/Chatbots | Agentic AI |
|---------|------------------------|------------|
| **Interaction Pattern** | Simple request → single response | Multi-step autonomous workflows |
| **Planning & Reasoning** | No planning capability | Plans and reasons through complex tasks |
| **Tool Usage** | Cannot use external tools | Can call functions, APIs, databases |
| **Data Access** | Limited to knowledge cutoff | Access to real-time data |
| **State Management** | Stateless interactions | Maintains context across interactions |
| **Error Handling** | Cannot self-correct | Can self-correct and iterate |
| **Example Use Case** | "What's 2+2?" → "4" | "Book a flight" → Searches flights → Compares prices → Makes booking → Sends confirmation |

### Key Characteristics of Agents

1. **Autonomy**: Makes decisions without human intervention at each step
2. **Tool Use**: Can call functions, query databases, make API requests
3. **Planning**: Breaks down complex tasks into actionable steps
4. **Observation**: Evaluates results and adjusts approach
5. **Memory**: Maintains context across multiple interactions

### When to Use Agentic Systems

✅ **Good Use Cases:**
- Complex multi-step workflows (booking systems, data analysis)
- Tasks requiring external data (weather, stock prices, database queries)
- Customer service with action capabilities (order updates, refunds)
- Content creation with research (blog posts with citations)
- Development assistants (code generation, debugging, deployment)

❌ **Not Ideal For:**
- Simple Q&A or information retrieval
- Real-time chat (latency concerns)
- Tasks requiring 100% accuracy (financial transactions without human oversight)
- Highly regulated decisions without approval workflows

---

## Introduction to Model Context Protocol (MCP)

### What is MCP?

**Model Context Protocol (MCP)** is an open-source standard for connecting AI applications to external systems. Think of MCP like a **USB-C port for AI applications** — it provides a standardized way to connect AI agents to data sources, tools, and workflows.

### Why MCP Matters

**Without MCP:**
```
AI Agent → Custom HTTP API → Your Backend
AI Agent → Different GraphQL API → Another Service  
AI Agent → Yet another REST API → Third Service
```
*Each integration requires custom code, authentication, and error handling.*

**With MCP:**
```
AI Agent → MCP Protocol → MCP Server 1 (MongoDB)
                       → MCP Server 2 (Sushi Restaurant)
                       → MCP Server 3 (GitHub)
```
*Single protocol, consistent interface, reusable across all agents.*

### Key Benefits

1. **Standardization**: One protocol to connect to any data source
2. **Reusability**: Build once, use with Claude, ChatGPT, VSCode Copilot, etc.
3. **Security**: Built-in authentication and authorization patterns
4. **Type Safety**: Schema validation for tools and resources
5. **Ecosystem**: Growing library of pre-built MCP servers

### MCP Architecture Overview

```
                         ┌─────────────────┐
                         │  AI Agent/      │
                         │  Client (Claude,│
                         │  Copilot, etc.) │
                         └────────┬────────┘
                                  │
                                  │ MCP Protocol
                                  │ (Standardized Interface)
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │ MCP Server 1 │  │ MCP Server 2 │  │ MCP Server 3 │
         │  Database    │  │     APIs     │  │    Files     │
         │   Tools      │  │    Tools     │  │   Tools      │
         └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                │                 │                 │
                ▼                 ▼                 ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │   MongoDB    │  │  REST APIs   │  │ Local Files  │
         │   Database   │  │  (Weather,   │  │  System      │
         │              │  │   GitHub,    │  │              │
         │              │  │   etc.)      │  │              │
         └──────────────┘  └──────────────┘  └──────────────┘

  Build once, use across all MCP-compatible AI clients
```

---

## MCP Core Concepts

### 1. MCP Servers

An **MCP Server** exposes functionality to AI agents through three main primitives:

#### **Tools**: Functions agents can execute

```typescript
server.addTool({
  name: "get_sushi_menu",
  description: "Retrieves the current sushi menu with prices",
  inputSchema: z.object({
    category: z.enum(["rolls", "sashimi", "nigiri"]).optional(),
    max_price: z.number().optional()
  }),
  handler: async ({ category, max_price }) => {
    // Query database and return results
    return { menu: [...] };
  }
});
```

**Examples**: Database queries, API calls, file operations, calculations

#### **Resources**: Data sources agents can read

```typescript
server.addResource({
  uri: "sushi://menu/specials",
  name: "Daily Sushi Specials",
  description: "Today's special offers and featured items",
  mimeType: "application/json",
  handler: async () => {
    return { content: [...] };
  }
});
```

**Examples**: Files, database records, configuration data, documentation

#### **Prompts**: Reusable prompt templates

```typescript
server.addPrompt({
  name: "recommend_sushi",
  description: "Recommends sushi based on customer preferences",
  arguments: [
    { name: "dietary_restrictions", required: false },
    { name: "spice_level", required: false }
  ],
  handler: async (args) => {
    return {
      messages: [
        {
          role: "user",
          content: `Recommend sushi for someone with ${args.dietary_restrictions}...`
        }
      ]
    };
  }
});
```

**Examples**: Customer service scripts, code review templates, analysis frameworks

### 2. MCP Clients

An **MCP Client** connects to MCP servers and allows AI agents to discover and invoke available tools.

**Supported Clients:**
- **Claude Desktop**: Anthropic's AI assistant
- **ChatGPT**: OpenAI's chatbot (with MCP support)
- **VS Code Copilot**: GitHub's AI coding assistant
- **Cursor**: AI-powered code editor
- **Custom applications**: Build your own with the SDK

### 3. Transport Protocols

MCP supports two primary transport mechanisms:

1. **Stdio (Standard Input/Output)**
   - For local processes
   - Most common during development
   - Used by desktop applications

2. **HTTP with Server-Sent Events (SSE)**
   - For remote/networked servers
   - Production deployments
   - Web-based integrations

---

## Building Your First MCP Server

### Prerequisites

```powershell
# Ensure you have Node.js 18+ installed
node --version

# Create a new directory for the MCP server
mkdir TS-MCPSERVER
cd TS-MCPSERVER

# Initialize a new TypeScript project
npm init -y
npm install @modelcontextprotocol/server zod
npm install -D @types/node tsx typescript
```

### Basic MCP Server Structure

**File: `src/index.ts`**

```typescript
import { MCPServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

// Create MCP server instance
const server = new MCPServer({
  name: "sushi-restaurant-server",
  version: "1.0.0",
  description: "MCP server for managing sushi restaurant operations"
});

// Add a simple tool
server.addTool({
  name: "get_menu",
  description: "Get the sushi restaurant menu",
  inputSchema: z.object({}),
  handler: async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            rolls: [
              { name: "California Roll", price: 8.99 },
              { name: "Dragon Roll", price: 12.99 },
              { name: "Rainbow Roll", price: 14.99 }
            ]
          })
        }
      ]
    };
  }
});

// Start the server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Sushi Restaurant MCP Server running on stdio");
```

### Schema Validation with Zod

MCP uses [Standard Schema](https://standardschema.dev/) for type-safe input validation. You can use Zod, Valibot, ArkType, or any compatible library.

```typescript
import { z } from "zod";

// Define input schema
const AddOrderSchema = z.object({
  customer_id: z.string(),
  items: z.array(z.object({
    sushi_id: z.string(),
    quantity: z.number().min(1)
  })),
  delivery_address: z.string().optional()
});

server.addTool({
  name: "create_order",
  description: "Creates a new sushi order",
  inputSchema: AddOrderSchema,
  handler: async ({ customer_id, items, delivery_address }) => {
    // TypeScript knows the types here!
    // Insert order into MongoDB
    // Send confirmation email
    return { order_id: "...", status: "confirmed" };
  }
});
```

---

## Integrating MCP with Your MERN Backend

### Architecture Pattern

```
┌─────────────────┐
│   AI Agent      │
│ (Claude/Copilot)│
└────────┬────────┘
         │
         │ MCP Protocol
         │
         ▼
┌─────────────────┐
│   MCP Server    │◀─── Your TypeScript Code
│  (TypeScript)   │
└────────┬────────┘
         │
         │ Validates & Routes
         │
         ▼
┌─────────────────┐
│ Authentication  │
│   Middleware    │
└────────┬────────┘
         │
         │ JWT/Token
         │
         ▼
┌─────────────────┐
│  MERN Backend   │
│   API Routes    │
└────────┬────────┘
         │
         │ Queries
         │
         ▼
┌─────────────────┐
│    MongoDB      │
│   Database      │
└─────────────────┘
```

### Connecting to MongoDB

**File: `src/database.ts`**

```typescript
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "sushi_restaurant";

let client: MongoClient;
let db: any;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.error("Connected to MongoDB");
  }
  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not connected");
  return db;
}
```

### Creating Database Tools

```typescript
import { getDB } from "./database.js";
import { ObjectId } from "mongodb";

server.addTool({
  name: "search_sushi",
  description: "Search for sushi items by name or category",
  inputSchema: z.object({
    query: z.string(),
    category: z.enum(["rolls", "sashimi", "nigiri", "all"]).default("all"),
    maxPrice: z.number().optional()
  }),
  handler: async ({ query, category, maxPrice }) => {
    const db = getDB();
    const collection = db.collection("sushi");
    
    const filter: any = {
      $text: { $search: query }
    };
    
    if (category !== "all") {
      filter.category = category;
    }
    
    if (maxPrice) {
      filter.price = { $lte: maxPrice };
    }
    
    const results = await collection
      .find(filter)
      .limit(10)
      .toArray();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2)
      }]
    };
  }
});
```

### Authentication and Security

**Important**: MCP servers should validate requests and respect your existing authentication system.

```typescript
import jwt from "jsonwebtoken";

server.addTool({
  name: "get_user_orders",
  description: "Get orders for a specific user (requires authentication)",
  inputSchema: z.object({
    token: z.string(), // JWT token
    limit: z.number().default(10)
  }),
  handler: async ({ token, limit }) => {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.userId;
      
      const db = getDB();
      const orders = await db.collection("orders")
        .find({ userId: new ObjectId(userId) })
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(orders, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: "Authentication failed" })
        }],
        isError: true
      };
    }
  }
});
```

---

## Advanced MCP Features

### 1. Resources for Static Data

Resources are ideal for documentation, schemas, or frequently accessed data:

```typescript
server.addResource({
  uri: "sushi://schema/menu",
  name: "Menu Schema",
  description: "JSON schema for sushi menu items",
  mimeType: "application/json",
  handler: async () => {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            price: { type: "number" },
            ingredients: { type: "array" }
          }
        })
      }]
    };
  }
});
```

### 2. Server-Sent Events for Real-Time Updates

MCP supports notifications and progress updates:

```typescript
server.addTool({
  name: "process_large_order",
  description: "Process a catering order (with progress updates)",
  inputSchema: z.object({
    items: z.array(z.object({
      sushi_id: z.string(),
      quantity: z.number()
    }))
  }),
  handler: async ({ items }, { progressToken }) => {
    for (let i = 0; i < items.length; i++) {
      // Process each item
      await processItem(items[i]);
      
      // Send progress notification
      if (progressToken) {
        await server.sendProgress({
          progressToken,
          progress: i + 1,
          total: items.length
        });
      }
    }
    
    return { content: [{ type: "text", text: "Order processed" }] };
  }
});
```

### 3. Error Handling

Always provide clear error messages:

```typescript
server.addTool({
  name: "delete_sushi_item",
  description: "Delete a sushi item from the menu (admin only)",
  inputSchema: z.object({
    sushi_id: z.string(),
    admin_token: z.string()
  }),
  handler: async ({ sushi_id, admin_token }) => {
    try {
      // Validate admin token
      const isAdmin = await validateAdminToken(admin_token);
      if (!isAdmin) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ error: "Unauthorized: Admin access required" })
          }],
          isError: true
        };
      }
      
      const db = getDB();
      const result = await db.collection("sushi").deleteOne({
        _id: new ObjectId(sushi_id)
      });
      
      if (result.deletedCount === 0) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ error: "Sushi item not found" })
          }],
          isError: true
        };
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: true, deleted_id: sushi_id })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: error.message })
        }],
        isError: true
      };
    }
  }
});
```

---

## Testing Your MCP Server

### 1. Using MCP Inspector

The MCP Inspector is a visual testing tool for MCP servers.

```powershell
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Run your server with inspector
npx @modelcontextprotocol/inspector tsx src/index.ts
```

This opens a web interface where you can:
- View all available tools, resources, and prompts
- Test tool invocations with sample inputs
- Inspect request/response payloads
- Debug errors in real-time

### 2. Automated Testing

**File: `tests/server.test.ts`**

```typescript
import { MCPServer } from "@modelcontextprotocol/server";
import { describe, it, expect } from "vitest";

describe("Sushi MCP Server", () => {
  it("should list menu items", async () => {
    const result = await server.callTool("get_menu", {});
    expect(result.content[0].text).toContain("California Roll");
  });
  
  it("should search sushi by category", async () => {
    const result = await server.callTool("search_sushi", {
      query: "spicy",
      category: "rolls"
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.length).toBeGreaterThan(0);
  });
});
```

---

## Connecting MCP to AI Clients

### Claude Desktop Configuration

**File: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)**  
**File: `%APPDATA%\Claude\claude_desktop_config.json` (Windows)**

```json
{
  "mcpServers": {
    "sushi-restaurant": {
      "command": "node",
      "args": ["d:/Source/GeorgianCollege/COMP2068-REACT/TS-MCPSERVER/dist/index.js"],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017",
        "JWT_SECRET": "your-secret-key"
      }
    }
  }
}
```

After configuration:
1. Restart Claude Desktop
2. Claude will automatically discover your server's tools
3. Ask Claude: "Show me the sushi menu" → Claude calls your `get_menu` tool

### VS Code Copilot Configuration & Testing

#### Step 1: Prepare Your MCP Server

First, ensure your MCP server is ready to run:

```powershell
# Navigate to your MCP server directory
cd TS-MCPSERVER

# Install dependencies if not already installed
npm install

# Test that the server runs without errors
npm run dev
# You should see: "Sushi Restaurant MCP Server running on stdio"
# Press Ctrl+C to stop
```

#### Step 2: Configure VS Code Settings

**Create/Update `.vscode/settings.json` in your workspace root:**

```json
{
  "github.copilot.chat.mcp.servers": {
    "sushi-restaurant": {
      "command": "tsx",
      "args": ["./TS-MCPSERVER/src/index.ts"],
      "cwd": "${workspaceFolder}",
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017",
        "JWT_SECRET": "your-secret-key"
      }
    }
  }
}
```

**Alternative: Using absolute paths (if tsx is not in PATH):**

```json
{
  "github.copilot.chat.mcp.servers": {
    "sushi-restaurant": {
      "command": "node",
      "args": [
        "--loader",
        "tsx",
        "d:/Source/GeorgianCollege/COMP2068-REACT/TS-MCPSERVER/src/index.ts"
      ],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017",
        "JWT_SECRET": "your-secret-key"
      }
    }
  }
}
```

#### Step 3: Restart VS Code

1. **Save** the `.vscode/settings.json` file
2. **Close** VS Code completely (not just the window)
3. **Reopen** your workspace
4. GitHub Copilot will automatically discover and load your MCP server

#### Step 4: Verify MCP Server is Connected

**Check the Output Panel:**

1. Open Output panel: `View` → `Output` (or `Ctrl+Shift+U`)
2. Select **"GitHub Copilot Chat"** from the dropdown
3. Look for messages like:
   ```
   [MCP] Connecting to server: sushi-restaurant
   [MCP] Server connected successfully
   ```

**Check for Errors:**

If you see errors, common issues include:
- `tsx` not installed: `npm install -g tsx`
- Incorrect file paths: Use absolute paths
- MongoDB not running: `mongod` or start MongoDB service

#### Step 5: Test with GitHub Copilot Chat

**Open GitHub Copilot Chat:**
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)
- Or click the chat icon in the sidebar

**Try these test queries:**

```
@workspace Show me the sushi menu

@workspace Search for spicy sushi rolls under $10

@workspace What are today's sushi specials?

@workspace Create an order for customer ID 12345 with California Roll and Dragon Roll
```

#### What Should Happen:

```
You: @workspace Show me the sushi menu

Copilot (thinking): 
  - User wants sushi menu
  - I have MCP tool: get_menu
  - Calling get_menu with no parameters

Copilot: Here's the current sushi menu:

**Rolls:**
- California Roll - $8.99
- Dragon Roll - $12.99
- Rainbow Roll - $14.99

Would you like to see a specific category or place an order?
```

#### Step 6: Debug MCP Server (if not working)

**Add logging to your MCP server:**

```typescript
// In src/index.ts, add logging
server.addTool({
  name: "get_menu",
  description: "Get the sushi restaurant menu",
  inputSchema: z.object({}),
  handler: async () => {
    // Add this line
    console.error("[MCP] get_menu tool called");
    
    // ... rest of handler
  }
});
```

**View logs in real-time:**

1. Open Output panel: `View` → `Output`
2. Select **"GitHub Copilot Chat"**
3. When you ask a question, you should see your `console.error` messages

**Common Issues & Solutions:**

| Problem | Solution |
|---------|----------|
| **MCP server not found** | Check `tsx` is installed globally: `npm install -g tsx` |
| **Path errors** | Use absolute paths in settings.json |
| **Tools not being called** | Make tool descriptions more specific and detailed |
| **MongoDB connection error** | Ensure MongoDB is running: `mongod` or `net start MongoDB` |
| **Permission errors** | Run VS Code as administrator (Windows) |
| **Server crashes** | Check for syntax errors, install all dependencies |

#### Step 7: Advanced Testing

**Test with specific tool names:**

```
@workspace Use the search_sushi tool to find rolls with avocado

@workspace Call get_menu with category "rolls"

@workspace Use create_order tool for customer 123
```

**Test error handling:**

```
@workspace Create an order with invalid data

@workspace Search for a sushi item that doesn't exist
```

**Test authentication (if implemented):**

```
@workspace Get user orders for token: eyJhbGciOiJIUzI1NiIs...
```

#### Example: Complete Interaction

```
User: @workspace I'm vegetarian and love avocado. What sushi do you recommend?

Copilot:
  [Internally calls: search_sushi({ query: "avocado", category: "rolls" })]
  [Filters results for vegetarian options]

  Great choices for a vegetarian avocado lover!

  🥑 **Avocado Roll** - $7.99
     Fresh avocado wrapped in sushi rice and nori

  🥒 **Cucumber Avocado Roll** - $8.49
     Light and refreshing with cucumber and avocado

  🥗 **Vegetable Tempura Roll** - $9.99
     Mixed vegetables with creamy avocado

  Would you like to place an order?

User: @workspace Yes, I'll take one Avocado Roll and one Cucumber Avocado Roll

Copilot:
  [Internally calls: create_order({ 
    customer_id: "guest",
    items: [
      { sushi_id: "avocado_roll", quantity: 1 },
      { sushi_id: "cucumber_avocado_roll", quantity: 1 }
    ]
  })]

  ✅ Order confirmed!

  **Order Details:**
  - Order ID: #ORD-2024-001
  - Items: 
    • 1x Avocado Roll ($7.99)
    • 1x Cucumber Avocado Roll ($8.49)
  - **Total: $16.48**
  - Estimated ready time: 15 minutes

  Your order has been sent to the kitchen!
```

#### Tips for Better MCP Integration:

1. **Write detailed tool descriptions** - Copilot uses these to decide when to call your tools
2. **Use consistent naming** - `get_`, `search_`, `create_` prefixes help Copilot understand intent
3. **Return structured JSON** - Makes it easier for Copilot to format responses
4. **Include error messages** - Help Copilot explain issues to users
5. **Add examples in descriptions** - "e.g., Toronto, Vancouver" helps Copilot with parameters

---

## Practical Project: Sushi Restaurant AI Assistant

### Project Overview

Build an MCP server that enables an AI agent to:
1. ✅ Browse the sushi menu
2. ✅ Search items by ingredients or dietary restrictions
3. ✅ Check daily specials
4. ✅ Create customer orders
5. ✅ Track order status
6. ✅ Recommend sushi based on preferences
7. ✅ Manage inventory (admin only)

### Tools to Implement

| Tool Name | Description | Input Parameters |
|-----------|-------------|------------------|
| `get_menu` | Retrieve full menu | `category?: string` |
| `search_sushi` | Search by keywords | `query: string, maxPrice?: number` |
| `check_specials` | Get today's specials | None |
| `create_order` | Place a new order | `items: array, customer_id: string` |
| `track_order` | Check order status | `order_id: string` |
| `recommend_sushi` | Get recommendations | `dietary_restrictions?: string, preferences?: object` |
| `update_inventory` | Update stock levels | `sushi_id: string, quantity: number, admin_token: string` |

### Sample Interaction

```
User: "I'm vegetarian and love avocado. What do you recommend?"

Agent (thinking):
1. Call tool: recommend_sushi({ dietary_restrictions: "vegetarian", preferences: { loves: ["avocado"] } })
2. Format the response naturally

Agent: "Based on your preferences, I recommend:
- Avocado Roll ($7.99) - Fresh avocado with sushi rice
- Cucumber Avocado Roll ($8.49) - Light and refreshing
- Vegetable Tempura Roll ($9.99) - Mixed vegetables with avocado

Would you like to place an order?"

User: "Yes, I'll take the Avocado Roll and Cucumber Avocado Roll"

Agent (thinking):
1. Call tool: create_order({ customer_id: "user123", items: [...] })
2. Confirm the order

Agent: "Perfect! I've placed your order for:
- 1x Avocado Roll ($7.99)
- 1x Cucumber Avocado Roll ($8.49)
Total: $16.48

Your order ID is #12345. Estimated ready time: 15 minutes."
```

---

## Deployment Considerations

### 1. Security Checklist

- ✅ Validate all inputs with Zod schemas
- ✅ Implement JWT authentication for sensitive operations
- ✅ Rate limit tool calls to prevent abuse
- ✅ Use environment variables for secrets
- ✅ Sanitize database queries to prevent injection
- ✅ Log all tool invocations for audit trails

### 2. Performance Optimization

```typescript
// Cache frequently accessed data
const menuCache = new Map<string, any>();

server.addTool({
  name: "get_menu_cached",
  description: "Get menu with caching",
  inputSchema: z.object({}),
  handler: async () => {
    const cacheKey = "menu_all";
    
    if (menuCache.has(cacheKey)) {
      return { content: [{ type: "text", text: menuCache.get(cacheKey) }] };
    }
    
    const db = getDB();
    const menu = await db.collection("sushi").find().toArray();
    const serialized = JSON.stringify(menu);
    
    menuCache.set(cacheKey, serialized);
    setTimeout(() => menuCache.delete(cacheKey), 60000); // Cache for 1min
    
    return { content: [{ type: "text", text: serialized }] };
  }
});
```

### 3. Cost Management

Agent interactions can consume many tokens. Optimize by:
- Returning concise, structured data
- Using resources for static documentation
- Implementing pagination for large datasets
- Setting reasonable limits on queries

```typescript
const MAX_RESULTS = 20; // Limit search results

server.addTool({
  name: "search_sushi_limited",
  description: `Search sushi (max ${MAX_RESULTS} results)`,
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().max(MAX_RESULTS).default(10)
  }),
  handler: async ({ query, limit }) => {
    const results = await db.collection("sushi")
      .find({ $text: { $search: query } })
      .limit(limit)
      .toArray();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          results,
          total_count: results.length,
          max_results: MAX_RESULTS
        })
      }]
    };
  }
});
```

---

## Best Practices

### 1. Tool Design

✅ **Do:**
- Give tools clear, action-oriented names (`create_order`, not `order`)
- Write detailed descriptions (agents use these to decide when to call tools)
- Use strict input validation with Zod schemas
- Return structured JSON responses
- Include helpful error messages

❌ **Don't:**
- Create overlapping or duplicate tools
- Return massive payloads (paginate instead)
- Expose admin functions without authentication
- Use ambiguous parameter names

### 2. Description Writing

The tool description is critical — it's how the agent decides when to use your tool.

**Bad:**
```typescript
description: "Gets sushi"
```

**Good:**
```typescript
description: "Retrieves sushi menu items filtered by category (rolls, sashimi, nigiri) and optional maximum price. Returns name, description, price, and ingredients for each item."
```

### 3. Error Handling Patterns

```typescript
try {
  // Operation
  return { content: [{ type: "text", text: result }] };
} catch (error) {
  if (error instanceof ValidationError) {
    return {
      content: [{ type: "text", text: `Validation failed: ${error.message}` }],
      isError: true
    };
  }
  
  if (error instanceof AuthenticationError) {
    return {
      content: [{ type: "text", text: "Authentication required" }],
      isError: true
    };
  }
  
  // Generic error
  return {
    content: [{ type: "text", text: `Unexpected error: ${error.message}` }],
    isError: true
  };
}
```

---

## Real-World Use Cases Beyond Restaurants

### 1. Database Admin Assistant
- Natural language database queries
- Schema exploration and documentation
- Index optimization suggestions
- Query performance analysis

### 2. Customer Support Agent
- Order tracking and updates
- Return/refund processing
- Product recommendations
- FAQ automation

### 3. Development Assistant
- Code generation from specifications
- Automated testing and debugging
- Documentation generation
- CI/CD pipeline management

### 4. Data Analysis Agent
- SQL query generation
- Chart and visualization creation
- Statistical analysis
- Report generation

---

## Additional Resources

### Official Documentation
- **MCP Specification**: [https://spec.modelcontextprotocol.io/](https://spec.modelcontextprotocol.io/)
- **MCP Website**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)
- **Getting Started Guide**: [https://modelcontextprotocol.io/docs/getting-started/intro](https://modelcontextprotocol.io/docs/getting-started/intro)
- **TypeScript SDK**: [https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- **SDK Documentation**: [https://modelcontextprotocol.io/docs/sdk](https://modelcontextprotocol.io/docs/sdk)
- **API Reference**: [https://ts.sdk.modelcontextprotocol.io/](https://ts.sdk.modelcontextprotocol.io/)
- **IBM Technology Channel**: [https://www.youtube.com/@IBMTechnology](https://www.youtube.com/@IBMTechnology)

### Community & Examples
- **Example Servers**: [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- **MCP Clients**: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)
- **SDK Tiering System**: [https://modelcontextprotocol.io/community/sdk-tiers](https://modelcontextprotocol.io/community/sdk-tiers)

### Other Language SDKs
- **Python SDK**: [https://github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)
- **C# SDK**: [https://github.com/modelcontextprotocol/csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk)
- **Go SDK**: [https://github.com/modelcontextprotocol/go-sdk](https://github.com/modelcontextprotocol/go-sdk)
- **Java SDK**: [https://github.com/modelcontextprotocol/java-sdk](https://github.com/modelcontextprotocol/java-sdk)

---

## Homework Assignment

### Part 1: Build Your MCP Server (Core)
Create an MCP server for the sushi restaurant with these required tools:
1. `get_menu` - List all sushi items
2. `search_sushi` - Search with filters (category, price range)
3. `create_order` - Place a new order

**Deliverables:**
- Working MCP server in TypeScript
- MongoDB integration
- Input validation with Zod
- README with setup instructions

### Part 2: Advanced Features (Stretch Goals)
Add any TWO of these:
- User authentication with JWT
- Order recommendation system based on past orders
- Inventory management tools
- Real-time order status notifications
- Admin tools (analytics, reports)

### Part 3: Client Integration
Configure your MCP server to work with either:
- Claude Desktop, OR
- VS Code Copilot, OR
- Custom client using `@modelcontextprotocol/client`

**Submission:**
- GitHub repository with code
- Video demo showing agent interactions
- Brief report (500 words) on challenges and learnings

---

## Key Takeaways

1. **Agentic AI** enables autonomous multi-step workflows, different from simple chatbots
2. **MCP** standardizes how AI agents connect to external systems (databases, APIs, tools)
3. **MCP Servers** expose **Tools** (actions), **Resources** (data), and **Prompts** (templates)
4. Building MCP servers requires careful **tool design**, **authentication**, and **error handling**
5. MCP is **ecosystem-agnostic** — build once, use with Claude, ChatGPT, VSCode, Cursor, and more
6. Always consider **security, cost, and performance** when deploying AI agents in production

---

**Next Steps:**
- Review the TypeScript SDK documentation
- Explore example MCP servers on GitHub
- Start building your sushi restaurant MCP server
- Test with MCP Inspector
- Integrate with an AI client (Claude/Copilot)

Good luck building your agentic AI system! 🍣🤖
