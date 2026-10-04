/**
 * Sample lesson bodies for the T5 AI Systems Design track in the /demo prototype.
 * Written to show the house lesson shape; these are not the final curriculum text.
 */
import type { Lesson } from '../../types'

export const LESSONS_T5: Lesson[] = [
  // ── T5.1 The design framework ────────────────────────────────────────────
  {
    id: 't5-1-l1',
    moduleId: 't5-1',
    order: 1,
    title: 'Requirements and Metrics Before Boxes',
    tagline: 'Every minute spent pinning down requirements is a minute not spent drawing, but it decides whether the drawing answers the right question.',
    readingMin: 6,
    objectives: [
      'Separate functional requirements from quality targets',
      'State a success metric and a guardrail metric out loud',
      'Turn vague scale words into numbers you can design against',
    ],
    sections: [
      {
        heading: 'Restate the problem in one sentence',
        body: 'Open by saying who the user is, what they are trying to get done and what the system must produce for them. A one-sentence restatement exposes misunderstandings early, and it gives the interviewer a clean moment to correct you before you have invested in a design.',
      },
      {
        heading: 'Say the success metric before drawing a box',
        body: 'Pick one metric that tells you the system is working for the business, such as resolution rate or analyst hours saved, and one guardrail that must not get worse, such as wrong-answer rate on regulated topics. Then convert the scale words: requests per day, peak per second, corpus size, latency budget at the 95th percentile and a cost ceiling per request.',
      },
      {
        heading: 'Write the constraints where you can see them',
        body: 'Keep a short column on the board for data residency, access control, freshness and budget. Every later choice should point back to one of those lines.',
      },
    ],
    workedExample: {
      title: 'A support assistant for a regional insurer',
      body: 'The prompt is "build an assistant for our claims team". You restate it as: 300 handlers need grounded answers from 40,000 policy documents. Success is a 20 percent drop in average handling time; the guardrail is zero answers citing a superseded policy. Scale is 6,000 questions a day, peaking at 3 per second, with a 4-second budget and 2 pence per answer.',
    },
    warning: 'Skipping requirements and metrics is the most common way to lose this round. Candidates who draw a retrieval pipeline in the first two minutes usually end up defending choices nobody asked for, and cannot say whether the design succeeded.',
    takeaways: [
      'Restate the problem before you solve it',
      'One success metric plus one guardrail anchors every later trade-off',
      'Numbers turn adjectives like "large" and "fast" into design inputs',
    ],
    checkYourself: [
      'What is the difference between a success metric and a guardrail metric?',
      'Which four numbers would you ask for before sizing any AI system?',
      'How would you respond if the interviewer says "assume whatever you like"?',
    ],
    referenceIds: ['ref-ddia', 'ref-sre'],
  },
  {
    id: 't5-1-l2',
    moduleId: 't5-1',
    order: 2,
    title: 'Walking the Twelve Parts in Order',
    tagline: 'A fixed framework makes your answer predictable and complete, at the cost of sounding rehearsed if you apply it without judgement.',
    readingMin: 7,
    objectives: [
      'Name the twelve parts of the design framework in sequence',
      'Decide which parts deserve depth for a given prompt',
      'Use the principles to justify skipping or shortening a part',
    ],
    sections: [
      {
        heading: 'Use the framework as a checklist, not a script',
        body: 'The twelve parts run from requirements and metrics, through data, retrieval, model choice, orchestration, evaluation, safety, serving, observability and cost, to rollout and iteration. You will not give each one equal time. The value is that nothing important is forgotten, and the interviewer can follow where you are.',
      },
      {
        heading: 'Spend depth where the prompt has risk',
        body: 'Ask which part would most likely cause the system to fail in production. For a document assistant it is usually retrieval and evaluation; for an agent that acts on records it is permissions and safety. Say which parts you are going deep on and why, then keep the others to one sentence each.',
      },
      {
        heading: 'Name the principle behind each choice',
        body: 'Principles such as "start with the simplest system that meets the metric" or "measure before you optimise" give you short, defensible reasons. Quote the principle, then the trade-off it implies.',
      },
    ],
    workedExample: {
      title: 'Allocating depth for a logistics company with 12 depots',
      body: 'The prompt is an assistant that drafts delivery exception notes for depot staff. You signal that data and evaluation get the most time, because notes come from free-text driver logs of uneven quality. Model choice gets one line: a mid-sized hosted model, since volume is about 2,000 notes a day. Safety gets two lines because notes go to customers, so a human approves anything mentioning compensation.',
    },
    warning: 'Reciting all twelve parts at the same depth is a form of skipping requirements: it shows you know the list but not which parts matter for this customer. Interviewers read uniform coverage as memorisation.',
    takeaways: [
      'The framework guarantees coverage; judgement decides depth',
      'Announce where you will go deep so the interviewer can redirect you',
      'Pair each choice with a named principle and its cost',
    ],
    checkYourself: [
      'Which two parts of the framework carry the most risk for a document question-answering system?',
      'How would you shorten the serving and cost parts without dropping them?',
      'Give one principle you would use to argue against adding an agent loop.',
    ],
    referenceIds: ['ref-ddia', 'ref-canonical-handbook'],
  },

  // ── T5.2 The 60-minute whiteboard method ─────────────────────────────────
  {
    id: 't5-2-l1',
    moduleId: 't5-2',
    order: 1,
    title: 'Budgeting the Hour',
    tagline: 'A strict time budget keeps you moving across the whole design, but it means accepting a shallower first pass on parts you care about.',
    readingMin: 5,
    objectives: [
      'Split sixty minutes into named phases with target end times',
      'Recognise when a phase has overrun',
      'Leave protected time for trade-offs and questions',
    ],
    sections: [
      {
        heading: 'Write the clock on the board',
        body: 'Before you start, jot the phase boundaries in a corner: requirements by minute 10, high-level design by 25, deep dives by 45, evaluation and operations by 55, wrap-up to 60. Visible targets make it easy to notice drift, and interviewers respond well to a candidate who manages their own time.',
      },
      {
        heading: 'Draw the whole system shallowly first',
        body: 'Get every major component on the board with one-line responsibilities before you open any of them. A complete shallow design is far more useful than a perfect retrieval layer attached to nothing. The deep dives then become choices, not accidents.',
      },
      {
        heading: 'Protect the last five minutes',
        body: 'Reserve the end for a summary of the main trade-offs and what you would do next with more time. That summary is often what the interviewer writes down.',
      },
    ],
    workedExample: {
      title: 'A pacing plan for a contract review assistant',
      body: 'The prompt is a tool that flags risky clauses for a mid-sized legal team reviewing about 150 contracts a week. Minutes 0 to 10: users, volume, the metric (reviewer time per contract down from 90 to 50 minutes) and the guardrail (no missed indemnity clauses). Minutes 10 to 25: ingestion, clause segmentation, retrieval of precedent clauses, model call, reviewer interface. Minutes 25 to 45: deep dives on segmentation and evaluation. Minutes 45 to 55: monitoring, cost of roughly 40 pence per contract, rollout. Minutes 55 to 60: summary.',
    },
    warning: 'Over-spending time on one box is the classic pacing failure. If you are still debating chunk sizes at minute 30, the interviewer has not seen serving, evaluation or cost, and cannot score you on them.',
    takeaways: [
      'Visible phase targets make drift obvious to you and reassuring to the interviewer',
      'Breadth first, then depth by choice',
      'Always close with trade-offs and next steps',
    ],
    checkYourself: [
      'What should be on the board by minute 25?',
      'Why is a shallow complete design better than a deep partial one?',
      'What goes into the final five-minute summary?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },
  {
    id: 't5-2-l2',
    moduleId: 't5-2',
    order: 2,
    title: 'Recovering When the Clock Slips',
    tagline: 'Cutting a deep dive short loses detail you prepared, but keeping it costs you the parts of the rubric you have not reached.',
    readingMin: 5,
    objectives: [
      'Spot an overrun within a minute of it starting',
      'Compress a phase without losing its key decision',
      'Handle interviewer interruptions without losing the thread',
    ],
    sections: [
      {
        heading: 'Name the overrun and move on',
        body: 'When you notice you are behind, say so plainly: "I am over time on retrieval, so I will note the open question and move to evaluation." Naming it shows control. Park the unresolved detail in a "later" list on the board so it is visibly not forgotten.',
      },
      {
        heading: 'Compress to the decision, not the detail',
        body: 'Each phase has one decision that matters most. For serving it might be synchronous versus queued; for evaluation it might be the offline test set. When short of time, state that decision and its trade-off in two sentences and skip the supporting detail.',
      },
      {
        heading: 'Treat interruptions as steering',
        body: 'An interviewer who interrupts with a question is telling you where they want depth. Answer it, then say where you were and adjust the remaining budget openly.',
      },
    ],
    workedExample: {
      title: 'Catching up on a fraud triage design',
      body: 'At minute 32 you are still on feature retrieval for a bank\'s fraud triage assistant handling 8,000 alerts a day. You say you will park the embedding refresh question, then cover serving in one minute: alerts are queued, analysts see a summary within 2 minutes, which is fine because the current queue wait is 40 minutes. Evaluation gets three minutes on a labelled set of 500 past alerts. You finish operations at minute 54 and still have your summary slot.',
    },
    warning: 'Over-spending time on one box often happens because the box is the one you know best. Comfort is not a reason for depth; risk is.',
    takeaways: [
      'Say the overrun out loud and park the detail',
      'Every phase reduces to one key decision',
      'Interruptions show you where the interviewer wants depth',
    ],
    checkYourself: [
      'What do you say when you realise you are ten minutes behind?',
      'What is the single key decision in the serving phase for a batch workload?',
      'How do you return to your plan after an interviewer takes you on a tangent?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },

  // ── T5.3 Architecture patterns and trade-offs ────────────────────────────
  {
    id: 't5-3-l1',
    moduleId: 't5-3',
    order: 1,
    title: 'Choosing Between Prompting, Retrieval and Fine-Tuning',
    tagline: 'Retrieval keeps knowledge fresh and auditable at the price of latency and pipeline complexity, while fine-tuning bakes behaviour in but goes stale.',
    readingMin: 8,
    objectives: [
      'Match the three adaptation patterns to the problem they solve',
      'Explain the cost, freshness and audit trade-offs of each',
      'Justify a hybrid without hand-waving',
    ],
    sections: [
      {
        heading: 'Ask what is actually missing from the model',
        body: 'If the model lacks facts that change, such as policies or prices, retrieval is the natural fit because you can update the index without retraining and cite the source. If it lacks a behaviour, such as a house writing style or a strict output format, prompting or fine-tuning fits better. Most failures come from fine-tuning to add knowledge, which goes stale the moment the documents change.',
      },
      {
        heading: 'Start with the cheapest pattern that meets the metric',
        body: 'Try a well-structured prompt with a few examples first, then add retrieval, then consider fine-tuning only when you have evidence that the first two cannot reach the target. Each step adds operational weight: an index to refresh, a training pipeline to own, a model version to roll back.',
      },
      {
        heading: 'Price the trade-off in the customer\'s units',
        body: 'Say what each option costs in latency, money per request and engineering weeks, and what it buys in quality on the evaluation set.',
      },
    ],
    workedExample: {
      title: 'A product catalogue assistant for a hardware retailer',
      body: 'The retailer has 60,000 products whose prices change weekly and wants answers in a consistent brand voice. Retrieval handles specifications and prices, adding about 300 milliseconds and a nightly index refresh. Brand voice is handled with a system prompt and five examples, which reached 92 percent style compliance on a 200-answer review. Fine-tuning would push that higher but would need retraining whenever the voice guide changes, so you defer it.',
    },
    warning: 'Listing tools without trade-offs, such as naming three vector stores and two frameworks, adds nothing. Interviewers want to hear what you give up with each choice and why that cost is acceptable for this customer.',
    takeaways: [
      'Retrieval for changing knowledge, prompting or fine-tuning for behaviour',
      'Escalate patterns only with evidence from evaluation',
      'Express every trade-off in latency, cost and effort',
    ],
    checkYourself: [
      'Why does fine-tuning for factual knowledge tend to fail over time?',
      'What evidence would justify moving from retrieval to fine-tuning?',
      'Name one operational cost that retrieval adds and fine-tuning does not.',
    ],
    referenceIds: ['ref-rag-paper', 'ref-lost-middle'],
  },
  {
    id: 't5-3-l2',
    moduleId: 't5-3',
    order: 2,
    title: 'Workflows, Agents and Where to Put the Human',
    tagline: 'An agent can handle open-ended tasks a fixed workflow cannot, but every extra decision it makes is another place it can fail unobserved.',
    readingMin: 8,
    objectives: [
      'Distinguish a fixed workflow from an agent loop',
      'Choose the least autonomous design that meets the need',
      'Place human review where the cost of error is highest',
    ],
    sections: [
      {
        heading: 'Default to a fixed workflow',
        body: 'If the steps are known in advance, such as classify, retrieve, draft and check, code them as a pipeline. Each step is testable, latency is predictable and failures are easy to locate. Reach for an agent loop only when the path genuinely depends on intermediate results, such as investigating an issue across several systems.',
      },
      {
        heading: 'Bound the agent before you build it',
        body: 'If you choose an agent, say the limits out loud: which tools it may call, how many steps it may take, what it may write versus read, and what happens when it hits the limit. Read-only tools with a step cap of around eight are a reasonable start.',
      },
      {
        heading: 'Put review at the irreversible step',
        body: 'Human approval belongs where an action is costly or hard to undo, such as sending money or emailing a customer, not on every step.',
      },
    ],
    workedExample: {
      title: 'Invoice exceptions for a facilities management firm',
      body: 'The firm processes 4,000 supplier invoices a month and 15 percent fail automatic matching. Most failures fall into four known causes, so a workflow classifies the cause and drafts a fix for each. The remaining 2 percent need investigation across the purchase order system and email, so a bounded agent with read-only tools and a six-step cap prepares a summary. A clerk approves every change to a payment record.',
    },
    warning: 'Listing tools without trade-offs shows up here as naming an agent framework instead of explaining why autonomy is needed. Say what the agent buys you and what it costs in predictability.',
    takeaways: [
      'Fixed workflows first; agents for genuinely variable paths',
      'Every agent needs tool, step and permission limits',
      'Human review belongs at irreversible actions',
    ],
    checkYourself: [
      'What signals that a task needs an agent rather than a workflow?',
      'Which three limits would you set on a new agent?',
      'Where would you place human review in a refund-processing system?',
    ],
    referenceIds: ['ref-react', 'ref-mcp', 'ref-owasp-llm'],
  },

  // ── T5.4 Casebook: classic AI designs ────────────────────────────────────
  {
    id: 't5-4-l1',
    moduleId: 't5-4',
    order: 1,
    title: 'The Five Classic Designs and Their Shapes',
    tagline: 'Recognising a classic shape gets you to a solid baseline quickly, but it can blind you to the detail that makes this prompt different.',
    readingMin: 7,
    objectives: [
      'Name the five classic AI system designs',
      'Identify the defining risk in each',
      'Spot which classic a new prompt most resembles',
    ],
    sections: [
      {
        heading: 'Learn the shape, not the diagram',
        body: 'The five classics are a document question-answering assistant, a support ticket triage and drafting system, an extraction pipeline for forms or contracts, a semantic search and recommendation service, and a tool-using operations agent. Each has a recognisable flow and a defining risk: grounding, routing accuracy, field-level precision, relevance ranking and safe action respectively.',
      },
      {
        heading: 'Match the prompt, then look for the twist',
        body: 'Once you recognise the classic, ask what differs. Is the corpus multilingual, are users external, is latency sub-second, is there a regulator? The twist usually decides where the interview goes deep, and naming it early shows that you are reasoning rather than reciting.',
      },
    ],
    workedExample: {
      title: 'A maintenance assistant for a rail operator',
      body: 'The prompt asks for a tool that helps 400 technicians find repair procedures. It looks like document question answering, so the baseline is ingestion, chunking, hybrid retrieval, a model call with citations and feedback capture. The twist is that technicians work in tunnels with intermittent connectivity and gloves on. That pushes you towards an offline index on a tablet for the top 2,000 procedures and voice input, which changes the serving design entirely.',
    },
    warning: 'Memorising instead of reasoning is the trap. If you draw the textbook question-answering diagram without asking about the twist, you will design the wrong system confidently, and interviewers notice when the answer ignores what they told you.',
    takeaways: [
      'Five classics cover most AI design prompts',
      'Each classic has one defining risk to address first',
      'The twist, not the classic, is where you earn marks',
    ],
    checkYourself: [
      'What is the defining risk of an extraction pipeline?',
      'Which classic does a "summarise sales calls into the CRM" prompt resemble?',
      'Give two questions that reveal a prompt\'s twist.',
    ],
    referenceIds: ['ref-rag-paper', 'ref-bm25', 'ref-rerank'],
  },
  {
    id: 't5-4-l2',
    moduleId: 't5-4',
    order: 2,
    title: 'Running a Whiteboard Script Without Reciting It',
    tagline: 'A rehearsed script makes you fluent under pressure, but delivered word for word it hides the reasoning the interviewer is scoring.',
    readingMin: 6,
    objectives: [
      'Use a whiteboard script as a scaffold for a classic design',
      'Adapt the script to new constraints in real time',
      'Explain each step with the reason it exists',
    ],
    sections: [
      {
        heading: 'Keep the script to decisions, not sentences',
        body: 'A good script for a classic design is a list of decisions in order: what to ingest, how to segment, how to retrieve, how to ground, how to evaluate, how to ship. Memorise the decisions, not the words. That leaves you free to speak naturally and to change an answer when the constraints change.',
      },
      {
        heading: 'Say why each step is there',
        body: 'For each decision give the reason in one clause: "hybrid retrieval, because part numbers need exact match and symptoms need semantic match". The reason is what the interviewer is assessing, and it is what lets you defend the step when they push back.',
      },
      {
        heading: 'Rehearse with a changed constraint',
        body: 'Practise each script twice, the second time with one constraint altered, such as ten times the traffic or a strict data residency rule.',
      },
    ],
    workedExample: {
      title: 'Adapting the triage script for a utility company',
      body: 'Your triage script assumes email tickets in one language. The utility receives 25,000 contacts a month across email, web chat and transcribed calls, 30 percent of them in Welsh. You keep the decisions in order but change two: a language detection step ahead of classification, and an evaluation set stratified by channel and language with at least 200 examples per cell. Routing accuracy is reported per cell, not as one average that hides a weak segment.',
    },
    warning: 'Memorising instead of reasoning sounds fluent until the first follow-up. If you cannot say why a step exists, you cannot adapt it, and the interviewer will probe exactly there.',
    takeaways: [
      'Scripts hold decisions; you supply the words',
      'Every step needs a one-clause reason',
      'Practise each script against a changed constraint',
    ],
    checkYourself: [
      'What is the difference between memorising a script and memorising its decisions?',
      'How would the triage script change for ten times the traffic?',
      'Why report routing accuracy per segment rather than overall?',
    ],
    referenceIds: ['ref-ragas', 'ref-canonical-handbook'],
  },

  // ── T5.5 Scenario library ────────────────────────────────────────────────
  {
    id: 't5-5-l1',
    moduleId: 't5-5',
    order: 1,
    title: 'Reading a Scenario Pack Actively',
    tagline: 'Reading many scenario packs builds breadth fast, but passive reading leaves little you can reproduce under interview pressure.',
    readingMin: 5,
    objectives: [
      'Work through a scenario pack with a fixed active-reading routine',
      'Distinguish complete sections from deep-dive stubs',
      'Capture a one-page summary you can rehearse from',
    ],
    sections: [
      {
        heading: 'Attempt the prompt before you read the answer',
        body: 'Give yourself ten minutes to sketch requirements, a high-level design and one key trade-off for the scenario before opening the pack. Then read and compare. The gaps between your sketch and the pack are what you actually learn from; reading first only produces a feeling of familiarity.',
      },
      {
        heading: 'Check how complete each section is',
        body: 'Some packs have full main sections but deep-dive sections that are still outlines. Treat an outline as a list of questions to answer yourself, not as finished guidance. Mark it in your notes so you do not later quote a stub as if it were a worked answer.',
      },
    ],
    workedExample: {
      title: 'A pack on a meeting notes assistant',
      body: 'Your ten-minute sketch covers transcription, summarisation and action-item extraction for a 2,000-person professional services firm. The pack adds two things you missed: consent capture when external participants join, and a retention limit of 90 days on raw audio. Its deep dive on speaker attribution is only three bullet points, so you note it as a stub and write your own two-paragraph answer on handling overlapping speech.',
    },
    warning: 'Reading deep-dive stubs as complete is easy when you are moving fast across twenty packs. A stub tells you what to think about, not what to say, and repeating it in an interview sounds thin.',
    takeaways: [
      'Sketch first, read second, compare third',
      'Flag stubs and fill them with your own answer',
      'One page per pack is enough to rehearse from',
    ],
    checkYourself: [
      'Why attempt the scenario before reading the pack?',
      'How do you recognise a deep-dive stub?',
      'What belongs on the one-page summary of a pack?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },
  {
    id: 't5-5-l2',
    moduleId: 't5-5',
    order: 2,
    title: 'Building Breadth Across Twenty Scenarios',
    tagline: 'Covering all twenty packs gives you a reference for almost any prompt, while going deep on a few gives you fluency, and you need a deliberate mix.',
    readingMin: 6,
    objectives: [
      'Plan a reading schedule across twenty scenario packs',
      'Group scenarios by shared pattern to speed recall',
      'Pick the packs worth rehearsing aloud',
    ],
    sections: [
      {
        heading: 'Group the packs by pattern',
        body: 'Sort the twenty scenarios under the five classic designs. Most groups will have three to five packs. Reading a group together shows you the variations on one shape, so the differences stand out and stick, and you learn which twists recur.',
      },
      {
        heading: 'Go deep on one pack per group',
        body: 'Choose one representative pack per group and rehearse it aloud against the sixty-minute plan. Read the others actively but at summary depth. That gives you five fluent answers and fifteen reference points to borrow from.',
      },
      {
        heading: 'Revisit on a schedule',
        body: 'Return to each one-page summary after three days and again after ten. Recall without looking first, then check.',
      },
    ],
    workedExample: {
      title: 'A two-week plan at six hours a week',
      body: 'Week one: three sessions of two hours, each covering one or two pattern groups with one deep rehearsal, about 40 minutes, and the rest at summary depth, about 15 minutes per pack. Week two: the remaining groups, then a recall session where you pick three random scenario titles and sketch each in ten minutes without notes. Track which groups you could not recall and revisit those first.',
    },
    warning: 'Reading deep-dive stubs as complete becomes more likely when you rush for coverage. Breadth is only useful if you know which parts of each pack you can actually rely on.',
    takeaways: [
      'Group scenarios by classic design to learn variations',
      'One deep rehearsal per group, summary depth for the rest',
      'Spaced recall beats rereading',
    ],
    checkYourself: [
      'Why read scenarios in pattern groups rather than in numbered order?',
      'How do you pick the representative pack for a group?',
      'What does a good recall session look like?',
    ],
    referenceIds: ['ref-canonical-handbook'],
  },
]
