# The Data Flywheel

*Production traces are the most valuable training data a team has, and the easiest to turn into offline numbers that look great and mean nothing.*

◷ 4 min

Every production run with an outcome is a potential training or evaluation example. Pass traces through three gates before they become a dataset, and when an offline gain looks surprisingly large, suspect leakage before celebrating.

**Objectives:**

- turn production traces into a dataset through deduplication, a proper split and human adjudication;
- document every dataset so its numbers can be trusted later;
- diagnose an offline gain that collapses in production.

---

## Deduplicate Before Anything Else

Production traffic repeats far more than teams expect. A hundred thousand raw traces may be only a few thousand distinct problems. Without deduplication, the model overfits to the popular problems, and the evaluation set contains their twins. Deduplicate by trajectory hash and by embedding similarity.

## Split by Time and User, Never at Random

A random split puts one user's near-identical requests on both sides. Every number reported later is then quietly inflated. Split held-out data by time and by user. The most recent weeks, held out entirely, are the honest test of how the model will do next month.

## Send Hard Cases to a Human

An automatic outcome label is not the same as "correct". "The user did not complain" is a weak label. Route low-agreement, high-impact cases to human adjudication, and measure agreement between adjudicators.

```
production traces + outcomes → dedupe (trajectory hash + embedding)
   → split held-out by TIME and USER → human adjudication on low-agreement,
     high-impact cases → candidate dataset + datasheet
```

## Ship a Datasheet With Every Dataset

Document the collection window, the filters, the deduplication method and how much it shrank the data, the split strategy, the label source and the known biases. An hour of documentation saves weeks of debugging six months later, when someone asks why a number moved.

> **Warning: when an offline gain looks too good, suspect leakage first.** Saying so unprompted, before anyone asks, is described as a strong senior signal. Check the split, the label source and the coverage before believing the number.

## Worked Example: The Fine-Tune That Scored 94%

The book reports a real case. A routing agent's fine-tune scored 94% on a held-out set, beating an 81% prompted baseline. In production it reached only about 78%, below the baseline it replaced.

Three errors compounded. The held-out set was split at random from 140,000 traces that, after deduplication, were only about 9,000 distinct requests. Many held-out items had near-twins in training. The labels came from an earlier version of the same system's routing decisions. The model learned to reproduce the old system's errors, and evaluation scored them as correct. The corpus also covered a single quarter, missing two categories that appear only at fiscal year-end.

The fix applied all three gates. The team deduplicated to distinct problems and split by time, holding out the most recent 4 weeks entirely. They relabelled a stratified sample by human adjudication with measured agreement. The honest offline number came out near 83%, and production matched it within two points. A smaller number that was true beat a larger one that was not.

---

## Key Takeaways

- Deduplicate traces first, because production repeats far more than expected.
- Split held-out data by time and user, never at random.
- Route low-agreement, high-impact cases to human adjudication instead of trusting automatic labels.
- Ship a datasheet with every dataset.
- Suspect leakage first when an offline gain looks surprisingly large.

## Check Yourself

1. **Why does a random split inflate offline metrics on production traces?**
   Near-identical requests from the same user, or the same popular problem, land on both sides, so the test set contains twins of training examples.

2. **What went wrong with labels in the 94% case?**
   They came from the previous system's own routing decisions, so the model learned that system's errors and evaluation scored them as correct.

3. **What should a datasheet record?**
   The collection window, filters, deduplication method and its effect on volume, split strategy, label source and known biases.

