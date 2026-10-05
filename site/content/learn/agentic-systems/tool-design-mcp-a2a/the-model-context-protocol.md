# The Model Context Protocol

*A shared protocol saves writing one integration per pair of app and tool, but it also connects systems that were never meant to share data.*

◷ 5 min

The Model Context Protocol (MCP) is not just "a way to plug in tools". Explain it by who controls each kind of capability, then check the two ways it quietly weakens security.

**Objectives:**

- explain why a shared protocol turns multiplication into addition;
- name MCP's three primitives by who controls them;
- choose a transport, and name the confused-deputy and cross-server risks.

---

## Turn Multiplication Into Addition

Without a shared protocol, every app writes its own integration for every tool. Five apps and ten tools means 5 × 10 = 50 custom integrations. MCP changes the count. Each app runs a client. Each tool runs a server. The same setup now needs 5 + 10 = 15 pieces. The gap widens as either side grows.

MCP hands an agent three things through one client-server language: its tools, its data and its prompt templates.

## Name the Primitives by Who Is in Control

The three primitives differ in who decides to use them.

| Who decides? | Primitive | Example |
|---|---|---|
| The model, during its reasoning | Tool, which may have side effects | `issue_refund` |
| The host app, addressed by a URI, with no side effects | Resource | A policy document |
| The user, on purpose | Prompt | A slash command |

Mixing them up has a cost. Expose a large document library as a tool and the model calls it again and again with slightly different queries, burning budget. Expose it as a resource and the host controls what enters context. An answer framed by control shows understanding; "a way to plug in tools" is a buzzword.

## Pick the Transport by Who Shares the Server

There are two transports. **stdio** runs the server as a subprocess with no network. That suits one developer's laptop. **Streamable HTTP** runs it as a real network service, which needs real authentication. Once more than one person or team shares a server, streamable HTTP is the only sensible choice.

## Close the Two Security Gaps

The first gap is the **confused deputy**. An MCP server runs with its own credentials, usually broader than any one user's. A server cannot respect a user's limits it was never told about. Pass the real user's identity through, and check it on the server. Otherwise the agent can do anything any user could do, for any user.

The second is **cross-server data flow**. Connect one client to a private customer-data server and another to a public web-search server, and a leak path exists: private data comes in, public egress goes out. Keep servers in different trust domains on separate clients.

> **Warning: the server's credentials are not the user's.** A server that acts with its own broad identity turns every user into a superuser by proxy. Check the end user's permissions server-side on every call.

## Know What the Sources Do Not Cover

This module's title also names A2A, the agent-to-agent protocol. None of the repository sources for this module teach it, so this lesson does not describe it. The module page marks it as a known gap.

## Worked Example: Two Servers for the Support Agent

The support agent's runtime hosts two MCP clients. One connects over stdio to an orders server during local development. The other connects over streamable HTTP to a warehouse server that several teams share.

The refund policy document is exposed as a resource, so the host decides when it enters context. `issue_refund` is a tool, because the model must decide when to call it. A "summarise this ticket" template is a prompt, invoked by the support person.

The warehouse server receives each end user's identity and checks it before acting. Later, a team proposes adding a public web-search server to the same client that holds customer data. That would build the leak path, so it goes on a separate client in its own trust domain.

Each decision followed one question: who controls this, and whose permissions apply? That is the part of MCP an interview probes.

---

## Key Takeaways

- A shared protocol turns N × M integrations into N + M pieces.
- Tools are chosen by the model, resources by the host app, and prompts by the user; mixing them wastes budget or leaks control.
- Use stdio for one developer and streamable HTTP, with real authentication, once a server is shared.
- Pass the end user's identity through and check it server-side, and keep different trust domains on separate clients.
- The sources do not cover the A2A protocol.

## Check Yourself

1. **Five apps and ten tools: how many integrations without MCP, and how many pieces with it?**
   Fifty custom integrations without it; fifteen pieces with it, five clients and ten servers.

2. **Why expose a large document library as a resource rather than a tool?**
   As a tool, the model calls it repeatedly with slightly different queries and burns budget. As a resource, the host decides what enters context.

3. **What is the confused-deputy risk in MCP?**
   The server acts with its own broad credentials. Unless the real user's identity is passed through and checked server-side, the agent can act for any user with any user's rights.

## References

**Sources:** `ch05_tool_use_agent_computer_interface.md` (*Cracking Agentic AI System Design Interviews*, Ch. 5: "The Model Context Protocol (MCP)", including its note on two ways MCP weakens security, summarised in our own words). No repository source covers the A2A protocol.
