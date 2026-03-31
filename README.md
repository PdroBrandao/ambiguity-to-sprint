# From Ambiguity to Sprint 1

**How I turn a scattered founder conversation into something a dev can actually build.**

→ [Live prototype](https://order-desk.vercel.app) · [Prototype source](/order-desk) · [Full roadmap](./ROADMAP.md)

---

## The situation

A founder — let's call her Alex — runs a medical supply distribution company. She manages patient orders through a massive Excel spreadsheet. It works, but barely.

She came in with a clear ask: *"I want to replace this with a web-based internal tool."*

That sentence sounds simple. It isn't.

---

## What she said vs. what she needed

Here's an edited excerpt from the intake conversation:

> *"It's basically an intake form for when a clinic sends us an order for a specific patient. You enter the patient info, insurance, shipping address, and product details. Then we calculate our margin, cost per unit, billable amounts, and what the patient owes. Some of the logic depends on the vendor, product type, state, or payer. It pulls from three or four hidden tables. But it's fragile. If one field breaks, the whole sheet goes haywire."*

She asked for a tool to replace Excel. What she actually needed was a **reliable calculation engine** — a single source of truth for pricing logic that her team could trust without inspecting formulas.

That shift in framing changes everything about what goes into Sprint 1.

---

## The real problem

Two things were causing the pain:

1. **Manual re-entry**: her team enters the same data in multiple places — the spreadsheet, then the vendor portal, then DocuSign.
2. **Fragile logic**: calculations live inside Excel formulas that depend on hidden reference tables. One broken cell cascades.

She listed a lot of features. Most of them were symptoms of these two root causes.

---

## How I broke it into sprints

With one full-stack engineer and two-week sprints, you can't build everything. The question is: what's the one thing that, if you get it right, makes everything else easier?

The answer was the order entry form — specifically the calculation engine underneath it.

**The decision:** get the data model and pricing logic right in Sprint 1, even if you don't generate a single PDF. If the numbers are trustworthy, the rest of the system (documents, approvals, vendor routing) just becomes presentation.

### Sprint 1 — Smart Order Entry
*The calculation engine. Replace the Excel input loop with auto-populate and real-time financial preview.*

What goes in:
- Order list with status (Draft · Ready to Process)
- New order form: patient lookup → product selection → auto-populate (vendor, HCPCS code, cost, billable price)
- Self-pay toggle → switches pricing to MSRP automatically
- Real-time financial preview: total cost, billable amount, margin, patient owes
- Inline warnings: manager approval required, measurement form needed, low margin
- Fallback: "fee schedule not found — review manually" instead of silent wrong numbers
- Notes field for exceptions that don't fit the form

What stays out (deliberately):
- PDF generation
- Manager approval workflow
- DocuSign / Stripe integration
- Vendor auto-routing
- Reference table management UI

### Sprint 2 — Document Generation
*Turn a saved order into the three documents the team actually sends: encounter form, patient invoice (with Stripe link), proof of delivery.*

### Sprint 3 — Approvals + Integrations
*Close the operational loop: manager approval flow, DocuSign, automatic vendor email routing, order status tracking post-shipment.*

---

## Why this sequencing

The temptation is to build the full cycle end-to-end in Sprint 1 — intake, documents, approvals, everything. That's how you get a system that does everything halfway.

Sequencing by **data trust first, workflow second, automation third** means:
- Sprint 1 gives the team something they can use immediately (even if they still export manually)
- Sprint 2 has reliable data to generate correct documents from
- Sprint 3 can automate confidently because the data model is proven

If you start with Sprint 3 and the pricing logic is wrong, you're automating errors at scale.

---

## The prototype

Sprint 1 is built and deployed. It covers every feature in the scope above.

→ **[Open the live prototype](https://order-desk.vercel.app)**

Built with Next.js + Tailwind. Mock data pre-loaded with realistic products (HCPCS codes, fee schedules by payer), clinics, and patients. No backend required — all state is in-memory.

**Try this flow:**
1. Go to New Order
2. Select a patient → watch clinic, therapist, and shipping address auto-populate
3. Add a product → see cost, HCPCS, vendor, and billable price fill in
4. Switch to self-pay → watch the financial preview recalculate using MSRP
5. Add the lymphedema pump (E0650) → see the manager approval warning appear
6. Save the order → it shows up in the list

---

## What I would do differently

- **The self-pay toggle conflates two things**: whether the patient has insurance and whether we're billing insurance for this order. Those can diverge. A more precise model has `insuranceOnFile` separate from `billingMode`.
- **Fee schedules should be editable without a deploy.** In the prototype they're hardcoded in `mock-data.ts`. In production, this is an admin panel (Sprint 3) — but I'd design the data model for it from day one.
- **The order status flow is too flat.** Draft → Ready to Process works for Sprint 1, but it'll need to expand (Pending Approval → Approved → Ordered → Shipped → Delivered). Better to model it as a state machine early.

---

## How I used AI

I used Claude (Cursor) throughout — to pressure-test scope decisions, sanity-check the data model, and build the prototype faster.

The interesting part wasn't the code generation. It was using multiple models (GPT-4, Gemini, Grok) to critique the roadmap and find blind spots before building anything. Each model flagged different things. The skill was knowing which feedback to absorb and which to ignore.

That process — treating AI as a panel of opinionated reviewers, not a code generator — cut at least a full day from the planning phase.

---

**Pedro Brandão** · [pdrobrandao.com](https://pdrobrandao.com) · [LinkedIn](https://linkedin.com/in/pdrobrandao)
