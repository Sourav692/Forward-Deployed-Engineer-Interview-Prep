# Define the API Contract With Typed Schemas

*Strict schemas reject some requests a lenient API would accept, but every bad request stopped at the door is a model call nobody pays for.*

◷ 4 min

Validation is not politeness; it is the cheapest cost control an LLM API has. Check the shape and size of every request before it reaches the model, and promise clients one response shape, building on the `models/schemas` layer from [Structure the Service and Decide What to Build](02_Structure_the_Service_and_Decide_What_to_Build.md).

**Objectives:**

- validate prompts and uploaded files with Pydantic before any model call;
- enforce request size, input tokens and output tokens with the right HTTP status;
- design one response schema that carries text, citations, tool results and metadata.

---

## Validate Early, Before the Expensive Call

A request that will fail should fail before it costs anything. An LLM call is the most expensive step in the request, so the checks belong in front of it.

For text prompts, use Pydantic models with limits: a minimum and maximum length, a range for `max_tokens` and a range for `temperature`. Add a `field_validator` that rejects whitespace-only prompts.

For file uploads (`UploadFile`), check the content type (PDF, CSV or text) and the file size before processing. Return a 400 error if either fails.

## Count Size and Tokens at the Door

Three limits stop runaway requests, and each has its own status code.

| The worry | The check | The answer |
|---|---|---|
| Is the body absurdly large? | Request-size middleware reading `content-length` (for example a 10 MB limit) | HTTP 413 |
| Will the prompt overflow or cost too much? | Count tokens with `tiktoken`, wrapped as a FastAPI dependency | HTTP 400 with the counted tokens and the limit |
| Could the answer run long? | Always pass `max_tokens`: the smaller of what the user asked and a hard maximum from config | Output capped at the call |

Counting tokens up front means nobody pays for a call that would fail anyway. The output ceiling matters just as much. A provider bills for output too, so an uncapped answer is an uncapped cost.

> **Warning: never trust the client's `max_tokens`.** Always send the smaller of the user's request and the configured hard maximum. A client that asks for the most tokens on every call is one of the abuse patterns in [Protect the Endpoint From Abuse and Cost](04_Protect_the_Endpoint_From_Abuse_and_Cost.md).

## Promise One Response Shape

A RAG or agent answer is more than text. It has citations, tool results and run metadata. Clients break when that shape changes from call to call. So define one unified response schema, in Pydantic, and always return it.

The source lists its fields. Identify the reply with a `response_id` and a `session_id`. Carry ordered `content_blocks`: text pieces with inline references to citations and tool results. Add a plain `full_text` for simple clients. List the `citations`, each with document id, title, section, relevance score and excerpt. List the `tool_outputs`, each with tool name, input, output and execution time. Close with `metadata`: model, input and output tokens, latency, retrieval score and faithfulness score.

Simple clients read `full_text`. Rich clients use `content_blocks` to draw inline citations. Both read the same schema.

## Worked Example: A Contract Question With an Attachment

A user uploads a scanned contract larger than the 10 MB limit and asks a question about it.

The size middleware reads `content-length`, sees the body is over the limit, and returns 413. No parsing, no embedding, no model call.

The user compresses the file below the limit and retries. The upload check confirms a PDF content type and an acceptable size. The prompt passes the Pydantic model: it is not whitespace, and its length and `temperature` are in range. The token dependency counts the prompt plus retrieved context and finds it under the limit. The call goes out with `max_tokens` set to the configured ceiling, because the user asked for more.

The reply comes back in the unified schema. Its `full_text` answers the question. Its `citations` point to the clause, and its `metadata` records tokens, latency and faithfulness. Each check ran before money was spent, and the client knew the answer's shape before asking.

---

## Key Takeaways

- Validate prompts and uploads with Pydantic before any model call, so bad requests cost nothing.
- Reject oversized bodies with 413, over-long prompts with 400, and always cap output with `max_tokens`.
- Return one unified response schema with `content_blocks`, `full_text`, `citations`, `tool_outputs` and `metadata`.

## Check Yourself

1. **What should a Pydantic prompt model check?**
   Minimum and maximum length, the allowed `max_tokens` and `temperature` ranges, and, through a `field_validator`, that the prompt is not whitespace only.

2. **Which status codes reject an oversized body and an over-long prompt?**
   413 from the request-size middleware for the body; 400 with the counted tokens and the limit for the prompt.

3. **Why include both `full_text` and `content_blocks` in the response?**
   Simple clients read `full_text`; rich clients use the ordered `content_blocks` to render inline citations and tool results. One schema serves both.

## References

**Sources:** `Module_10_Backend_FastAPI_Deployment.md` (GenAI Engineering Modules): FastAPI Architecture, "How do I validate prompts and uploaded files?"; LLM Serving APIs, "How do I structure a response that has text, citations and tool results?" and "How do I enforce token and request size limits at the API?".
