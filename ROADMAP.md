# Roadmap — Order Management System (3 Sprints · 1 full-stack engineer)

---

## Sprint 1 — Smart Order Entry (2 weeks)
**Goal:** Replace the Excel intake loop with a centralized calculation engine (single source of truth for pricing logic), intelligent auto-populate, and real-time risk visibility. The team stops re-typing and starts selecting.

### In scope
- **Order list** — overview with status (Draft · Ready to Process)
- **New order — full flow:**
  - Patient + clinic lookup (auto-populates shipping address, therapist, payer)
  - **Multi-line item entry** — the core of the sprint:
    - Product search with autocomplete
    - On select → auto-fills: unit cost, vendor, HCPCS code, billable price
    - Inline warning when HCPCS requires manager approval
  - Payer / insurance selection + **self-pay toggle** (switches calculation to MSRP automatically)
  - **Real-time financial preview (calculation engine):**
    - Total cost · Billable amount · Margin · Patient owes
    - Low margin indicator
    - Visible fallback when rule is missing ("fee schedule not found — review manually")
  - Real-time validation (required fields, invalid HCPCS, incompatible payer)
  - **Notes / Special Instructions** field (free text for exceptions that don't fit the form)
  - Save as **Draft** or **Ready to Process**

### Explicitly out of scope
- Measurement form uploads (→ Sprint 2)
- Document generation (PDF, encounter form, invoice, POD)
- Manager approval workflow
- Automated vendor routing
- DocuSign / Stripe integration
- Prior authorization tracking
- Product and fee schedule management UI (mocked data in Sprint 1)
- Order audit history

---

## Sprint 2 — Document Generation + Billing (2 weeks)
**Goal:** Close the cycle on an approved order. The order saved in Sprint 1 becomes the three documents the team actually sends — no re-typing.

### In scope
- Measurement form upload per line item (where applicable)
- **Encounter Form** generation (internal order summary document)
- **Patient Invoice** generation with Stripe payment link (simple URL, no full API integration)
- **Proof of Delivery (POD)** generation for patient signature
- PDF download / export
- PDF upload to patient record in internal system

---

## Sprint 3 — Approvals + Integrations (2 weeks)
**Goal:** Close the full operational loop. What today requires manual email chains and portal re-entry becomes automatic.

### In scope
- **Manager approval workflow** for HCPCS codes requiring authorization (replaces current SharePoint process)
- **DocuSign integration** (invoice + consent for digital signature)
- **Automatic vendor order routing** by email based on selected vendor (e.g. Medi product → sends to Medi automatically)
- **Prior authorization tracking** — per-product flag with status tracking
- **Post-shipment order status** — minimal status tracking after vendor handoff (Order Sent · Confirmed by Vendor · Delivered)
- Reference table management (products, fee schedules, payers) via simple admin panel
