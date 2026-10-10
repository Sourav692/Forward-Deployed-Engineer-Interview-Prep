# Tool Selection at Scale

*Advertising every tool feels complete, but each extra option makes the agent worse at picking the right one.*

◷ 3 min

More tools do not make an agent more capable past a point. Collapse and filter the tool surface first, and add retrieval only once the surface is still too large.

**Objectives:**

- explain why tool accuracy falls as the tool count rises;
- choose between filtering, namespacing, retrieval and hierarchical routing;
- answer the "200 tools" design question in the right order.

---

## Shrink the Choice Before Improving the Chooser

Every tool the agent sees competes for a fixed attention budget. The more near-identical options it must tell apart, the worse it gets at choosing. So the first lever is fewer, clearer choices, not a smarter selector.

Suppose the support agent has 200 internal APIs behind it. Four strategies keep it accurate.

| What problem are you solving? | Strategy | Extra latency | Use when |
|---|---|---|---|
| Is the agent shown tools this caller cannot use? | Principal filtering | None | Always |
| Are there ten near-duplicate tools for one job? | Namespacing: one façade tool with an `operation` enum | None | Many similar operations |
| Is the list still too long after that? | Retrieval: embed descriptions, pull the top-k for this request | 20 to 60 ms | More than about 40 tools |
| Do domains hold genuinely different data? | Hierarchical routing: a small router picks the domain, then the tool | One small extra call | Distinct domains |

## Split Façades by Permission, Not by Service

A façade groups operations. Group them by who is allowed to do what, not by which backend service they hit. Never put a read and a write behind the same façade. A façade that mixes them forces the permission check to happen inside the call rather than before the model ever sees the option.

## Measure Selection and Arguments Separately

Track two numbers. Did the agent pick the right tool? Did it fill in the right arguments? Consolidating tools behind façades tends to improve the first and can quietly hurt the second, because an `operation` enum adds one more argument to get right. A single success rate hides that trade.

> **Warning: the filtered list is not the permission check.** Showing the agent only the tools a caller may use reduces confusion. It does not enforce anything. Always check the real user's permissions on the server.

## Worked Example: The 200-Tools Question

"Your agent has 200 internal tools. How do you keep it accurate?" This is a stock design prompt. Most candidates jump straight to embedding the tool descriptions. That skips the part that shows judgement.

Start by collapsing the surface. Group reads behind scope-based façades; this typically brings 200 tools down to 20 to 40. Filter that list by who is calling. Only if it is still past about 40 tools, add retrieval to pull the most relevant ones per request. Pin a couple of tools so they are always visible, such as `clarify` and `escalate`, so the agent is never left with nothing useful to call. And check the real user's permissions server-side on every call.

The order matters. Retrieval is a patch for a large surface; façades and filtering remove the surface. Answering in that order shows the difference.

---

## Key Takeaways

- Accuracy falls as the agent chooses among more similar tools, so reduce the choice first.
- Filter by caller always, namespace near-duplicates, add retrieval past about 40 tools, and route by domain when data differs.
- Split façades by permission, and never put a read and a write behind one façade.
- Measure tool choice and argument correctness separately, because consolidation can trade one for the other.

## Check Yourself

1. **Why does adding tools eventually make an agent worse?**
   It must tell apart more similar options within a fixed attention budget, so selection accuracy drops.

2. **Why keep `clarify` and `escalate` pinned whatever the filter returns?**
   So the agent always has a useful move, even when no domain tool fits the request.

3. **When does retrieval over tool descriptions earn its 20 to 60 ms?**
   Only once the surface is still above about 40 tools after façades and principal filtering.

