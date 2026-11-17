# Practise Networks and Identity


## How to use this practice

These questions put you inside a customer's estate with something broken or about to be built. Answer aloud as if the customer's engineer is listening, naming the first check you would run and why. Then compare with the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Diagnosing proxy, private endpoint and timeout faults.
> - Writing connectivity, egress and certificate plans before install day.
> - Fixing role mapping and session faults after single sign-on.
> - Handling leavers, admin requests and leaked credentials.

## Network faults in the field

Taught in [following a request through the network](/learn/fde-deploying-in-the-estate/networks-and-identity/following-a-request-through-the-network).

<details>
<summary>Practice question 1. Your service works in your own cloud. Inside Dalby Freight's network, every call to the model API fails with "certificate signed by unknown authority". What is happening, and what do you do?</summary>

- **Answer:** Dalby's proxy is probably inspecting TLS: it decrypts the traffic and re-signs it with Dalby's own root certificate, which your image does not trust. Confirm by reading the certificate chain from inside the container and checking the issuer. Then either add Dalby's root to the image's trust bundle, or ask Dalby to exclude the model API's hostname from inspection. Never switch certificate verification off.
- **Trade-off:** Trusting their root is quick and lets them see the traffic. An exclusion keeps it private and needs their security team's approval.
- **Follow-up to expect:** "The client library pins certificates." Then only an exclusion will work.

</details>

<details>
<summary>Practice question 2. Bexley Council moved its database behind a private endpoint. The app in one network connects, and the reporting job in a peered network times out. Why, and how do you fix it?</summary>

- **Answer:** Both networks route to the endpoint, so suspect DNS. The reporting network's resolver probably lacks the private zone and returns the public address, which is now closed. The call times out. Look up the database name from both networks and compare. Fix by linking the private zone to the peered network or forwarding its lookups to a resolver that has it. Then check the endpoint's network rules allow the job's range.
- **Trade-off:** Linking zones per network is precise and needs upkeep. A central resolver is simpler to run and becomes a shared dependency.
- **Follow-up to expect:** "Can we put the IP in the job's config?" Only as a test. TLS name checks and failover need the name.

</details>

<details>
<summary>Practice question 3. At Cromer Insurance, a command-line call to the partner API from the server works. The service on the same server times out on the same call. What do you check?</summary>

- **Answer:** A timeout means packets are dropped, so the service is probably taking a different path from your shell. Your shell likely has proxy variables set, and the service's environment, started by the platform, does not. Check the service's actual environment, then whether its HTTP library honours proxy variables at all. Also compare DNS answers and the trust store the service uses. Set the proxy explicitly in the service's configuration.
- **Trade-off:** Setting it per service is explicit and needs repeating for each one. A system-wide setting covers all and can send internal calls through the proxy unless they are excluded.
- **Follow-up to expect:** "How do you stop it recurring?" Log the proxy in use at startup.

</details>

## Network plans before install day

Taught in [following a request through the network](/learn/fde-deploying-in-the-estate/networks-and-identity/following-a-request-through-the-network).

<details>
<summary>Practice question 4. Write the connectivity checklist you send Esher Pharma two weeks before installing your service in their data centre.</summary>

- **Answer:** For every connection, inbound and outbound: source, destination hostname, port, protocol and purpose. Then ask about the DNS servers and search domains the workloads use, any outbound proxy and whether it inspects TLS, the root certificates to trust, how long approving a new destination takes, which private endpoints exist and who on their side can run tests with you. End with a joint test from the target host before install day.
- **Trade-off:** A full checklist costs them a day. Skipping it costs days of install-week debugging.
- **Follow-up to expect:** "They will not answer half of it." Book a call with their network owner and fill it in together.

</details>

<details>
<summary>Practice question 5. Bexley Council wants your assistant to run with no public inbound access and outbound traffic only to approved services. Design it.</summary>

- **Answer:** Inbound: users reach the app through the council's internal load balancer, with no public address. Cloud services such as the database and storage use private endpoints, with a private DNS zone on every calling network. Outbound: all internet traffic leaves through the council's proxy or egress gateway, with an allow list of exact hostnames, such as the model API. Default-deny network rules everywhere else, and log every denied connection.
- **Trade-off:** Each new dependency now needs an approval. In exchange, nothing leaves to a destination the council did not choose.
- **Follow-up to expect:** "The model provider offers a private connection." Prefer it, and remove the internet route for that traffic.

</details>

<details>
<summary>Practice question 6. Dalby's internal certificate for your service expires every 90 days, and renewal is manual. Plan renewal so it never causes an outage.</summary>

- **Answer:** First, list every certificate the service uses, with its expiry and owner. Then automate: request renewal through Dalby's certificate service or an ACME endpoint at about day 60, which leaves 30 days to fix a failure. Reload the new certificate without a full restart, or with a rolling restart. Alert at 30 and 7 days, measured from outside. Check the full chain is served. Put manual steps in a runbook with a named owner until automation exists.
- **Trade-off:** Automation needs access to their certificate service. Manual renewal needs no access and relies on someone remembering.
- **Follow-up to expect:** "Why measure from outside?" It sees what clients receive, including a proxy's certificate.

</details>

## Sign-in and sessions

Taught in [SSO, OIDC and tokens](/learn/fde-deploying-in-the-estate/networks-and-identity/sso-oidc-and-tokens).

<details>
<summary>Practice question 7. After Esher Pharma switches your app to its SSO, a lab technician signs in and gets the administrator role. How do you investigate and fix it?</summary>

