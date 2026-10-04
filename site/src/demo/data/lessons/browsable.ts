/**
 * Sample lesson bodies for the browsable (not in-depth) modules of the /demo
 * prototype. They show the house lesson shape and tone; they are not final curriculum.
 */
import type { Lesson } from '../../types'

export const LESSONS_BROWSABLE: Lesson[] = [
  // ── T0.1 How the platform works and choosing a path ─────────────────────
  {
    id: 't0-1-l1',
    moduleId: 't0-1',
    order: 1,
    title: 'Choosing a Path',
    tagline: 'A fixed path buys focus at the cost of skipping material you might later wish you had read.',
    readingMin: 4,
    objectives: [
      'Match your starting point to a learning path',
      'Estimate weekly hours against the path total',
      'Know when to switch paths',
    ],
    sections: [
      {
        heading: 'Start from your gap, not from the first page',
        body: 'Each path sequences tracks for one kind of learner: a backend engineer moving into applied AI, a data scientist moving towards delivery, or someone preparing for a specific interview loop. Pick the path whose starting point sounds like you, then look at its required modules. Optional modules are there for depth, not for completion.',
      },
      {
        heading: 'Plan hours before you plan topics',
        body: 'Divide the path estimate by the hours you can honestly give each week. If the result is longer than your interview timeline, mark recommended modules as later and keep only required ones. The dashboard recalculates your finish date as you go, so an early, realistic number is more useful than an optimistic one.',
      },
    ],
    workedExample: {
      title: 'Fitting a path into five weeks',
      body: 'A backend engineer has five weeks before an onsite loop and can study 8 hours a week, so 40 hours in total. The applied AI path estimates 62 hours, of which 38 are required modules. She keeps the required modules, adds two recommended retrieval modules worth 4 hours, and defers the rest. Her plan totals 42 hours, leaving one buffer evening per week for mock interviews.',
    },
    warning: 'Reading everything in order instead of following a path is the most common way to run out of time. The material is a library; the path is your reading list.',
    takeaways: [
      'Choose the path that matches where you start, not where you want to end.',
      'Fit the path to your weekly hours before starting.',
      'Optional modules are for depth after the required ones are done.',
    ],
    checkYourself: [
      'Which path matches your current role and target role?',
      'How many hours a week can you commit, honestly?',
      'Which recommended modules would you defer first?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },
  {
    id: 't0-1-l2',
    moduleId: 't0-1',
    order: 2,
    title: 'How to Study Each Mode',
    tagline: 'Active practice costs more effort per hour than reading but is what moves interview performance.',
    readingMin: 5,
    objectives: [
      'Distinguish lessons, exercises, checkpoints and mocks',
      'Use self-rating and review to schedule revision',
      'Know when a module is genuinely done',
    ],
    sections: [
      {
        heading: 'Read briefly, then practise immediately',
        body: 'Lessons are short on purpose. Read one, answer its three check questions without looking, then do the module exercise. Checkpoints test whether you can apply the idea to a new scenario. Mock interviews test whether you can do it aloud, under time, with follow-up questions. Each mode exercises a different skill, so skipping one leaves a gap the others do not cover.',
      },
      {
        heading: 'Rate your confidence and let it decay',
        body: 'After each module, rate your confidence from one to five. Ratings fade by a level every three weeks without review, which surfaces topics that need revisiting before your interview. Treat a low rating as a scheduling signal, not a judgement. The review queue on the dashboard is built from these ratings.',
      },
    ],
    workedExample: {
      title: 'A typical study evening',
      body: 'In a 90-minute session, a learner reads two lessons in 15 minutes, answers the six check questions in 10, spends 40 minutes on the module exercise, and uses the last 25 minutes to retake a checkpoint failed the previous week. Over four weeks of this pattern, her checkpoint pass rate rose from 55 to 85 percent while reading time stayed at about a sixth of the total.',
    },
    warning: 'Marking modules complete after reading alone gives a false sense of progress. A module is done when its checkpoint is passed and the exercise has been self-scored against the rubric.',
    takeaways: [
      'Reading is the smallest part of each study session.',
      'Each mode tests a different skill, from recall to spoken performance.',
      'Confidence ratings drive what you revise next.',
    ],
    checkYourself: [
      'What does a mock interview test that a checkpoint does not?',
      'Why do confidence ratings decay over time?',
      'What makes a module genuinely complete?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },

  // ── T0.2 The FDE role ───────────────────────────────────────────────────
  {
    id: 't0-2-l1',
    moduleId: 't0-2',
    order: 1,
    title: 'What a Forward Deployed Engineer Does',
    tagline: 'Working inside the customer buys faster learning about real problems at the cost of constant context switching.',
    readingMin: 5,
    objectives: [
      'Describe the FDE role in one accurate sentence',
      'Name the outputs an FDE is accountable for',
      'Explain the typical engagement cadence',
    ],
    sections: [
      {
        heading: 'Define the role by its outputs',
        body: 'A forward deployed engineer builds working software inside a customer environment to solve a specific business problem, then feeds what they learn back to the product team. The outputs are shipped code, a measured outcome for the customer and product feedback. Meetings and slides support those outputs; they are not the job.',
      },
      {
        heading: 'Expect a short, repeating cadence',
        body: 'Engagements usually move through discovery, a scoped first build, measurement and expansion, often within weeks rather than quarters. An FDE may spend the morning debugging a data pipeline and the afternoon presenting results to a director. Comfort with that switch, and with ambiguity about what to build first, is part of the role.',
      },
    ],
    workedExample: {
      title: 'One engagement in numbers',
      body: 'At a regional insurer, an FDE spends week one interviewing six claims handlers and pulling 500 sample claims. Weeks two and three produce a document triage tool that routes incoming files to the right queue. By week four the tool handles 70 percent of files with 95 percent routing accuracy, saving about 12 handler-hours a day. The FDE also files three product requests for connector features the customer needed.',
    },
    warning: 'Describing the FDE as a "consultant who codes" undersells the engineering bar and the product feedback loop. Interviewers listen for ownership of shipped software and measured outcomes.',
    takeaways: [
      'The FDE ships code inside the customer and owns the outcome.',
      'Product feedback is a core output, not a side task.',
      'Expect short cycles and frequent switches between technical and customer work.',
    ],
    checkYourself: [
      'What three outputs is an FDE accountable for?',
      'How would you describe the role in one sentence to a friend?',
      'Why does the product feedback loop matter to the employer?',
    ],
    referenceIds: ['ref-mom-test', 'ref-canonical-handbook'],
  },
  {
    id: 't0-2-l2',
    moduleId: 't0-2',
    order: 2,
    title: 'FDE, Software Engineer and Solutions Roles Compared',
    tagline: 'Each role trades depth in one system for breadth across customers in a different proportion.',
    readingMin: 5,
    objectives: [
      'Contrast FDE with product SWE and solutions engineering',
      'Identify which interview rounds test which differences',
      'Position your own background against the FDE bar',
    ],
    sections: [
      {
        heading: 'Compare on who you build for and how long',
        body: 'A product software engineer builds for many users through one codebase over a long horizon. A solutions engineer supports sales with demos, integrations and technical answers, usually before a contract. An FDE builds production systems for one customer at a time, after a contract, with direct responsibility for the outcome. The overlap is real, but the accountability differs.',
      },
      {
        heading: 'Map the differences to interview rounds',
        body: 'Because the role mixes engineering and customer work, interview loops usually include coding, system design, a customer or discovery round and behavioural questions about ambiguity and ownership. Engineers from product teams tend to need practice on discovery; people from solutions roles tend to need practice on production-grade design.',
      },
    ],
    workedExample: {
      title: 'The same problem, three roles',
      body: 'A logistics customer wants delivery exceptions summarised for its 15-person operations desk. A solutions engineer builds a two-day demo on sample data to support the deal. A product engineer adds a general summarisation feature used by 400 customers over a quarter. An FDE connects to the customer\'s live exception feed, ships a tool in three weeks, and measures that the desk resolves exceptions 20 percent faster.',
    },
    warning: 'Candidates often describe their background in the language of the role they are leaving. Translate your stories into FDE terms: customer problem, what you shipped, and the measured result.',
    takeaways: [
      'The roles differ mainly in who you build for and what you own.',
      'FDE loops test both engineering depth and customer judgement.',
      'Know which side of the bar your background needs to strengthen.',
    ],
    checkYourself: [
      'How does an FDE differ from a solutions engineer after the contract is signed?',
      'Which interview round is likely hardest for a product engineer?',
      'How would you reframe one of your past projects in FDE terms?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },

  // ── T0.3 The first ten minutes of any design question ───────────────────
  {
    id: 't0-3-l1',
    moduleId: 't0-3',
    order: 1,
    title: 'Clarify Before You Draw',
    tagline: 'Spending three minutes on questions delays the first box but prevents designing the wrong system.',
    readingMin: 5,
    objectives: [
      'Ask the four clarifying questions that shape most designs',
      'Restate the problem in one sentence',
      'Recognise when you have enough to proceed',
    ],
    sections: [
      {
        heading: 'Ask who, what, how much and how bad',
        body: 'Open with who the users are, what decision or task the system supports, how much load and data to expect, and how bad a wrong answer would be. Those four answers set scale, latency targets and the strictness of evaluation. Ask them before naming any component, and write the answers where the interviewer can see them.',
      },
      {
        heading: 'Restate the problem and confirm it',
        body: 'Summarise what you heard in one sentence and ask whether it is right: "So we are building an assistant for 200 claims handlers that drafts responses from policy documents, and a wrong answer costs a complaint, not a lawsuit." This checks understanding, shows structure, and gives the interviewer a chance to add constraints they were holding back.',
      },
    ],
    workedExample: {
      title: 'Three minutes that changed the design',
      body: 'A candidate is asked to design a document Q&A system. By asking about scale, she learns the corpus is 3,000 documents and usage is 50 queries an hour, which removes any need for distributed infrastructure. By asking about error cost, she learns answers go to regulators, which makes citations and human review mandatory. Both facts reshape the design more than any component choice would.',
    },
    warning: 'Architecting before asking is the most common opening mistake. A polished design for the wrong scale or risk level scores worse than a modest design for the right one.',
    takeaways: [
      'Ask about users, task, scale and error cost first.',
      'Restate the problem in one sentence and confirm it.',
      'Clarification often removes whole components from the design.',
    ],
    checkYourself: [
      'What are the four opening questions?',
      'Why restate the problem aloud?',
      'How do you know when to stop asking and start designing?',
    ],
    referenceIds: ['ref-mom-test', 'ref-ddia'],
  },
  {
    id: 't0-3-l2',
    moduleId: 't0-3',
    order: 2,
    title: 'Scope the Problem and Name the Metric',
    tagline: 'Committing to a narrow first scope gives up coverage in exchange for a design you can finish and defend.',
    readingMin: 5,
    objectives: [
      'Cut the problem to a first version you can design in the time',
      'Choose one primary success metric and one guardrail',
      'Say the metric out loud before the architecture',
    ],
    sections: [
      {
        heading: 'Cut the scope out loud',
        body: 'Most design prompts are too large for 45 minutes. State what you will cover and what you will park: "I will design the question-answering path for text documents and park scanned images and multilingual support." Interviewers reward a clear cut because it mirrors how a real first release is scoped.',
      },
      {
        heading: 'Say the metric out loud first',
        body: 'Name one primary metric tied to the user outcome, such as answer accuracy on a labelled set or handling time per ticket, and one guardrail such as latency or cost per request. Give rough targets. Every later design choice can then be justified against those numbers, which makes trade-off discussion concrete instead of abstract.',
      },
    ],
    workedExample: {
      title: 'An opening in under ten minutes',
      body: 'For a support assistant at a 40-person software vendor, the candidate scopes to English email tickets only, parks chat and phone, and states: "Primary metric is the share of drafts sent with light or no edits, target 60 percent. Guardrails are p95 latency under 4 seconds and cost under 2 cents per draft." She then spends the remaining 35 minutes on a design that serves those three numbers.',
    },
    warning: 'Skipping the metric leaves every later choice unanchored. Without a target, "should we add a reranker?" has no answer.',
    takeaways: [
      'State what is in and out of scope for the first version.',
      'One primary metric plus one guardrail is enough.',
      'Use the metric to justify every later trade-off.',
    ],
    checkYourself: [
      'What would you park when scoping a multilingual document assistant?',
      'Give a primary metric and a guardrail for a ticket triage system.',
      'How does naming a metric early change the rest of the interview?',
    ],
    referenceIds: ['ref-sre', 'ref-ragas'],
  },

  // ── T1.2 APIs and backend for AI apps ───────────────────────────────────
  {
    id: 't1-2-l1',
    moduleId: 't1-2',
    order: 1,
    title: 'Wrapping a Model Call in a Production API',
    tagline: 'Defensive timeouts and retries add code and some latency but stop one slow provider from taking down the service.',
    readingMin: 7,
    objectives: [
      'Define request and response schemas for a model endpoint',
      'Add timeouts, bounded retries and error mapping',
      'Authenticate callers and record usage',
    ],
    sections: [
      {
        heading: 'Validate inputs and outputs with schemas',
        body: 'In FastAPI, declare request and response models with Pydantic so malformed input is rejected before it reaches the model and responses have a stable shape. Cap input length to protect your token budget. Validate the model output against a schema too, and decide what to return when it fails validation: a retry, a fallback message or a clear error.',
      },
      {
        heading: 'Bound every external call',
        body: 'Model providers have variable latency and occasional outages. Set a timeout on every call, retry only on transient errors such as rate limits or 5xx responses, use exponential backoff with jitter, and cap total attempts. Map provider errors to your own error codes so clients are not coupled to one vendor. Log request id, model, token counts and latency for each call.',
      },
    ],
    workedExample: {
      title: 'Sizing a timeout',
      body: 'A 20-person legal tech team serves a contract-summary endpoint whose model calls have a p50 of 2.1 seconds and a p99 of 9 seconds, with rare hangs past 60 seconds. They set a 12-second timeout, two retries with backoff on 429 and 503 responses, and an overall 30-second budget. Before the change, a provider slowdown exhausted all 40 worker threads within a minute; afterwards, the same incident produced a 3 percent error rate and no outage.',
    },
    warning: 'Shipping without timeouts or retries on model calls is the classic failure. One hung request per worker is enough to stall a service under load.',
    takeaways: [
      'Schemas protect both the model and the client.',
      'Every model call needs a timeout, bounded retries and error mapping.',
      'Log tokens and latency per call from day one.',
    ],
    checkYourself: [
      'Which errors should be retried, and which should not?',
      'How would you choose a timeout value?',
      'What should you log for every model call?',
    ],
    referenceIds: ['ref-sre', 'ref-owasp-llm'],
  },
  {
    id: 't1-2-l2',
    moduleId: 't1-2',
    order: 2,
    title: 'Streaming Responses',
    tagline: 'Streaming cuts perceived latency sharply at the cost of harder error handling and output validation.',
    readingMin: 6,
    objectives: [
      'Stream model tokens to a client over server-sent events',
      'Handle errors and cancellation mid-stream',
      'Decide when not to stream',
    ],
    sections: [
      {
        heading: 'Stream when a person is waiting',
        body: 'Users judge speed by time to first token, not total time. Streaming tokens as they are generated, typically over server-sent events, makes a 6-second answer feel responsive. FastAPI can return a streaming response from an async generator that yields chunks from the model client. Send a final event that marks completion and carries usage data.',
      },
      {
        heading: 'Plan for failures halfway through',
        body: 'Once you have sent partial output, you cannot change the status code. Define an error event the client understands, and stop generation when the client disconnects so you do not pay for tokens nobody reads. If the output must pass validation, such as a JSON schema or a safety check, buffer it and send it whole instead of streaming.',
      },
    ],
    workedExample: {
      title: 'Measuring the effect',
      body: 'A 40-person support team uses an assistant whose answers average 280 tokens and take 5.5 seconds to complete. Without streaming, agents abandoned 18 percent of requests before the answer appeared. With streaming, the first token arrives in 0.7 seconds and abandonment falls to 4 percent. Cancelling generation on disconnect also trims monthly output tokens by about 6 percent.',
    },
    warning: 'Streaming structured output that a program must parse invites partial, invalid results. Stream prose to people; buffer and validate output meant for machines.',
    takeaways: [
      'Time to first token drives perceived speed.',
      'Design an in-stream error event and honour client disconnects.',
      'Do not stream output that must be validated before use.',
    ],
    checkYourself: [
      'Why can you not return a 500 status after streaming has begun?',
      'What happens to cost if you ignore client disconnects?',
      'When would you choose not to stream?',
    ],
    referenceIds: ['ref-sre'],
  },

  // ── T3.1 What an agent is ───────────────────────────────────────────────
  {
    id: 't3-1-l1',
    moduleId: 't3-1',
    order: 1,
    title: 'The Tool-Calling Loop',
    tagline: 'Letting the model choose the next step buys flexibility at the cost of predictability and cost control.',
    readingMin: 6,
    objectives: [
      'Describe the observe, decide, act loop',
      'Distinguish an agent from a fixed chain',
      'Identify where the loop must be bounded',
    ],
    sections: [
      {
        heading: 'Define an agent by who picks the next step',
        body: 'In a chain, your code fixes the sequence of steps. In an agent, the model sees the goal, the available tools and the results so far, and decides which tool to call next or whether to answer. The loop repeats: model proposes a call, your code executes it, the result is appended to the context, and the model decides again.',
      },
      {
        heading: 'Bound the loop in three ways',
        body: 'Cap the number of iterations, cap total tokens or cost per task, and give the model a clear way to stop, such as a final-answer tool. Without these, a confused agent can call the same tool repeatedly. Log each step so a failed run can be replayed and inspected.',
      },
    ],
    workedExample: {
      title: 'Chain or agent',
      body: 'A regional retailer wants an assistant that answers order questions. Ninety percent of questions follow one path: look up order, look up shipment, answer. A fixed chain handles those in two calls and 1.2 seconds. The other 10 percent need different combinations of returns, refunds and stock lookups, so the team routes them to an agent capped at six steps, which averages 3.4 tool calls and 4 seconds.',
    },
    warning: 'Calling a chain an agent is a frequent interview slip. If your code decides every step, it is a chain, and saying so precisely earns more credit than the fashionable label.',
    takeaways: [
      'An agent lets the model choose the next action in a loop.',
      'Use fixed chains for predictable paths and agents for variable ones.',
      'Always cap iterations, cost and give a stop condition.',
    ],
    checkYourself: [
      'What makes a system an agent rather than a chain?',
      'Name three ways to bound an agent loop.',
      'When would you route only some requests to an agent?',
    ],
    referenceIds: ['ref-react', 'ref-mcp'],
  },
  {
    id: 't3-1-l2',
    moduleId: 't3-1',
    order: 2,
    title: 'Building and Explaining the Loop',
    tagline: 'Clear tool definitions cost design time up front and save most of the debugging later.',
    readingMin: 7,
    objectives: [
      'Write tool definitions the model can use correctly',
      'Implement the loop with error feedback',
      'Explain a run step by step in an interview',
    ],
    sections: [
      {
        heading: 'Describe tools as if to a new colleague',
        body: 'Each tool needs a name, a description of when to use it, and a typed argument schema. The model chooses tools almost entirely from those descriptions, so vague ones cause wrong calls. Keep the tool set small, make arguments explicit, and return compact, structured results rather than raw dumps.',
      },
      {
        heading: 'Feed errors back instead of crashing',
        body: 'When a tool call fails validation or the downstream system errors, return a short error message to the model as the tool result so it can correct itself. Count those retries against the iteration cap. Tools with side effects, such as sending an email or issuing a refund, should require confirmation or run behind an approval step.',
      },
    ],
    workedExample: {
      title: 'Fixing a vague tool',
      body: 'An IT helpdesk agent for a 300-person firm has a tool called search with the description "searches things". In 50 test runs, it calls search for password resets 22 times instead of the reset tool. Renaming it to search_knowledge_base, describing it as "find help articles; do not use for account actions", and adding an example cuts wrong calls to 3, and average steps per task fall from 4.8 to 3.1.',
    },
    warning: 'Giving the agent many overlapping tools makes selection unreliable. Merge or remove tools until each has one clear purpose, and treat any side-effecting tool as a security boundary.',
    takeaways: [
      'Tool descriptions are prompts; write them carefully.',
      'Return errors to the model and count them against the cap.',
      'Gate side-effecting tools behind confirmation.',
    ],
    checkYourself: [
      'What three parts does a good tool definition have?',
      'How should the loop handle a failed tool call?',
      'Why do side-effecting tools need extra controls?',
    ],
    referenceIds: ['ref-react', 'ref-owasp-llm', 'ref-mcp'],
  },

  // ── T7.1 Telling the build story ────────────────────────────────────────
  {
    id: 't7-1-l1',
    moduleId: 't7-1',
    order: 1,
    title: 'The Two-Minute Build Story',
    tagline: 'A short version forces you to drop detail but makes the interviewer want to ask for more.',
    readingMin: 5,
    objectives: [
      'Structure a project story as problem, build, result',
      'Include at least two numbers and one trade-off',
      'Deliver it in about two minutes',
    ],
    sections: [
      {
        heading: 'Open with the problem and who had it',
        body: 'Start with the user and the cost of the problem: "A 40-person support team spent four hours a day searching for policy answers." Then say what you built in one or two sentences, naming the key components. Close with the measured result and one trade-off you made deliberately. That is the whole short version.',
      },
      {
        heading: 'Put numbers and a trade-off in every telling',
        body: 'Numbers make a story credible: users, volumes, latency, accuracy before and after, time saved. A trade-off shows judgement: "We chose a smaller model and spent the savings on reranking, because recall mattered more than fluency." Rehearse the story aloud until both appear naturally without notes.',
      },
    ],
    workedExample: {
      title: 'A short version, timed',
      body: '"A regional insurer\'s claims team of 60 spent about 15 minutes per claim finding policy clauses. I built a retrieval assistant over 8,000 policy documents with hybrid search and a reranker, served through a FastAPI service. Clause lookup time fell to under 2 minutes, and 91 percent of cited clauses were correct in a 200-claim audit. We traded a slower p95 of 3 seconds for that accuracy, which handlers accepted." Spoken, this takes about 75 seconds.',
    },
    warning: 'Stories with no numbers or no trade-offs sound like summaries of someone else\'s work. Interviewers listen specifically for what you measured and what you chose not to do.',
    takeaways: [
      'Problem, build, result, trade-off: in that order.',
      'Two numbers and one trade-off is the minimum.',
      'Rehearse aloud until it fits in two minutes.',
    ],
    checkYourself: [
      'What are the four parts of the short version?',
      'Which numbers from your own project would you use?',
      'What trade-off did you make that you could defend?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },
  {
    id: 't7-1-l2',
    moduleId: 't7-1',
    order: 2,
    title: 'The Deep-Dive Version',
    tagline: 'Going deep shows mastery but risks losing the listener unless you let them steer.',
    readingMin: 6,
    objectives: [
      'Extend the short story into a ten-minute technical walk-through',
      'Prepare for the follow-up questions interviewers ask most',
      'Admit what you would do differently',
    ],
    sections: [
      {
        heading: 'Layer detail under each part of the short story',
        body: 'Prepare one level of depth under each beat: how you understood the problem, the architecture and why, the hardest technical issue, how you evaluated, and what happened in production. Offer the short version first, then ask which part the interviewer wants to explore. Letting them steer keeps the conversation on what they are assessing.',
      },
      {
        heading: 'Prepare the predictable follow-ups',
        body: 'Expect "how did you know it worked", "what broke", "what would you change" and "what was your part versus the team\'s". Have a specific answer for each, including a real failure and what you learned. Saying what you would do differently is a strength when the reasoning is concrete.',
      },
    ],
    workedExample: {
      title: 'Handling "what broke"',
      body: 'Continuing the insurer story, the candidate explains that two weeks after launch, accuracy on new policies dropped to 70 percent because the nightly index job silently skipped files over 20 MB. She describes adding a document-count check that alerts when ingestion falls more than 2 percent below the source count, and a weekly 50-question regression run. She closes by saying she would build those checks before launch next time.',
    },
    warning: 'Delivering the deep version without being asked buries the interviewer in detail. Give the short version, then offer depth and follow their questions.',
    takeaways: [
      'Prepare one layer of depth under each beat of the short story.',
      'Rehearse answers to the four common follow-ups.',
      'A concrete failure and lesson is more convincing than a perfect story.',
    ],
    checkYourself: [
      'Which four follow-up questions should you prepare for?',
      'How do you separate your contribution from the team\'s?',
      'What would you change about your own project, and why?',
    ],
    referenceIds: ['ref-sre', 'ref-canonical-handbook'],
  },

  // ── T8.3 Mock interviews and scorecards ─────────────────────────────────
  {
    id: 't8-3-l1',
    moduleId: 't8-3',
    order: 1,
    title: 'Running a Full Mock Round',
    tagline: 'Timed, spoken mocks are uncomfortable but are the only practice that matches the real round.',
    readingMin: 5,
    objectives: [
      'Set up a mock with realistic time and conditions',
      'Practise the parts of a round you avoid',
      'Record the session for later review',
    ],
    sections: [
      {
        heading: 'Simulate the real constraints',
        body: 'Use the full time limit, speak aloud, and draw on a shared whiteboard or document as you would in the real interview. Have a partner play interviewer with the prompt and probes, or record yourself if practising alone. Do not pause to look things up; note gaps and look them up afterwards.',
      },
      {
        heading: 'Practise the parts you find hardest',
        body: 'Most candidates rehearse the parts they already do well. Choose mocks that stress your weak areas: the discovery round if you are an engineer, the coding round if you are coming from solutions work, or the evaluation and cost section of a design round. Rotate through all five mock types before your interview.',
      },
    ],
    workedExample: {
      title: 'A four-week mock schedule',
      body: 'A candidate with four weeks schedules two mocks a week. Weeks one and two cover all five mock types once each, plus a repeat of the weakest. Scores on the discovery mock start at 2 out of 4 on customer judgement. After three repeats focused on clarifying questions, that dimension reaches 3.5, while design scores, already strong, are maintained with one mock in week four.',
    },
    warning: 'Practising only the easy parts produces confidence that disappears in the real round. If a mock type feels uncomfortable, that is the one to repeat.',
    takeaways: [
      'Mock under real time and spoken conditions.',
      'Weight practice towards your weakest round type.',
      'Record sessions so you can score them honestly.',
    ],
    checkYourself: [
      'Which mock type do you avoid, and why?',
      'What conditions make a mock realistic?',
      'How many mocks can you fit before your interview date?',
    ],
    referenceIds: ['ref-mom-test', 'ref-canonical-handbook'],
  },
  {
    id: 't8-3-l2',
    moduleId: 't8-3',
    order: 2,
    title: 'Scoring Yourself with a Rubric',
    tagline: 'Rubric scoring takes longer than a gut feeling but shows exactly which dimension to fix next.',
    readingMin: 5,
    objectives: [
      'Score a mock on five rubric dimensions',
      'Turn low scores into specific practice tasks',
      'Track scores across mocks to see trends',
    ],
    sections: [
      {
        heading: 'Score each dimension separately',
        body: 'Rate structure, technical depth, trade-offs, communication and, for customer-facing rounds, customer judgement, each from one to four against the written anchors. Use the recording, not memory. A single overall impression hides the pattern; five separate scores show where points are lost.',
      },
      {
        heading: 'Convert each low score into one drill',
        body: 'For any dimension scored two or below, write one specific drill. Low structure might mean practising the opening routine five times. Low trade-offs might mean naming one alternative and its cost for every component you propose. Re-score the same dimension in the next mock to check the drill worked.',
      },
    ],
    workedExample: {
      title: 'Reading a scorecard',
      body: 'After three design mocks, a candidate\'s scores average 3.3 for technical depth, 3.0 for communication, 2.0 for trade-offs, 3.0 for structure and 2.3 for customer judgement. The drill for trade-offs is to say "the alternative is X, and we lose Y" for each component. Two mocks later, trade-offs average 3.0 and the overall mean rises from 2.7 to 3.1.',
    },
    warning: 'Scoring generously from memory makes the rubric useless. Score from a recording and compare against the written anchor, not against how the session felt.',
    takeaways: [
      'Five separate scores reveal what one overall score hides.',
      'Every low score becomes one concrete drill.',
      'Track scores over time to confirm improvement.',
    ],
    checkYourself: [
      'What are the five rubric dimensions?',
      'Write one drill for a low communication score.',
      'Why should you score from a recording?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },

  // ── T9.1 Capstone build ─────────────────────────────────────────────────
  {
    id: 't9-1-l1',
    moduleId: 't9-1',
    order: 1,
    title: 'Scoping the Capstone',
    tagline: 'A narrow capstone that is measured and deployed beats a broad one that only works in a demo.',
    readingMin: 6,
    objectives: [
      'Choose a capstone problem with real data and a clear user',
      'Define success metrics and a test set before building',
      'Plan the build in weekly milestones',
    ],
    sections: [
      {
        heading: 'Pick a problem you can measure',
        body: 'Choose a problem with a specific user, real or realistic data and an outcome you can measure, such as answering questions over a public document set or triaging a labelled ticket dataset. Avoid problems where success is a matter of taste. The capstone should exercise retrieval or agents, an API, evaluation and basic operations.',
      },
      {
        heading: 'Write the eval set before the first prompt',
        body: 'Create 50 to 100 labelled examples and fix the primary metric and guardrails at the start. This keeps the build honest and gives you numbers to cite when you tell the story in interviews. Plan milestones: a baseline in week one, a working pipeline in week two, evaluation and fixes in week three, deployment and monitoring in week four.',
      },
    ],
    workedExample: {
      title: 'A scoped capstone',
      body: 'A candidate builds a question-answering assistant over 1,200 public building-regulation documents for a fictional 30-person architecture practice. She labels 80 questions with the correct clause, sets a target of 0.85 recall at 5 and 80 percent correct answers, and a p95 latency guardrail of 3 seconds. The week-one baseline, BM25 alone, scores 0.62 recall, giving a clear starting point.',
    },
    warning: 'A capstone demo without evaluation is the most common gap. Without a test set and metrics, you cannot show that the system works or that your changes helped.',
    takeaways: [
      'Choose a problem with a clear user and measurable outcome.',
      'Build the eval set before the first prompt.',
      'Plan weekly milestones from baseline to deployment.',
    ],
    checkYourself: [
      'What makes a capstone problem measurable?',
      'How many labelled examples do you need to start?',
      'What would your week-one baseline be?',
    ],
    referenceIds: ['ref-ragas', 'ref-canonical-handbook'],
  },
  {
    id: 't9-1-l2',
    moduleId: 't9-1',
    order: 2,
    title: 'Shipping with Evaluation and Operations',
    tagline: 'Monitoring and regression tests add a week of work but turn a demo into a system you can defend.',
    readingMin: 7,
    objectives: [
      'Deploy the capstone behind an API with logging',
      'Run a regression eval on every change',
      'Document results and trade-offs for your portfolio',
    ],
    sections: [
      {
        heading: 'Run the eval on every change',
        body: 'Wire the labelled set into a script that runs on every meaningful change and records retrieval recall, answer correctness, latency and cost per request. Keep results in a table by date and commit. When a change lowers a metric, you will see it immediately, and the history becomes evidence for your build story.',
      },
      {
        heading: 'Add the minimum operational layer',
        body: 'Deploy behind an API with timeouts, structured logs including retrieved chunk ids and token counts, and a basic dashboard for error rate and latency. Add one alert, for example on error rate above 5 percent. Write a short design document covering architecture, metrics, trade-offs and known limitations.',
      },
    ],
    workedExample: {
      title: 'Final numbers',
      body: 'The building-regulation assistant ends with hybrid retrieval and a reranker, reaching 0.89 recall at 5 and 84 percent correct answers on the 80-question set, with p95 latency of 2.6 seconds and cost of about 0.4 cents per question. The eval history shows one regression, when a chunk-size change dropped recall to 0.79, caught and reverted the same day. The design document lists scanned drawings as an unsupported input.',
    },
    warning: 'Presenting a capstone with only a demo video invites the question "how do you know it works?". Bring the eval table, the regression you caught and the limitations you documented.',
    takeaways: [
      'Automate the eval and run it on every change.',
      'Logging, one dashboard and one alert are the operational minimum.',
      'Document limitations as clearly as results.',
    ],
    checkYourself: [
      'Which metrics should the regression eval record?',
      'What belongs in the capstone design document?',
      'How would you show an interviewer that your system works?',
    ],
    referenceIds: ['ref-ragas', 'ref-sre', 'ref-accelerate'],
  },
]
