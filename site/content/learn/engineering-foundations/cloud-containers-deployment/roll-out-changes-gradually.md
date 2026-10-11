# Roll Out Changes Gradually

*A gradual rollout limits how many users meet a bad release, but it only works when the deployed version is pinned and the old one is a switch away.*

A bad GenAI release rarely crashes; it gives worse answers. Pin every model version, expose a new one to a small, measured share of users first, and keep the old version one switch away.

**Objectives:**

- explain why a model version must be pinned exactly;
- run a model upgrade in stages with a fast rollback;
- compare blue-green and canary deployments, and automate the canary decision.

---

## Pin the Exact Model Version

Use the exact, dated version string of a model, never a floating name. A floating name lets the provider change behaviour silently. Nothing in the release history then explains the change. Pinning makes every change of model a deliberate release.

## Upgrade the Model in Measured Steps

Move to a new model version in five steps. Run the evaluation suite on the new model. Deploy it to staging and review sample answers. Start a canary, splitting traffic with a feature flag, for example to 5% of users. Watch faithfulness, user feedback and error rate for 24 to 48 hours. Then ramp up through 5%, 25%, 50% and 100%.

Keep the old version available throughout. Rollback should be a configuration or flag change that takes under 2 minutes and needs no code deploy. A rollback that needs a build and a deploy is too slow for a live quality problem.

## Prefer a Canary Over a Single Switch

Two rollout patterns suit GenAI APIs.

| Pattern | How it works | Rollback |
|---|---|---|
| Blue-green | Two identical environments. Deploy the new one beside the live one, test it with a health check and an evaluation run, then switch all traffic at once. | Switch back instantly. |
| Canary | Send a small share of real users to the new version and compare it with the old one. Choose users by hashing the user id behind a feature flag. | Turn the flag off. |

A canary is usually better for GenAI. A bad release shows up as worse answers rather than crashes. Only real traffic, compared side by side, reveals that, and a canary exposes few users while it does.

## Automate the Canary Decision

Do not leave promotion to someone reading a dashboard. Check automatically that the new version's faithfulness, error rate and P99 latency stay within set margins of the old one. For example, require quality of at least 95% of baseline. Promote when the margins hold and roll back when they do not.

> **Warning: a floating model name defeats the whole rollout.** If the name can move, the canaried version may not be the one serving traffic next week. Pin the dated version before any of the steps above mean anything.

## Worked Example: Upgrading a Support Assistant's Model

A team moves its support assistant to a newer dated model version.

The evaluation suite passes on the new model, and staging samples look right. A feature flag sends 5% of users, chosen by hashing the user id, to the new version. For 48 hours the team watches faithfulness, feedback and error rate. The automated check compares the canary with the old version: quality must stay at or above 95% of baseline, and error rate and P99 latency within their margins.

At 25%, faithfulness slips below the margin. The check flips the flag back. All users return to the old version in under 2 minutes, with no code deploy.

The rollout did its job. A quarter of users met the weaker version for a short time, instead of everyone meeting it for days.

---

## Key Takeaways

- Pin the exact dated model version, so a provider update cannot silently change behaviour.
- Upgrade in steps: evaluation, staging review, a 5% canary for 24 to 48 hours, then 25%, 50% and 100%, with rollback as a flag change under 2 minutes.
- Blue-green switches all traffic at once; a canary, chosen by hashed user id, is usually better for GenAI because regressions show as worse answers.
- Automate promotion with margins on faithfulness, error rate and P99 latency, such as quality at least 95% of baseline.

## Check Yourself

1. **Why pin a dated model version instead of a floating name?**
   A floating name lets the provider change behaviour silently. A pinned version makes every model change a deliberate release.

2. **What makes a rollback fast enough for a live quality problem?**
   The old version stays available, and rollback is a configuration or flag change that takes under 2 minutes with no code deploy.

3. **Why is a canary usually better than blue-green for a GenAI API?**
   A bad release gives worse answers rather than crashes. A canary compares real traffic on both versions while only a small share of users is exposed.