- **Answer:** First remove the wrong role and check what the technician did with it. Then read the mapping log for that sign-in: which groups arrived in the token and which rule gave the role. Likely causes: mapping by group name where a similar name matched, a default role for unmatched users, the group list missing because the user is in too many groups, or the first match winning. Fix by mapping on group IDs, defaulting to no access and testing with real accounts.
- **Trade-off:** Strict mapping blocks some legitimate users at first. A generous default grants access nobody approved.
- **Follow-up to expect:** "Could other users have it too?" List everyone holding the role and confirm each one with its owner.

</details>

<details>
<summary>Practice question 8. Cromer disabled an employee's account at 09:00. At 14:00 the same day, your app's logs show the employee still reading claims. Why, and what do you change?</summary>

- **Answer:** Disabling the account stopped new sign-ins, but your app kept its own session or kept accepting a token issued before 09:00. End the session now and revoke the refresh token. Then change the design: short access tokens, a maximum session lifetime, a refresh that fails once the IdP has disabled the account, and handling deprovisioning or logout events from the IdP. Agree with Cromer how fast access must end for a leaver.
- **Trade-off:** Shorter tokens mean more calls to the IdP. Long sessions leave leavers inside.
- **Follow-up to expect:** "Their IdP cannot push events." Then the token lifetime is the gap, so set it from their requirement.

</details>

## Accounts and access

Taught in [service accounts and least privilege](/learn/fde-deploying-in-the-estate/networks-and-identity/service-accounts-and-least-privilege).

<details>
<summary>Practice question 9. An engineer at Dalby left last week. You find that two of your integration jobs authenticate with his personal API key. What do you do?</summary>

- **Answer:** Do not revoke it first, or the jobs stop with nobody ready. Within the day: create a service account for each job with only the permissions it needs, owned by a team. Move the jobs, confirm they run, then revoke his key and any other credentials he held. Check the key's use since he left for anything unexpected. Then search for other personal credentials in shared work, and add credentials to Dalby's leaver checklist.
- **Trade-off:** Leaving the key live for hours is a risk. Revoking at once breaks work. If use looks suspicious, revoke now and accept the outage.
- **Follow-up to expect:** "Who approves the new accounts?" The system owner on Dalby's side.

</details>

<details>
<summary>Practice question 10. A team lead at Bexley asks you to give her admin rights in your app "so she stops waiting on IT". How do you respond?</summary>

- **Answer:** Ask what she is waiting for. If it is adding staff to her team, offer a team-manager role that can add and remove members of her team only. If it is a one-off change, do it with her or grant a time-limited elevation with approval and a logged reason. Keep full administration with the named owners. Explain that admin rights would also let her see other teams' data, which she does not need.
- **Trade-off:** A new scoped role takes a little design work. Admin rights take seconds and make her an audit finding.
- **Follow-up to expect:** "Her director insists." Put the request and the risk in writing to the system owner.

</details>

<details>
<summary>Practice question 11. Design how users are provisioned and deprovisioned in your app at Esher Pharma, whose staff join, change teams and leave weekly.</summary>

- **Answer:** Drive everything from Esher's directory. Users sign in through SSO, and SCIM creates, updates and deactivates them in the app. Roles follow directory groups, re-evaluated at every sign-in and on every update. Movers lose old access. A deactivation ends sessions, revokes tokens and personal keys, and reassigns owned jobs to a team. Run a monthly report of accounts with no recent sign-in, and alert when a deactivation fails.
- **Trade-off:** SCIM needs setup on both sides. Manual provisioning is quick to start and drifts within weeks.
- **Follow-up to expect:** "What if SCIM breaks for a day?" Sign-in still checks the IdP, and the monthly report catches leftovers.

</details>

## Leaked secrets

Taught in [secrets and leaks](/learn/fde-deploying-in-the-estate/networks-and-identity/secrets-and-leaks).

<details>
<summary>Practice question 12. Cromer reports that an API key for your service appears in its log platform and in an old container image in its registry. Walk through your response.</summary>

- **Answer:** Revoke and replace the key first, with an overlap if it can be done within the hour. Check the key's access logs since the leak for unknown sources. Then remove copies: delete the affected image digests from the registry, mirrors and build caches and rebuild without the key, and purge matching log entries from the platform, its indexes and exports. Find how it leaked, such as a build argument or debug logging, and fix that. Add secret scanning to the pipeline.
- **Trade-off:** Instant revocation may cause a short outage. Waiting keeps a known-leaked key working.
- **Follow-up to expect:** "The log platform cannot delete entries." Record what remains and when retention removes it.

</details>

## Key takeaways

- Test each network layer from the workload's own host, and suspect DNS when private endpoints time out.
- Send a connectivity checklist before install day, and automate certificate renewal with alerts.
- Map roles by group ID with no default access, and keep sessions short enough for leavers.
- Move shared work to team-owned service accounts before revoking a leaver's credentials.
- On a leak, revoke first, check for use, then remove every copy.

## Check yourself

<details>
<summary>1. In practice question 3, why does the command line work while the service times out?</summary>

The shell has proxy settings the service's environment lacks, so the service tries to go direct and the firewall drops its packets.

</details>

<details>
<summary>2. In practice question 9, why move the jobs before revoking the key?</summary>

Revoking first stops the jobs with no replacement ready. Moving them to service accounts first keeps them running, unless use of the key looks suspicious.

</details>
