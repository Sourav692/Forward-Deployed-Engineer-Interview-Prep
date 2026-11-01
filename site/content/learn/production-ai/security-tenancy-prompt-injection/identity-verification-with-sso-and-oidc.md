# Identity Verification with SSO and OIDC

*A local user table is quick to build and easy to reason about, but it cannot prove that a caller is who their token claims.*

Production identity is not a bigger lookup table; it is a verification problem. Verify the token before any permission logic runs, then hand a trusted principal to the access rules from [The Seven Access Rules](/learn/production-ai/enterprise-rag-in-production/the-seven-access-rules).

**Objectives:**

- explain why real identity is a verification problem rather than a lookup;
- list the checks a token must pass before any permission logic runs;
- describe group mapping drift and just-in-time provisioning.

---

## Separate Verification From Lookup

Every authorisation rule in the enterprise RAG and agent platforms assumes identity is already established. The access engine takes a principal and trusts it. In the demos, that principal comes from a JSON file. In production, something has to earn that trust first.

A local lookup answers one question: given a user id, what are this user's attributes? Single sign-on (SSO) through OpenID Connect (OIDC) answers a different one. Is this token genuinely from the customer's identity provider, still valid, and who does it actually represent? An engine cannot check a claim it has already accepted. So the verification sits in front of it, as its own layer.

Local user tables work for demos. They break in multi-tenant software, where each customer brings its own identity provider, such as Okta, Azure AD or Google Workspace.

## Validate the Token Before Anything Else

A request arrives with a bearer token, a JSON Web Token (JWT). Three verification steps run before any permission logic.

1. **Signature.** Fetch the identity provider's published public keys from its key-set endpoint. Verify the token's signature against them. This proves the customer's identity provider issued it.
2. **Claims.** Check expiry: an `exp` claim earlier than now is rejected. Check audience: the `aud` claim must name this app. Check issuer: the `iss` claim must be the expected identity provider.
3. **Role mapping.** Map the token's groups to internal capabilities, then grant or reject.

A forged or stale token is rejected at step 1 or 2, before it can reach a single access rule.

## Map the Customer's Groups, Never Invent Roles

The customer's Okta or Azure AD groups are the source of truth. The platform maps them to its own role vocabulary. It does not invent roles locally.

That mapping is configuration, and configuration can drift silently. A group renamed on the customer's side orphans the mapping until someone notices. The users in it quietly lose, or keep, access they should not.

> **Warning: two answers sound reasonable and are red flags.** "We'll store usernames and passwords in our database" and "we'll create a roles table and let admins assign roles in our UI" both bypass the customer's identity provider. Say instead: "We integrate via OIDC, and roles come from the customer's identity-provider groups."

## Provision Users Just in Time

The first time a user from a newly connected customer logs in, there is no local record. One has to be created from the token's claims on the spot. It must be scoped to the right company, and it must never start with more access than intended by default.

## Hand a Fresh Principal to the Access Rules

Once the token is validated and mapped, every downstream rule works exactly as if identity had been simple all along. The gap is entirely in front of the engine. In the enterprise RAG project, `identity.py` resolves the principal fresh on every request. That is the shape to keep; the identity-provider integration replaces the JSON file behind it.

## Worked Example: One Token, Three Steps

A token arrives with this payload:

```
header:    alg: RS256, typ: JWT
payload:   iss: customer-idp.okta.com
           sub: user@company.com
           aud: your-app-client-id
           exp: 1756800000
           groups: finance-team, eu-users
signature: RSASHA256(base64UrlEncode(header + payload))
```

The signature checks out against the keys published by `customer-idp.okta.com`. The expiry is in the future, the audience is this app's client id, and the issuer is the expected one. The mapping table then turns `finance-team` into `can_access_cost_reports` and `eu-users` into `data_region=EU`.

Only now does the access engine see a principal. Every attribute it reads came from a verified claim and a customer-owned group, not from anything the caller typed.

---

## Key Takeaways

- Real identity is a verification problem: prove the token is genuine, current and meant for this app before trusting it.
- Signature, expiry, audience and issuer are checked before any permission logic runs.
- Roles map from the customer's own groups, and that mapping can drift when a group is renamed.
- Just-in-time provisioning creates the first local record from token claims, scoped to the right company with no excess access.
- After verification, a principal resolved fresh per request feeds the unchanged access rules.

## Check Yourself

<details>
<summary>1. What does token validation check, and why must it run first?</summary>

The signature against the identity provider's published keys, then expiry, audience and issuer. It runs first because every later rule assumes the principal is genuine.

</details>

<details>
<summary>2. What does group-mapping drift look like?</summary>

A customer renames a group in their identity provider. The platform's mapping still points at the old name, so those users silently lose or keep access until someone notices.

</details>

<details>
<summary>3. Why is "we'll create a roles table in our UI" a red flag?</summary>

It invents roles locally instead of mapping the customer's own groups. Each customer already manages identity in its own provider, and a second role system drifts from it.

</details>

