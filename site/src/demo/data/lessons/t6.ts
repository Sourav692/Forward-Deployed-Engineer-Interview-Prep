/**
 * Sample lesson bodies for the T6 Forward Deployed Engineering track in the /demo prototype.
 * Written to show the house lesson shape; these are not the final curriculum text.
 */
import type { Lesson } from '../../types'

export const LESSONS_T6: Lesson[] = [
  // ── T6.1 Customer discovery and problem decomposition ────────────────────
  {
    id: 't6-1-l1',
    moduleId: 't6-1',
    order: 1,
    title: 'Ask for the Workflow Before the Wish List',
    tagline: 'Asking about today\'s workflow feels slower than collecting feature requests, but it is the only way to find the problem worth solving.',
    readingMin: 6,
    objectives: [
      'Open discovery with questions about current work, not desired features',
      'Map the workflow step by step with time and volume at each step',
      'Identify who does the work, who owns the budget and who signs off',
    ],
    sections: [
      {
        heading: 'Ask for the workflow before the wish list',
        body: 'Customers often arrive with a solution in mind: "we want a chatbot". Ask them to walk you through the last time the task was done, step by step. Who received it, what did they open, where did they wait, what did they hand on? Past behaviour is concrete; future wishes are optimistic.',
      },
      {
        heading: 'Put numbers on every step',
        body: 'For each step ask how often it happens, how long it takes and how often it goes wrong. A step that takes four minutes but happens 3,000 times a day matters more than a dramatic step that happens weekly. These numbers become your baseline and later your evidence of impact.',
      },
      {
        heading: 'Find the people behind the process',
        body: 'Note who performs each step, who would use the new tool and who decides whether it ships. They are often three different people.',
      },
    ],
    workedExample: {
      title: 'A regional insurer\'s claims team',
      body: 'The head of claims asks for "AI to read claim documents". Walking through yesterday\'s work, you learn that handlers receive 1,200 claims a day, each with four to nine attachments, and spend about 11 minutes finding the policy number, incident date and estimate total before any judgement happens. Errors in that lookup cause 6 percent of claims to bounce back. The real problem is structured extraction at intake, not a general reader.',
    },
    warning: 'Solutioning in the first minute is the defining discovery mistake. The moment you say "we could use retrieval for that", the customer stops describing their work and starts reacting to your idea, and you lose the information you came for.',
    takeaways: [
      'Ask about the last real instance of the task',
      'Time, volume and error rate per step form your baseline',
      'Users, owners and approvers are usually different people',
    ],
    checkYourself: [
      'Why are questions about past behaviour more reliable than questions about wishes?',
      'Which three numbers would you capture for each workflow step?',
      'Who besides the end user must you identify during discovery?',
    ],
    referenceIds: ['ref-mom-test'],
  },
  {
    id: 't6-1-l2',
    moduleId: 't6-1',
    order: 2,
    title: 'Decomposing a Vague Ask Into Sub-Problems',
    tagline: 'Breaking a request into small sub-problems makes each one solvable, but it risks losing sight of the outcome the customer actually pays for.',
    readingMin: 7,
    objectives: [
      'Break a broad request into independently testable sub-problems',
      'Rank sub-problems by value and feasibility',
      'Keep a visible link from each sub-problem to the business outcome',
    ],
    sections: [
      {
        heading: 'Split along the workflow, not the technology',
        body: 'Use the workflow map from discovery and ask which steps could change. Each candidate step becomes a sub-problem with its own input, output and success test. Splitting by technology ("the retrieval part", "the model part") produces components; splitting by workflow produces things a customer can see improve.',
      },
      {
        heading: 'Rank by value and by readiness',
        body: 'For each sub-problem estimate the time or money it would save and how ready the data is. A high-value step with no usable data is a later phase, not a starting point. Put the ranking on one slide so the customer can disagree with it early.',
      },
      {
        heading: 'Tie every piece back to one outcome',
        body: 'Write the business outcome at the top of the page and draw a line from each sub-problem to it. Anything without a line is out of scope for now.',
      },
    ],
    workedExample: {
      title: 'A logistics company with 12 depots',
      body: 'The ask is "use AI to reduce failed deliveries". Decomposition gives four sub-problems: flagging bad addresses before dispatch, predicting customers likely to be absent, drafting rebooking messages and summarising driver notes. Bad addresses cause 38 percent of 2,400 weekly failures and the address data is clean, so it ranks first. Absence prediction is valuable but needs two years of history the company has only partly kept, so it moves to phase two.',
    },
    warning: 'Solutioning in the first minute can creep back during decomposition, when one sub-problem looks technically interesting. Rank on value and data readiness, not on which piece you would most enjoy building.',
    takeaways: [
      'Decompose along the workflow so each piece has a visible effect',
      'Value without ready data means a later phase',
      'Every sub-problem must connect to the stated outcome',
    ],
    checkYourself: [
      'Why is splitting by technology a weaker decomposition than splitting by workflow?',
      'What two factors decide which sub-problem goes first?',
      'What do you do with a sub-problem that has no line to the outcome?',
    ],
    referenceIds: ['ref-mom-test', 'ref-canonical-handbook'],
  },
  {
    id: 't6-1-l3',
    moduleId: 't6-1',
    order: 3,
    title: 'Writing Requirements, Constraints and Metrics',
    tagline: 'A written requirements page slows the first build by a day or two, but it prevents weeks of rework when expectations turn out to differ.',
    readingMin: 6,
    objectives: [
      'Write functional requirements as observable behaviours',
      'Capture hard constraints separately from preferences',
      'Agree a baseline, a target and a guardrail metric',
    ],
    sections: [
      {
        heading: 'Describe behaviour a tester could check',
        body: 'Write each requirement as something you could demonstrate: "given a claim with attachments, the system returns policy number, incident date and estimate total with a confidence flag". Avoid adjectives such as "accurate" or "fast" without a number attached.',
      },
      {
        heading: 'Separate hard constraints from preferences',
        body: 'Data must stay in a named region, the tool must use existing single sign-on, personal data must not reach an external model without a contract: these are hard. A preferred interface colour is not. Mark each line so trade-offs later are quick.',
      },
      {
        heading: 'Agree the metric with the person who owns the outcome',
        body: 'State the baseline from discovery, the target and the guardrail, and get the outcome owner to agree in writing. That one paragraph settles most later arguments.',
      },
    ],
    workedExample: {
      title: 'The one-page brief for the claims intake tool',
      body: 'Requirements: extract three fields from claim attachments and show them to the handler with source highlights. Constraints: all processing in the customer\'s cloud region; no claimant data used for model training. Metrics: baseline lookup time 11 minutes, target 3 minutes; baseline bounce-back rate 6 percent, target under 2 percent; guardrail, field accuracy at least 98 percent on a 500-claim audit set. The head of claims signs the page on day three.',
    },
    warning: 'Solutioning in the first minute often leaves requirements written as features ("add a vector database") rather than behaviours. A feature list cannot be tested against the customer\'s outcome.',
    takeaways: [
      'Requirements describe behaviour, not components',
      'Mark constraints as hard or soft',
      'Baseline, target and guardrail, agreed in writing by the outcome owner',
    ],
    checkYourself: [
      'Rewrite "the system should be accurate" as a testable requirement.',
      'Give two examples of hard constraints common in regulated industries.',
      'Why must the outcome owner, not the end user, agree the metric?',
    ],
    referenceIds: ['ref-mom-test', 'ref-ragas'],
  },

  // ── T6.2 Scoping an FDE project ──────────────────────────────────────────
  {
    id: 't6-2-l1',
    moduleId: 't6-2',
    order: 1,
    title: 'Phasing a Scope Around a Success Metric',
    tagline: 'A narrow first phase delivers measurable value sooner, but it means saying no to parts of the request the sponsor cares about.',
    readingMin: 7,
    objectives: [
      'Structure a scope into phases with one success metric each',
      'Define what is explicitly out of scope',
      'Size each phase in weeks with named owners',
    ],
    sections: [
      {
        heading: 'Anchor every phase to a metric',
        body: 'Each phase should end with a number that moved: lookup time down, error rate down, hours saved. If you cannot name the number a phase will move, it is not a phase yet, it is a list of tasks. The first phase should be small enough to finish in four to six weeks.',
      },
      {
        heading: 'Write the out-of-scope list as carefully as the scope',
        body: 'Name the things you are not doing in this phase and why. Sponsors remember the request, not the agreement, so a written exclusion list protects both sides when someone asks three weeks in why the tool does not also handle complaints.',
      },
      {
        heading: 'Put names next to dependencies',
        body: 'Every phase depends on customer people: a data owner, a security reviewer, pilot users. Write their names and the week you need them.',
      },
    ],
    workedExample: {
      title: 'A procurement team at a mid-sized manufacturer',
      body: 'Phase one, five weeks: classify incoming supplier queries into eight categories and draft replies for the two most common, which are 55 percent of 900 weekly queries. Metric: median reply time from 26 hours to 6 hours. Out of scope: contract renegotiation queries and any reply sent without buyer approval. Dependencies: the procurement systems lead for mailbox access in week one, and four pilot buyers from week three.',
    },
    warning: 'Scoping without a success metric produces a project that can never finish, because there is no agreed point at which it has worked. It also leaves you defenceless when the sponsor changes priorities.',
    takeaways: [
      'One measurable outcome per phase',
      'A written out-of-scope list prevents silent scope growth',
      'Dependencies need names and dates',
    ],
    checkYourself: [
      'What makes a phase different from a task list?',
      'Why is the out-of-scope list as important as the scope?',
      'Which customer roles typically appear as dependencies?',
    ],
    referenceIds: ['ref-accelerate', 'ref-canonical-handbook'],
  },
  {
    id: 't6-2-l2',
    moduleId: 't6-2',
    order: 2,
    title: 'Naming Risks and Success Criteria',
    tagline: 'Listing risks openly can unsettle a sponsor early, but hidden risks surface later as missed dates and lost trust.',
    readingMin: 6,
    objectives: [
      'Identify the main risk types in an AI delivery',
      'Attach a mitigation and an owner to each risk',
      'Write success criteria the sponsor can verify without you',
    ],
    sections: [
      {
        heading: 'Sort risks into four buckets',
        body: 'Most risks fall into data (quality, access, volume), technical (latency, accuracy ceiling), organisational (sponsor change, user resistance) and compliance (privacy, security review). Walk each bucket with the customer. They know the organisational risks far better than you do.',
      },
      {
        heading: 'Give each risk an early warning signal',
        body: 'For every risk, write what you would see first if it were happening and when you will check. "Security review not booked by week two" is a signal; "security could be slow" is a worry.',
      },
      {
        heading: 'Make success criteria self-checking',
        body: 'Write criteria the sponsor can confirm from their own systems, such as a report from their ticketing tool, so success does not depend on your dashboard.',
      },
    ],
    workedExample: {
      title: 'A risk table for a housing association\'s repairs desk',
      body: 'The project triages 3,500 monthly repair requests. Data risk: free-text descriptions are short; signal is fewer than 70 percent of a 300-request sample classifiable by a human in week one. Organisational risk: the repairs manager is retiring in month three; mitigation is involving the deputy from day one. Compliance risk: tenant data in prompts; mitigation is redaction before the model call, signed off by the data protection officer by week two. Success: emergency repairs dispatched within 4 hours rising from 81 to 95 percent, as reported by their job system.',
    },
    warning: 'Scoping without a success metric often hides inside a risk register: plenty of risks, no statement of what success looks like. Risks only matter relative to the outcome they threaten.',
    takeaways: [
      'Data, technical, organisational and compliance risks each need a mitigation',
      'Early warning signals beat vague concerns',
      'Success criteria should be verifiable from the customer\'s own systems',
    ],
    checkYourself: [
      'Name one risk in each of the four buckets for a document extraction project.',
      'What turns a worry into an early warning signal?',
      'Why should success be measurable without your own tooling?',
    ],
    referenceIds: ['ref-sre', 'ref-owasp-llm'],
  },

  // ── T6.3 Delivery: six stages, gates, two-week launch ────────────────────
  {
    id: 't6-3-l1',
    moduleId: 't6-3',
    order: 1,
    title: 'Six Stages and the Gates Between Them',
    tagline: 'Formal gates add review overhead to every stage, but they stop a weak prototype from drifting into production on momentum.',
    readingMin: 7,
    objectives: [
      'Name the six delivery stages from discovery to scale',
      'Write exit criteria for each gate',
      'Decide who has the authority to pass a gate',
    ],
    sections: [
      {
        heading: 'Treat each stage as a question to answer',
        body: 'Discovery asks whether there is a problem worth solving. Prototype asks whether it can work at all. Evaluation asks whether it works well enough on real data. Pilot asks whether real users get value. Launch asks whether it runs reliably. Scale asks whether it holds up across teams. Each gate is the moment you show the answer.',
      },
      {
        heading: 'Write exit criteria before the stage starts',
        body: 'Agree the criteria in advance: for evaluation, "field accuracy at least 97 percent on 500 held-out documents"; for pilot, "8 of 10 pilot users choose the tool for a full week". Criteria written afterwards tend to describe whatever happened.',
      },
      {
        heading: 'Name who signs the gate',
        body: 'A gate without an owner becomes a meeting. Usually the outcome owner signs pilot and launch, and the customer\'s technical lead signs evaluation.',
      },
    ],
    workedExample: {
      title: 'Gate criteria for a pharmacy chain\'s stock query assistant',
      body: 'The assistant answers store staff questions about stock and substitutions across 220 branches. Prototype gate: answers 20 scripted questions correctly in a demo. Evaluation gate: 95 percent correct on 400 real questions, zero suggestions of a substitute outside the approved list. Pilot gate: 10 branches for two weeks, phone calls to the central team down 30 percent. Launch gate: two weeks at 99.5 percent availability with on-call cover agreed.',
    },
    warning: 'No exit criteria per gate is how prototypes become production systems by accident. Without agreed criteria, the loudest opinion in the room decides whether to proceed.',
    takeaways: [
      'Six stages, each answering one question',
      'Exit criteria are agreed before the stage begins',
      'Every gate has a named person who signs it',
    ],
    checkYourself: [
      'What question does the pilot stage answer that evaluation does not?',
      'Why write exit criteria before the stage starts?',
      'Who should sign the launch gate, and why?',
    ],
    referenceIds: ['ref-accelerate', 'ref-sre'],
  },
  {
    id: 't6-3-l2',
    moduleId: 't6-3',
    order: 2,
    title: 'Planning a Two-Week Launch',
    tagline: 'A two-week launch window forces focus and early feedback, but it leaves no slack for dependencies you did not secure in advance.',
    readingMin: 7,
    objectives: [
      'Lay out a day-by-day plan for a two-week launch',
      'Front-load the dependencies most likely to slip',
      'Define rollback and support before go-live',
    ],
    sections: [
      {
        heading: 'Clear the slow dependencies in the first three days',
        body: 'Access requests, security review and production credentials are the usual blockers, and none of them are under your control. Raise them on day one and check daily. Building features while access is pending is fine; discovering on day nine that a firewall rule takes two weeks is not.',
      },
      {
        heading: 'Launch to a small group first',
        body: 'Plan go-live for a single team around day seven, with a feature flag or user list controlling access. That leaves a week to fix what real use reveals before widening.',
      },
      {
        heading: 'Agree the rollback before you need it',
        body: 'Write down how to turn the tool off, who can do it and what users fall back to. Rehearse it once before go-live.',
      },
    ],
    workedExample: {
      title: 'Two weeks for an HR policy assistant',
      body: 'A professional services firm with 3,000 staff wants a policy assistant live before its annual review cycle. Days 1 to 3: access to the policy library, security review booked, evaluation set of 150 real employee questions agreed. Days 4 to 6: build and evaluate, reaching 93 percent correct with citations. Day 7: live for the 40-person HR team. Days 8 to 11: fix the 12 most common failure patterns. Day 12: open to all staff. Rollback is a single flag the HR systems lead can switch, falling back to the existing intranet search.',
    },
    warning: 'No exit criteria per gate is especially costly in a two-week launch, because there is no time to argue about readiness on day eleven. Agree the criteria for widening access on day one.',
    takeaways: [
      'Raise slow dependencies on day one',
      'Go live small around the midpoint, then widen',
      'A rehearsed rollback is part of the launch, not an afterthought',
    ],
    checkYourself: [
      'Which dependencies most often delay a launch, and why?',
      'Why launch to one team before everyone?',
      'What three facts should a rollback plan state?',
    ],
    referenceIds: ['ref-sre', 'ref-accelerate'],
  },

  // ── T6.4 Judgement cases ─────────────────────────────────────────────────
  {
    id: 't6-4-l1',
    moduleId: 't6-4',
    order: 1,
    title: 'Prioritising Competing Use Cases',
    tagline: 'Choosing one use case to start with focuses effort and proves value, but it disappoints the stakeholders whose requests wait.',
    readingMin: 6,
    objectives: [
      'Score candidate use cases on value, feasibility and risk',
      'Explain a prioritisation decision to stakeholders who lost out',
      'Sequence remaining use cases into a credible roadmap',
    ],
    sections: [
      {
        heading: 'Score value in the customer\'s money',
        body: 'Estimate annual value for each use case in hours or currency, using volumes from discovery. A use case that saves 4 minutes on 50,000 tasks a year is worth about 3,300 hours. Rough numbers are fine; the comparison is what matters.',
      },
      {
        heading: 'Weigh feasibility and risk honestly',
        body: 'Score data readiness, integration effort and the cost of a wrong answer. A high-value use case where a wrong answer causes regulatory harm may still go first, but only with a design that keeps a human in the loop. Show the scores so the reasoning is open to challenge.',
      },
      {
        heading: 'Give the waiting teams a date',
        body: 'Tell the stakeholders whose use cases wait what would move them up and roughly when they will start. A sequence with dates is easier to accept than a no.',
      },
    ],
    workedExample: {
      title: 'Three requests at a building society',
      body: 'Marketing wants campaign copy, operations wants mortgage document checks and the contact centre wants call summaries. Document checks: 30,000 cases a year, 12 minutes saved each, data ready, wrong answers caught by an existing second check. Call summaries: 400,000 calls, 2 minutes each, transcripts already stored. Campaign copy: high visibility but modest time saved. Call summaries go first at about 13,000 hours a year, document checks second, campaign copy third with a start date in quarter three.',
    },
    warning: 'Ignoring business value is the usual failure here: picking the most impressive demo or the loudest sponsor. Interviewers want to see the numbers behind the choice.',
    takeaways: [
      'Estimate value in hours or money, even roughly',
      'Feasibility and cost of error can override raw value',
      'Waiting stakeholders need a sequence and a date',
    ],
    checkYourself: [
      'How would you estimate the annual value of a use case in under a minute?',
      'When should a lower-value use case go first?',
      'What do you tell a sponsor whose use case was not chosen?',
    ],
    referenceIds: ['ref-canonical-handbook', 'ref-mom-test'],
  },
  {
    id: 't6-4-l2',
    moduleId: 't6-4',
    order: 2,
    title: 'Handling Poor Data and Scale-Up Requests',
    tagline: 'Proceeding with poor data shows progress quickly but sets an accuracy ceiling, while pausing to fix it protects quality and delays value.',
    readingMin: 7,
    objectives: [
      'Assess whether data quality blocks or merely limits a use case',
      'Propose a scoped path forward when data is poor',
      'Judge whether a pilot is ready to scale',
    ],
    sections: [
      {
        heading: 'Measure the data problem before you react to it',
        body: 'Sample 100 to 300 records and score them: how many are usable as-is, how many need cleaning, how many are unusable. "The data is bad" is not a finding; "40 percent of tickets have no product code" is. The numbers tell you whether to narrow scope, clean first or stop.',
      },
      {
        heading: 'Narrow to the slice where data is good',
        body: 'Often one region, product line or channel has clean data. Start there, prove value, and use the result to justify the cleaning work elsewhere. That is usually more persuasive than asking for a data project up front.',
      },
      {
        heading: 'Scale only when the pilot numbers hold',
        body: 'Before expanding, check that pilot results came from typical users and data, that support load is manageable and that cost per task holds at ten times the volume.',
      },
    ],
    workedExample: {
      title: 'Expanding a service desk assistant at a council',
      body: 'A local council piloted a ticket assistant with one team and cut resolution time by 25 percent. The chief digital officer now wants it across 14 departments. Sampling shows planning and housing tickets have no category codes in 60 percent of cases. You recommend expanding to the five departments with coded data next quarter, while a two-week tagging exercise covers 2,000 historical planning tickets. Cost at 14 departments would rise from 300 to about 4,000 pounds a month, which is within budget.',
    },
    warning: 'Ignoring business value can appear as a purely technical answer to a scale-up request. The question is not only whether the system can handle more load but whether each new department has a problem worth the cost.',
    takeaways: [
      'Quantify data problems with a sample',
      'Start in the slice with good data and use results to fund cleaning',
      'Check representativeness, support and cost before scaling',
    ],
    checkYourself: [
      'What sample size would you use for a quick data quality check, and why?',
      'Why is narrowing scope often better than requesting a data clean-up first?',
      'List three checks before scaling a pilot.',
    ],
    referenceIds: ['ref-ddia', 'ref-canonical-handbook'],
  },

  // ── T6.5 Adoption, change management and business impact ────────────────
  {
    id: 't6-5-l1',
    moduleId: 't6-5',
    order: 1,
    title: 'Driving Adoption After Launch',
    tagline: 'Time spent on training and champions after launch is time not spent on features, but an unused tool delivers nothing.',
    readingMin: 6,
    objectives: [
      'Identify the main reasons users do not adopt a new tool',
      'Recruit and support champions inside the user team',
      'Close the feedback loop visibly',
    ],
    sections: [
      {
        heading: 'Fit the tool into the existing workflow',
        body: 'Users adopt tools that appear where they already work, such as inside the case system or email client, far more readily than tools in a new tab. If integration takes an extra week, it is usually worth it. Every extra click is a reason to go back to the old way.',
      },
      {
        heading: 'Recruit champions, not just trainees',
        body: 'Find two or three respected users in each team who like the tool and give them early access and a direct line to you. Colleagues trust peers more than vendors. Ask champions to share one real example a week in the team channel.',
      },
      {
        heading: 'Show that feedback changes things',
        body: 'Publish a short note every fortnight listing what users reported and what changed. Visible fixes build more trust than any training session.',
      },
    ],
    workedExample: {
      title: 'A planning assistant for a building contractor',
      body: 'After launch, only 18 of 70 site managers used the scheduling assistant weekly. Interviews showed it lived in a separate web app that needed a laptop, while managers worked from tablets on site. The team moved it into the existing site diary app in nine days and recruited one champion per region. Weekly use rose to 52 of 70 within a month, and the fortnightly change note listed eleven fixes drawn from user reports.',
    },
    warning: 'Measuring usage, not outcomes, is tempting because usage is easy to count. Weekly users tell you about adoption, but they do not tell you whether schedules slipped less, which is what the customer paid for.',
    takeaways: [
      'Put the tool where users already work',
      'Peers persuade better than vendors',
      'Visible responses to feedback sustain adoption',
    ],
    checkYourself: [
      'Why does workflow fit matter more than training?',
      'What makes a good champion?',
      'How would you show users that their feedback is acted on?',
    ],
    referenceIds: ['ref-accelerate'],
  },
  {
    id: 't6-5-l2',
    moduleId: 't6-5',
    order: 2,
    title: 'Measuring Business Impact',
    tagline: 'Measuring real outcomes takes longer and is noisier than counting usage, but it is the only evidence that justifies renewal and expansion.',
    readingMin: 7,
    objectives: [
      'Distinguish usage, quality and outcome metrics',
      'Design a fair before-and-after or comparison measurement',
      'Report impact in terms the sponsor\'s finance team accepts',
    ],
    sections: [
      {
        heading: 'Track three layers of metric',
        body: 'Usage shows whether people use the tool. Quality shows whether its outputs are right. Outcomes show whether the business result moved: handling time, error rate, revenue, cost. Report all three, but lead with outcomes, because they answer the question the sponsor will be asked.',
      },
      {
        heading: 'Compare against something fair',
        body: 'A before-and-after comparison is easily confused by seasonality or staffing changes. Where you can, compare teams with and without the tool over the same weeks, or stagger the rollout so later teams act as a comparison group.',
      },
      {
        heading: 'Convert outcomes into money carefully',
        body: 'Translate time saved into cost only with the customer\'s own rates, and say whether the time was redeployed or simply freed.',
      },
    ],
    workedExample: {
      title: 'Impact report for a claims intake tool',
      body: 'Six regional teams received the tool in two waves, three teams each, four weeks apart. In those four weeks, intake time in the first wave fell from 11 to 4 minutes per claim, while the waiting teams stayed at 11. Bounce-backs fell from 6 to 2.5 percent. At 1,200 claims a day, that is about 140 handler hours a day. Using the insurer\'s loaded cost rate, finance valued it at 1.1 million pounds a year, noting that the time was redeployed to complex claims rather than cut.',
    },
    warning: 'Measuring usage, not outcomes, leads to reports full of active-user charts that a finance team cannot use. If the sponsor cannot quote an outcome number at renewal, the project is at risk however popular it is.',
    takeaways: [
      'Usage, quality and outcome: report all three, lead with outcome',
      'Use a comparison group where possible',
      'Value time with the customer\'s rates and say how it was used',
    ],
    checkYourself: [
      'Give one usage, one quality and one outcome metric for a support assistant.',
      'How does a staggered rollout help impact measurement?',
      'Why state whether saved time was redeployed or removed?',
    ],
    referenceIds: ['ref-accelerate', 'ref-ragas'],
  },

  // ── T6.6 Debugging in the customer's environment ─────────────────────────
  {
    id: 't6-6-l1',
    moduleId: 't6-6',
    order: 1,
    title: 'Triage Before You Theorise',
    tagline: 'Collecting evidence before forming a theory feels slow during an incident, but it avoids fixing the wrong layer under pressure.',
    readingMin: 6,
    objectives: [
      'Run a structured first fifteen minutes of an on-site incident',
      'Establish scope, onset and recent changes',
      'Communicate status to the customer early',
    ],
    sections: [
      {
        heading: 'Establish scope and onset first',
        body: 'Ask who is affected, since when and how badly. All users or one team? Every request or some? Started at a specific time? A failure that began at 09:02 for one office points somewhere very different from a gradual decline across all users.',
      },
      {
        heading: 'Ask what changed',
        body: 'Most incidents follow a change: a deployment, a configuration update, a certificate renewal, a new data load, a network rule. In a customer\'s environment many changes are made by teams you have never met, so ask the customer\'s operations contact for their change log as well as checking your own.',
      },
      {
        heading: 'Send a short status note within fifteen minutes',
        body: 'Tell the customer what is affected, what you know, what you are checking and when they will next hear from you. Silence makes incidents feel worse than they are.',
      },
    ],
    workedExample: {
      title: 'Slow answers at a hospital trust',
      body: 'At 10:15 the clinical coding team reports that the coding assistant takes 40 seconds instead of 4. Scope: only the two sites on the new network segment; the other three are normal. Onset: 08:30, when that segment moved behind a new web proxy. Your own logs show model calls complete in 3 seconds, so the delay sits before your service. The trust\'s network team confirms that the proxy is inspecting every request. Status notes went out at 10:25 and 10:55.',
    },
    warning: 'Blaming the model first is the reflex to resist. In customer environments, network, identity, data and configuration problems are far more common causes than a sudden change in model behaviour.',
    takeaways: [
      'Scope and onset narrow the search fastest',
      'Ask for the customer\'s change log, not only yours',
      'A status note within fifteen minutes buys patience',
    ],
    checkYourself: [
      'What three facts do you establish before forming a theory?',
      'Why ask for the customer\'s change log?',
      'What goes into a first status note?',
    ],
    referenceIds: ['ref-sre'],
  },
  {
    id: 't6-6-l2',
    moduleId: 't6-6',
    order: 2,
    title: 'Isolating the Failing Layer',
    tagline: 'Testing each layer separately takes discipline and access you may not have, but it is the fastest way to a cause you can prove.',
    readingMin: 7,
    objectives: [
      'Divide an AI system into testable layers',
      'Use known-good inputs to locate a failure',
      'Work effectively with limited access to customer systems',
    ],
    sections: [
      {
        heading: 'Split the request path into layers',
        body: 'A typical path is client, network and identity, your service, retrieval or data, the model call and post-processing. For each layer decide what a healthy response looks like. Then test layers independently, starting from the one closest to the symptom.',
      },
      {
        heading: 'Replay a known-good request',
        body: 'Keep a small set of saved requests with known correct outputs. Replaying one through each layer tells you quickly whether the model, the retrieved context or the input itself has changed. If the saved request still passes, the problem is in the new inputs or data, not the pipeline.',
      },
      {
        heading: 'Ask for evidence when you cannot see the system',
        body: 'Where you lack access, ask the customer\'s team for specific outputs: one log line, one configuration value, one query result. Narrow requests get faster answers.',
      },
    ],
    workedExample: {
      title: 'Wrong answers at an energy supplier',
      body: 'The tariff assistant started giving outdated prices on Monday. The saved test request about a known tariff still returns the right answer, so the model and prompt are fine. Retrieval logs show new questions retrieving documents dated last quarter. The customer\'s content team confirms that Friday\'s tariff update was uploaded to a new folder the indexer does not watch. Adding the folder and re-indexing 1,800 documents fixes it in 40 minutes.',
    },
    warning: 'Blaming the model first wastes hours on prompt changes when the fault is upstream. Rule out data and retrieval with a known-good replay before touching the prompt or the model version.',
    takeaways: [
      'Name the layers and what healthy looks like in each',
      'Known-good replays separate pipeline faults from data faults',
      'Narrow evidence requests get fast answers',
    ],
    checkYourself: [
      'List the layers in a typical retrieval-backed assistant.',
      'What does a passing known-good replay tell you?',
      'How would you phrase a request for evidence from a customer\'s operations team?',
    ],
    referenceIds: ['ref-sre', 'ref-rag-paper'],
  },
  {
    id: 't6-6-l3',
    moduleId: 't6-6',
    order: 3,
    title: 'Fixing, Communicating and Preventing Recurrence',
    tagline: 'A quick workaround restores service fast but can hide the cause, while a full fix takes longer and needs the customer\'s teams to act.',
    readingMin: 6,
    objectives: [
      'Separate mitigation from root-cause fix',
      'Write a blameless incident summary for the customer',
      'Agree preventive actions with owners',
    ],
    sections: [
      {
        heading: 'Mitigate first, then fix',
        body: 'Restore service with the smallest safe change, such as rolling back, switching to a fallback or disabling a feature. Then pursue the cause. Say clearly to the customer which you have done, so nobody mistakes a workaround for a resolution.',
      },
      {
        heading: 'Write a blameless summary',
        body: 'Within two working days, send a one-page summary: timeline, impact, cause, what fixed it and what will prevent it. Describe systems and decisions, not people. A blameless tone keeps the customer\'s teams willing to share information next time.',
      },
      {
        heading: 'Give every preventive action an owner and date',
        body: 'Actions such as "add a monitor on index freshness" or "include us in proxy change notices" need a named owner on each side and a due date.',
      },
    ],
    workedExample: {
      title: 'Closing out the outdated tariff incident',
      body: 'Mitigation on Monday: a banner warning that prices may be outdated, shown for 3 hours. Fix: indexer configuration updated and 1,800 documents re-indexed. Summary on Wednesday: impact of 6 hours and about 900 conversations, cause an unwatched folder, no blame attached to the content team. Preventive actions: a freshness alert if no new documents are indexed within 48 hours of a tariff change, owned by your team by Friday; a content upload checklist, owned by the customer\'s content lead within two weeks.',
    },
    warning: 'Blaming the model first also distorts the summary. If the write-up says "the model hallucinated" when the cause was stale data, the preventive actions will target the wrong layer and the incident will recur.',
    takeaways: [
      'Label mitigations and fixes separately',
      'Blameless summaries keep information flowing',
      'Preventive actions need owners on both sides',
    ],
    checkYourself: [
      'What is the difference between a mitigation and a fix?',
      'What five sections belong in an incident summary?',
      'Why include the customer\'s team as owners of preventive actions?',
    ],
    referenceIds: ['ref-sre'],
  },
]
