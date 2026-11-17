---
title: "Practise debugging in the customer's environment"
subtitle: "Four practice questions: an SDK regression found by comparing a success with a failure, failures in one request of 500, one slow environment and a procedure for catching drift."
track: Discovery, Scoping and Delivery
module_group: Delivery and adoption
module_code: T20.7
module_name: Debugging in the customer's environment
lesson: 5
lessons: ["Stabilise the customer first", "Build the change timeline", "Isolate the failing boundary", "Collect evidence and escalate", "Practise debugging in the customer's environment"]
level: intermediate
reading_time: "9 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, debugging, SDK, configuration drift]
---

## How to use this practice

These questions put you in a customer's estate with a fault you did not cause and cannot see directly. Answer aloud as if the customer's engineering lead is on the call, then compare with the outline. Each answer should show the order you work in: stabilise, bracket, isolate, then fix and prevent.

Every customer and figure below is fictional.

A related question, a service that keeps hanging and a team that keeps restarting it, is answered in [practise operating after go-live](../../fde-deploying-in-the-estate/operating-after-go-live/05_Practise_Operating_After_Go_Live.md), practice question 9.

> **What you'll practise**
>
> - Finding an SDK regression by comparing one successful request with one failed request.
> - Investigating a fault that hits one request in 500.
> - Finding why one environment is slow when the release is the same.
> - Writing a procedure that catches environment and configuration drift.

## An SDK regression drill

Taught in [build the change timeline](02_Build_the_Change_Timeline.md) and [isolate the failing boundary](03_Isolate_the_Failing_Boundary.md).

<details>
<summary>Practice question 1. Polperro Mutual, a building society, calls your API through your SDK from two apps. Since Thursday, its mobile banking app gets a 400 error on about 8% of payment-status calls. Its branch app, on the same API, gets none. You have one successful and one failed request. Walk through the comparison and what you do next.</summary>

- **Answer:** Stabilise first: confirm payments themselves succeed, agree that the app shows "status pending" instead of an error, and set the next update. Then compare the two requests field by field. Polperro's showed three differences: SDK version 4.2 in the mobile app against 4.1 in the branch app, a new header the newer SDK sends, and a payment reference containing a slash in the failing request. Bracket it: the mobile app's 4.2 release went live Thursday 10:00 UTC, the first 400 arrived at 10:07. Swap inputs: the same reference through 4.1 succeeds, through 4.2 fails. So 4.2 encodes the slash differently, and only references with a slash fail, which explains the 8%. Ask Polperro to pin 4.1 in the mobile app, file the regression with a minimal reproduction, and add a reference with a slash to the SDK's tests.
- **Trade-off:** Pinning the old SDK delays any fix 4.2 carried. Check its release notes before pinning.
- **Follow-up to expect:** "Polperro cannot ship a new app quickly." Accept both encodings at the API for a fixed period, and log which clients still send the old one.

</details>

## Patterns in intermittent failures

Taught in [isolate the failing boundary](03_Isolate_the_Failing_Boundary.md).

<details>
<summary>Practice question 2. Selwood Pharmacy's summary assistant fails on about one request in 500, with a 401 error. It has done so for a month. No single branch, pharmacist or patient stands out. How do you find the cause?</summary>

- **Answer:** A steady ratio says the failing requests share something rare. A 401 points at authentication. Log each request's token issue and expiry times, instance, retry count and timing, then compare 50 failures with 500 healthy requests. Selwood's comparison showed every failure used a token within 30 seconds of expiry, and the request took longer than the time left. The token expired in flight. The fix is to refresh tokens a few minutes before expiry, not at expiry, and to retry once on a 401 with a fresh token. Then watch the ratio for a week to confirm it falls to zero.
- **Trade-off:** Refreshing early means more token requests to the identity provider. At this volume the extra load is small.
- **Follow-up to expect:** "The tokens look fine." Check clock skew between your hosts and the identity provider, which shortens a token's life the same way.

</details>

<details>
<summary>Practice question 3. Brancaster Freight's test environment takes nine seconds to extract a customs document. Production takes two, with the same release. Brancaster wants to know whether production will slow down too. How do you investigate?</summary>

- **Answer:** Split one request's time into stages in both environments: DNS, connect, TLS, waiting for the API, transfer and your own processing. In Brancaster's case, DNS took six seconds in test and almost nothing in production. Test hosts used a resolver that first tried a retired DNS server and waited for it to time out before trying the next. That difference lives in test only, so production is not at risk. Fix the resolver order in test. Then compare the remaining stages, because a smaller database or a far-away region can add time too.
- **Trade-off:** Fixing test costs time that adds nothing to production. Leave it slow and test results stop meaning anything.
- **Follow-up to expect:** "Every stage is slower in test." Then compare capacity: CPU, memory and database size, using the USE method.

</details>

## Keeping environments the same

Taught in [build the change timeline](02_Build_the_Change_Timeline.md).

<details>
<summary>Practice question 4. Coniston Housing runs your assistant in development, test and production. Write the procedure that catches drift between them and between hosts.</summary>

- **Answer:** Declare each environment's intended state in version control: image digests, dependency lock files, configuration per environment, certificate fingerprints and the list of intended differences, such as data size. Every night, a job reads the running state from each host and compares it with the declared state and with its sibling hosts. Any unintended difference raises a ticket to the owning team, with the diff attached. Fixes go in as changes to the declared state, then redeploy, never as edits on a host. Review the drift report weekly with Coniston's IT team, and rebuild every environment from source each month, so patches arrive as tested changes.
- **Trade-off:** Strict checks raise tickets for harmless differences at first. Tune the intended-differences list for two weeks before alerting.
- **Follow-up to expect:** "Someone needs an urgent hotfix on one host." Allow it with a ticket, and the nightly check flags it until it reaches the declared state.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- Compare one success and one failure field by field, then swap inputs and paths to see which moves the failure.
- Bracket an SDK regression with the release time and the first failure.
- A steady one-in-N ratio means the failures share something rare. Find it by comparing attributes.
- When one environment is slow, split one request's time into stages in both environments.
- Declare each environment's state, compare the running state nightly and fix by redeploying.

## Check yourself

<details>
<summary>1. In practice question 1, why did only 8% of calls fail?</summary>

Only payment references containing a slash were encoded differently by SDK 4.2. Every other reference worked, so the failure rate matched the share of references with a slash.

</details>

<details>
<summary>2. In practice question 2, why was the one-in-500 ratio steady for a month?</summary>

It depended on timing that recurs at a steady rate: a request starting close to its token's expiry and taking longer than the time left. Nothing changed, so the ratio did not change either.

</details>
