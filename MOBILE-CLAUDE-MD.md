# Order Management — Mobile App (React Native, iOS & Android)

Repository: `order-management-mobile`
Consumer: Claude Code, operating under standing rules below.
Companion repo: `order-management-backend`. Shared contract:
`/docs/API-INTERFACE-CONTRACT.md` (identical copy in both repos).
Figma designs: agreed with client, source of visual truth — see `/design`
(link/export to be added by the team).

## 1. Purpose

React Native app (single codebase, iOS + Android) covering four roles:
Salesperson, Factory Supervisor, Store Manager, Company Manager. Pilot —
DB-based login (no IAM SDK), manual refresh (no real-time layer), push
notifications only.

## 2. Standing rules for Claude Code

- The Figma wireframes and `/docs/API-INTERFACE-CONTRACT.md` are
  authoritative. If a screen needs data or a call the contract doesn't
  provide, flag it — don't invent an endpoint shape and assume the backend
  will match it.
- Do not touch the backend repository.
- No WebSocket/SignalR client libraries, no background silent polling. Every
  data-bearing screen gets an explicit refresh control (pull-to-refresh
  and/or a refresh button per the wireframes).
- No local persistence of business data beyond in-memory/navigation state
  needed for the current session, unless a screen explicitly requires
  draft-saving (e.g., in-progress order before submit — see §5). This is a
  pilot; don't build offline-sync infrastructure that isn't asked for.

## 3. Tech stack

- React Native (latest stable), TypeScript.
- Navigation: React Navigation (stack + bottom tabs per role).
- State: React Query (or equivalent) for server data + cache, since the
  refresh-button model maps naturally onto "refetch on demand" rather than
  a global real-time store. Local form state via React state/hooks —
  avoid a heavyweight global store unless a specific screen needs one.
- Push notifications: Firebase Cloud Messaging (Android) + APNs via
  Notifications (iOS), registered through `/api/auth/register-device` on
  login and on token refresh.
- Image capture: device camera/gallery picker for QC/stock/delivery photos,
  uploaded to backend (which stores in Blob and returns URLs — see
  contract).
- Voice input: **flagged, not yet confirmed in scope** — if confirmed,
  device speech-to-text (or Azure Speech SDK called directly from the app)
  converts to text client-side before it's added to the instructions field;
  the backend never receives audio.

## 4. Screens by role (from agreed wireframes)

### Salesperson (order placer)
1. **Dashboard** — tabs by status (Ready to Invoice, Ready to Deliver, In
   Production) and type (Stock/Customer); "In Progress" sub-filter by
   Customer/Sales order. Refresh control required. Inventory search entry
   point. `+` to start a new order.
2. **Order detail** — line items, each tappable to item-level status detail.
   Same screen reused, filtered, for any role viewing status (read-only
   for non-owners per role rules).
3. **New order — item entry** — item/description, photo attachment, voice
   instructions (if in scope), materials popup (repeatable "Add Material").
4. **Items summary** — list of items added; Next disabled until Billing &
   Delivery complete; Edit/Delete per item.
5. **Billing** (BILLTO) then **Shipping** (SHIPTO) tabs — Next enables once
   both are complete for customer orders; billing/delivery tab disabled
   entirely for stock orders.
6. **Salesman & showroom popup** — salesperson auto-filled from login,
   editable; showroom from a backend-provided list. Submit → POST /orders.

### Factory Supervisor
1. **New items dashboard** — tabs: New, Carpentry, Polishing, Upholstery,
   Finished (tab set comes from `/api/production-steps-template`, not
   hardcoded — a different client's tab list will differ).
2. **Item detail → method** — Factory / Outsource / Import choice; if
   Factory, checklist of steps from the template.
3. **Raw materials step** (if chosen) — entry + reminder, "Received raw
   materials" checkbox on return visit.
4. **Step execution** — assign people (from backend list), status
   Started/Complete, timestamp, photo attachment.
5. **Item status list** — all items supervisor owns, tap into any to
   continue; order-level complete only when all line items complete
   (server-enforced, but reflect it in the UI state).
6. **Post-production routing** — Keep in Factory / Sent to Warehouse / In
   Transit / Out for Delivery / Sent to Store, store picker sourced from
   `/api/stores` (currently Kochi, Bangalore).
7. **Outsource/Import sub-screens** — finished vs semi-finished choice;
   semi-finished re-enters the factory step checklist on return.

### Store Manager (Company Manager sees the same dashboard plus outsourcing)
1. **Order dashboard** — tabs: Awaiting Delivery, Ready to Invoice, Sent to
   Store (sub-filter: Sent to Kochi / In Transit Bangalore), Stock Orders,
   Custom Orders (sub-filter: In Progress / New).
2. **Invoice generation** — list of production-complete orders; "Generate
   Invoice" triggers a push notification to the accountant (invoicing
   itself happens manually in ZOHO, outside this app); partial or full
   invoicing per the wireframe.
3. **Item logistics** — Received in Store, Out for Delivery, Delivered,
   Arrived in Store status updates.
4. **Raw materials procurement** — select pending requests, choose supplier
   from a predefined list, mark Order Placed (supplier contact itself is
   manual, outside the app); later mark Order Accepted, then Received.

### Company Manager (outsourcing/import ownership)
1. **Outsource/Import screen** — same pattern as raw materials: select
   items, choose supplier, mark placed/tracked/received; semi-finished
   routes to factory, finished routes to store.

### All roles
1. **Inventory search** — by product name and status (finished/semi-finished).
2. **Notifications & order history** — push notification list (mirrors
   server's `notifications_log`), order history filtered by status; a
   salesperson sees only their own orders, supervisors/managers see all,
   per the role table in the contract.

## 5. Draft order state

Per the wireframes, an order isn't persisted server-side until Submit is
pressed — everything up to that point (items, materials, billing/shipping)
lives in local app state across the multi-screen flow. Design this as one
in-memory draft object scoped to the "new order" navigation stack; discard
on cancel or successful submit. No need to persist drafts across app
restarts for this pilot unless the client asks for it later.

## 6. Refresh model

No background sync, no push-triggered auto-refresh of on-screen data. On
receiving a push (app foregrounded or backgrounded), show the OS
notification; if the relevant screen happens to be open, surface a small
"Updates available — pull to refresh" banner rather than silently
refetching — keeps behavior predictable and matches the "refresh button
everywhere" constraint.

## 7. Build sequencing (epics)

1. **Epic 1 — Foundations:** navigation shell per role, login screen, JWT
   storage (secure storage, not AsyncStorage in plaintext), role-based tab
   routing, push registration flow, shared API client + error handling
   matching the contract's error shape.
2. **Epic 2 — Salesperson order capture flow** (screens 1 → 3.3 → submit),
   against Backend Epic 3.
3. **Epic 3 — Order/status dashboards + detail views** (read-only, all
   roles), against Backend Epics 2–3.
4. **Epic 4 — Factory Supervisor flow**, against Backend Epic 4.
5. **Epic 5 — Store Manager flow** (invoicing, logistics, raw materials),
   against Backend Epic 5.
6. **Epic 6 — Outsourcing/Import flow**, against Backend Epic 6.
7. **Epic 7 — Push notifications end-to-end**, against Backend Epic 7.
8. **Epic 8 — Inventory search, notifications/history screens.**

Each epic assumes its corresponding backend epic is deployed to a shared
dev environment first — flag if you're building ahead of an available
endpoint rather than mocking indefinitely.
