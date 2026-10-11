# Build a Streaming Chat Endpoint

*Streaming makes an answer feel faster without making it faster, and the price is that once the first token leaves, the response can no longer change its mind.*

Streaming fixes perceived latency, not total latency: generation takes exactly as long either way. Decide whether to answer before the first token, carry errors inside the stream, and keep the conversation on the server, using the contract from [Define the API Contract With Typed Schemas](/learn/engineering-foundations/apis-and-backend/define-the-api-contract-with-typed-schemas).

**Objectives:**

- choose between Server-Sent Events and WebSockets for a chat feature;
- build a streaming endpoint that reports errors and survives a proxy;
- keep multi-turn conversation state on the server within a context budget.

---

## Stream to Cut Perceived Latency, Not Total Latency

Returning the complete answer in one shot is simplest. Streaming tokens as they are generated changes when the user sees the *first* token, not when they see the *last*. Generation takes exactly as long.

So streaming matters most for interactive chat and much less for an asynchronous reply with minutes to spare. That makes it a channel-layer decision. The retrieve-and-answer pipeline does not change. Only the final step streams, and only when the channel asking for it is interactive.

## Choose the Transport by Direction

Two transports exist, and the choice turns on direction.

**Server-Sent Events (SSE)** is a one-way stream from server to client, built with `StreamingResponse`. It is simple and well suited to streaming text. Each message looks like `data: {"token": "Hello"}`.

**WebSockets** are two-way, suited to chat apps and real-time interfaces. The server accepts the connection, then loops: receive a prompt, send tokens back as they arrive.

The source's image is a good one: SSE is a one-way radio broadcast, a WebSocket is a phone call.

## Send Errors Inside the Stream

A streaming chat endpoint uses `StreamingResponse` with the media type `text/event-stream`. It sends small JSON events: a **token** event for each piece of text, a **done** event at the end, and an **error** event if something fails.

Errors need their own event for a structural reason. An HTTP response sends its status code before its body. Once streaming has started, the status code is already on the wire and cannot change. A failure halfway through has to travel inside the stream.

Two headers matter. Set `Cache-Control: no-cache`, and set `X-Accel-Buffering: no`. The second stops nginx from buffering the response, which would collect every token and defeat streaming. After the stream ends, save the full reply to conversation history.

## Decide Whether to Answer Before the First Token

Some pipelines include a check such as "do I have enough evidence to answer?". The FDE Handbook's RAG graph calls it the `grade` node. That decision must happen *before* the first token.

A partially streamed answer that is then retracted is a worse experience than a clean refusal up front. So streaming applies only to the final synthesis step, after "should I answer at all" is settled.

> **Warning: a retracted stream is worse than a refusal.** Once tokens reach the user, they have read them. Run the "can I answer?" check first, then stream; never stream first and grade afterwards.

## Keep the Conversation on the Server

Multi-turn chat needs history. There are two choices. With **client-side state**, the client sends the whole history each time. With **server-side state**, the server stores the history and the client sends only a session ID. Server-side is usually recommended.

Store the session in Redis under a key such as `session:{id}`, with a time-to-live, for example one hour. Each message follows the same steps: load the session, add the user message, trim to a context budget, call the LLM, save the answer.

**Context budget trimming** keeps the request inside the model's token limit. Always keep the system prompt and the newest message. Fill the rest with the most recent history that fits.

## Worked Example: One Turn of a Support Chat

A user on a support page sends "And what about the EU?" with session ID `abc`.

The endpoint loads `session:abc` from Redis and appends the new message. The history is long, so trimming keeps the system prompt and this message, then adds recent turns until the token budget is full. Older turns drop out.

Retrieval runs and the grade check passes: there is evidence for an answer. Only now does the endpoint open a `text/event-stream` response with `X-Accel-Buffering: no`. Token events flow to the browser, and the first words appear almost at once.

Midway, the provider times out. The status was 200 when the stream began and cannot change, so the endpoint sends an error event and the client shows a clear message. On the next turn, which completes, a done event closes the stream and the full reply is saved to the session. Every design choice here follows from one fact: a stream cannot take back what it has already sent.

---

## Key Takeaways

- Streaming lowers perceived latency only; it is a channel decision applied to the final step.
- Use SSE for one-way token streams and WebSockets for two-way, real-time interaction.
- Send token, done and error events, set `Cache-Control: no-cache` and `X-Accel-Buffering: no`, and save the full reply afterwards.
- Decide whether to answer before the first token, because retracting a streamed answer is worse than refusing.
- Keep sessions server-side in Redis with a TTL, and trim to a context budget that always keeps the system prompt and the newest message.

## Check Yourself

1. **Does streaming reduce total latency?**
   No. Generation takes as long; streaming changes when the first token appears. It matters most for interactive chat.

2. **Why must a streaming endpoint send errors as events?**
   The HTTP status code is sent before streaming starts and cannot change afterwards, so a mid-stream failure has to travel inside the stream.

3. **What does context budget trimming always keep?**
   The system prompt and the newest message; the rest is filled with the most recent history that fits the token limit.

