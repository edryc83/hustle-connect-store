
# Afristall Import — v1 Plan

A trusted bridge between vetted UK/UAE suppliers and Ugandan shop owners. Buyers negotiate on WhatsApp (as today), then come back to Afristall to pay safely in UGX. Afristall holds the funds, settles to the supplier, and the buyer arranges shipping with a listed agent.

## 1. Roles & access

Add a new role `supplier` alongside existing `agent` and `admin`.

- **Admin / Agent** (UK or UAE team) onboards a supplier from the agent portal: enters business name, country (UK/UAE), contact, WhatsApp, bank details, generates email + temporary password. Supplier gets a unique human ID like `SUP-UK-0007`.
- **Supplier** logs in via the normal Afristall login. Role-based redirect: `supplier` → `/supplier` (own shell, not the seller dashboard). Forced password change on first login.
- **Shop owner (buyer)** is any existing Afristall seller. Only logged-in sellers see the Import hub.
- **Admin** gets a new "Supplier Payments" tab to approve bank transfers and mark settlements paid.

## 2. Supplier experience

`/supplier` mirrors the seller dashboard pattern but simplified:

- **Products**: same AI-powered add flow as sellers (image → AI description, attributes, category) **plus** MOQ (units), unit price, currency (USD/GBP/AED/EUR), lead time (days). MOQ is informational — buyer pays whatever they negotiate.
- **Payments received**: list of `supplier_payments` showing buyer name, amount in supplier currency, status (`funds_received` / `settled_to_supplier`), date. No bank details exposed to buyer.
- **Profile**: business name, logo, country, bio, lead time defaults.

## 3. Import hub for buyers (gated)

- New route `/import` — auth-gated; non-sellers see a "Import is for verified Afristall shop owners" gate.
- Browse suppliers and their products with country filter (UK / UAE), category, MOQ range.
- Product detail page: photos, description, attributes, **MOQ + unit price in supplier currency**, supplier card, "Chat on WhatsApp" (existing wa.me flow with product URL for OG preview), and a primary **"Pay Supplier"** button.

## 4. Pay Supplier flow

Step 1 — Amount: select supplier (pre-filled if coming from product), currency (auto), enter amount, optional note/PO ref.

Step 2 — Confirmation (rate locked 15 min, countdown visible):
```
Supplier:      Acme Textiles Ltd (UK)  SUP-UK-0007
Order amount:  USD 1,000.00
Afristall fee (5%):  USD 50.00
Total in USD:  USD 1,050.00
Exchange rate: 1 USD = 3,820 UGX  (locked, 14:32 remaining)
You pay:       UGX 4,011,000
```
"Rate refreshes if it expires before you pay."

Step 3 — Payment method:
- **Mobile Money (Yo Uganda)**: phone → reuse existing `create-payment`/`yo-ipn` pattern in a new `supplier-pay-momo` function. Show "Enter PIN on your phone" screen, poll status, success screen with txn ref + supplier name.
- **Bank Transfer**: show Afristall UGX bank details, upload payment slip (image/PDF to `payment-proofs` private bucket), submit. Status stays `pending_review` until admin approves.

Step 4 — Receipt + status timeline: Pending → Funds received → Settled to supplier.

## 5. Shipping agents directory

- Admin/agent-onboarded. Fields: name, logo, lane (e.g. UAE → UG, UK → UG), mode (Air/Sea), rate (per kg or per CBM), typical duration, WhatsApp, notes.
- New `/import/shipping` page — filter by lane, sort by rate or duration. "Contact on WhatsApp" deeplink. No bookings in v1; buyer arranges privately.
- Surfaced inline on the payment success screen ("Now arrange shipping →").

## 6. Admin panel additions

- **Suppliers**: create, edit, suspend, view their products & payments.
- **Shipping Agents**: CRUD.
- **Supplier Payments**: list all `supplier_payments`. For `bank_transfer` + `pending_review`: view uploaded slip, Approve / Reject (with note). For any `funds_received`: "Mark settled to supplier" once you've paid them out via Wise/bank.

## 7. Technical details

**New tables** (all RLS-protected, `service_role` full access):

- `suppliers` — id, user_id (auth), supplier_code (`SUP-UK-####`), business_name, country, currency, contact_name, whatsapp, bank_details (jsonb, admin-only), status, created_by_agent.
- `supplier_products` — id, supplier_id, name, description, images, category, attributes, moq, unit_price, currency, lead_time_days, active.
- `supplier_payments` — id, buyer_id, supplier_id, supplier_product_id (nullable), amount_foreign, currency, fee_pct, amount_foreign_total, fx_rate, fx_locked_at, amount_ugx, method (`momo`|`bank_transfer`), momo_phone, yo_ref, bank_proof_url, status (`pending`|`funds_received`|`settled`|`failed`|`rejected`), admin_note, note, created_at, settled_at.
- `shipping_agents` — id, name, logo_url, lane_from, lane_to, mode, rate_amount, rate_unit (`per_kg`|`per_cbm`), duration_days, whatsapp, notes, active, created_by_agent.

**RLS highlights**:
- `suppliers`: supplier reads own row; buyers read public fields via a view; admin full.
- `supplier_products`: public read where `active` AND supplier.status='active' (gated client-side to logged-in sellers); supplier writes own; admin full.
- `supplier_payments`: buyer reads own; supplier reads where supplier_id matches and only non-sensitive fields (no bank_proof_url); admin full.
- `payment-proofs` storage bucket: private, signed URLs for admin only.

**FX**: new edge function `fx-rate` calls `https://api.exchangerate.host/latest?base=USD&symbols=UGX,GBP,EUR,AED`, caches in `app_config` for 60s, returns rate + `locked_until` (now + 15 min). 5% markup applied client-side and re-validated server-side at payment creation.

**Yo Uganda**: clone the existing `create-payment` / `yo-ipn` pattern into `supplier-pay-momo` / `supplier-pay-ipn`. On success IPN, set payment to `funds_received` and write a notification row for the supplier dashboard.

**Bank transfer**: client uploads to `payment-proofs/<payment_id>.<ext>`, calls `supplier-pay-bank` to insert the row with `pending_review`. Admin approval flips it to `funds_received`.

**Role routing**: `useAuth` already fetches the session; add a `useUserRole` hook reading `user_roles`. `App.tsx` routes wrap `/supplier/*` requiring `supplier`, `/import/*` requiring an authenticated seller profile, and post-login redirect picks the right shell.

**Reuse**: image compression, AI description/attribute functions, WhatsApp deeplink helpers, OG-tag worker, glassmorphism design tokens — all reused as-is.

## 8. What's NOT in v1 (call out for later)

- Automatic supplier payouts (manual via Wise for now; admin marks "settled").
- Shipping bookings / quotes inside the app.
- Multi-currency wallet for suppliers.
- Disputes / refunds UI (handled manually by admin reversing payment status).
- MOQ hard-enforcement at checkout.

## 9. Build order

1. DB migration (roles, 4 tables, RLS, grants, `payment-proofs` bucket).
2. Admin: Suppliers CRUD + Shipping Agents CRUD + temp-password generator.
3. Supplier shell + login redirect + Products + Payments received.
4. Import hub (browse + product detail, gated).
5. Pay Supplier flow (FX function, confirmation, MoMo, Bank Transfer).
6. Admin Supplier Payments tab (approve bank, mark settled).
7. Shipping agents directory page + post-payment CTA.

Approve and I'll start with the migration.
