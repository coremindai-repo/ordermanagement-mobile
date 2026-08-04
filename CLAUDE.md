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
- Backend base URL: build-time only, via `API_BASE_URL` in `app.config.ts`
  (exposed at runtime through `expo-constants`, `Constants.expoConfig.extra.apiBaseUrl`).
  No in-app switcher, no runtime override — this mirrors how the backend
  already provisions a fully separate resource group per client, so a new
  client is a deploy-time concern, not an app code change.
  - Local dev: copy `.env.example` to `.env` (gitignored); `expo start`
    loads it automatically.
  - EAS builds: each client gets its own build profile in `eas.json` with
    its own `env.API_BASE_URL` (see the `nilambur-*` profiles for the
    pattern). Onboarding a new client = add `{client}-development`,
    `{client}-preview`, `{client}-production` profiles pointing at that
    client's backend — no changes to `app.config.ts` or anywhere else in
    the app.
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
   itself happens manually in ZOHO, outside this app). All-or-nothing,
   order-level (`READY_TO_INVOICE → READY_TO_DELIVER`) — no partial
   invoicing. An earlier draft of this spec mentioned partial invoicing;
   neither the design nor the client's actual process supports it, and the
   contract only has the single all-or-nothing transition.
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

## 8. Pending contract changes (mobile-proposed, unconfirmed)

Raised during Epic 2. Not yet agreed with the backend team — treat as
proposals, not settled contract, until `/docs/API-INTERFACE-CONTRACT.md` is
updated to match.

### Line-item reference photos — resolved, shipped

Raised during Epic 2 as a proposal (below, kept for the reasoning); **confirmed and
built** — see contract §5 "Reference photos (line item, captured at item entry)" and
`src/api/referencePhotos.ts`, whose own header comment already says "Confirmed and
shipped." This note was the one part of it that hadn't caught up: the endpoints exist,
match what was proposed field-for-field (down to the `photoUrls` body key on confirm),
and the mobile app is not running a local-only fallback against them.

Original proposal, for context — the salesperson's item-entry screen
(`salesperson-dashboard-createcustomorder-itemdetails.png`, "Attach References")
captures a reference photo *before* the order exists — no `orderId`/`lineItemId` yet.
These aren't a personal note: the factory supervisor needs them to choose
factory/outsource/import and know what to build (`supervisor-newitem-details.png`
onward, Epic 4). The production-step photo mechanism couldn't serve this, since it
requires a step that doesn't exist until the supervisor sets a production plan.

What shipped, mirroring the step-photo SAS pattern, scoped to the line item instead of
a step:

1. `POST /api/order-line-items/{lineItemId}/reference-photo-upload-url`
   Body: `{ "fileExtension": "jpg" }` → same response shape as the step
   version (`uploadUrl`, `blobPath`, `expiresAt`, `requiredHeaders`).
2. `PUT` the image bytes to `uploadUrl` (identical mechanism — `x-ms-blob-type:
   BlockBlob` header, write-only SAS, ~10 min expiry).
3. `POST /api/order-line-items/{lineItemId}/reference-photos`
   Body: `{ "photoUrls": ["string"] }` (blob paths, not URLs — same naming as the
   step-update endpoint) — confirms the upload and attaches it to the line item.
4. Line-item shapes returned by `GET /api/orders/{orderId}` carry
   `referencePhotos: [{ blobPath, url }]`, analogous to a step's `photos` array.

Mobile-side submit sequence: `POST /api/orders` first (real `lineItemId`s only exist
after this), then upload reference photos per returned line item. Presented to the user
as one atomic "Submit" even though it's multiple calls underneath. If a photo upload
fails, the order has already been created successfully — the failure is surfaced
explicitly (which item, that it needs retrying) rather than silently dropped or
reported as a whole-submit failure.

### Other Epic 2 field/scope decisions (mobile's call, not contract gaps)

- **Quantity** (item-entry form) has no dedicated line-item field — one form
  fill with qty N becomes N identical `lineItems` entries at submit (each
  physical unit needs independent production tracking anyway, matching
  `lineItemCount` on the order summary).
- **Dimensions (L/B/W + unit) and Finish**: initially folded into `description`
  as formatted text (no dedicated field existed at the time). **Resolved** —
  confirmed as a contract addition and landed in
  `/docs/API-INTERFACE-CONTRACT.md` (`dimensions: {length, breadth, width,
  unit}` and `finish: string`, both structured, both stored as real columns
  server-side to support filtering/aggregation in reporting — unlike
  `materials`, which stays free-form JSON because it's variable-arity).
  Implemented in `buildCreateOrderRequest.ts`; no changes needed to the
  item-entry screen since it already captured these as separate structured
  fields locally — only the submit-time serialization changed.
- **"Salesman" field** on the Order Owner popup is displayed pre-filled from
  the logged-in user but is **not editable/sendable** — `POST /api/orders`
  has no field for it, and the backend attributes the order to the JWT's
  `userId` regardless of what the app sends. Making it an editable text input
  would imply a capability that doesn't exist.
- **Search Inventory "Category" filter** (`salesperson-searchinventory-filters.png`)
  has no backend taxonomy to filter against — `GET /api/inventory` has no
  category field or category counts. Only the Status filter
  (`finished`/`semi_finished`) is real; Category is dropped from the filter
  sheet rather than faked via client-side string matching on `productName`.
- **Dashboard tab/status-group mapping**: resolved in Epic 3 — see below.
  Payment-status badges ("Advance Received"/"Paid in Full") shown in the
  mockups are confirmed **out of scope**: there is no payment/invoice-status
  concept anywhere in the contract, invoicing happens manually in ZOHO, and
  it stays that way. No payment field or indicator is built.

### Epic 3 — dashboard tab → status mapping (confirmed)

Per contract §4's note that the `tab` param is a placeholder until the
dashboard is built against the wireframes — this is that mapping. The
mobile app does **not** use the `status`/`tab` query params for these
dashboards: several tabs span more than one status, and `status` only takes
one value, so each dashboard fetches the caller's full visible order list
once (`GET /api/orders?mine=...`, no status/type filter) and derives every
tab client-side from that one list. One refresh updates every tab. If this
turns out to scale badly with order volume, revisit — for the pilot's
volumes it keeps the tab logic simple and avoids N parallel status calls.

**Salesperson** (`mine=true`):

| Tab | Filter |
|---|---|
| Custom Orders | `orderType = customer`, any status |
| Stock Orders | `orderType = stock`, any status |
| In Progress | `currentStatus` in `{NEW, IN_PRODUCTION}`, both types — has its own Customer/Stock sub-filter chips |
| Ready to Invoice | `currentStatus = READY_TO_INVOICE` |
| Awaiting Delivery | `currentStatus` in `{READY_TO_DELIVER, KEEP_IN_FACTORY, SENT_TO_WAREHOUSE, IN_TRANSIT, SENT_TO_STORE, RECEIVED_IN_STORE, OUT_FOR_DELIVERY}` — everything past production/invoicing, short of `DELIVERED` |

**Store Manager / Company Manager** (no `mine` restriction — both roles see
all orders per contract §3):

| Tab | Filter |
|---|---|
| Awaiting Delivery | same status set as salesperson's |
| Stock Orders | `orderType = stock`, any status |
| Custom Orders | `orderType = customer`, any status — sub-filter chips: In Progress (`NEW`/`IN_PRODUCTION`) / New (`NEW` only) |
| Ready to Invoice | `currentStatus = READY_TO_INVOICE` |
| Sent to Store | `currentStatus` in `{IN_TRANSIT, SENT_TO_STORE}` — sub-filter chips built **dynamically** from each order's `store.name` + status found in the result set (e.g. "In Transit — Bangalore", "Sent to Store — Kochi"), not hardcoded to "Kochi"/"Bangalore". Contract §8 is explicit that adding a store is a data change, not a deploy — hardcoding store names into tab logic would contradict that the moment a third store is added. |

Company Manager's Orders tab additionally keeps the `+` FAB into the same
New Order flow salesperson uses — contract §3's role-gating table permits
`company_manager` to create orders, not just `salesperson`. Store Manager's
does not.

### Item production timeline — resolved (Epic 4)

Originally flagged as a gap (no documented way to discover a step's `stepId`,
and no read path for per-step history). Resolved: `GET /api/orders/{orderId}`
→ `lineItems[].productionSteps[]` is the durable source (`stepId`, `stepName`,
`sequence`, `status`, `assignedNames`, `photos`, `startedAt`, `completedAt`),
and `POST .../production-plan`'s response also returns fresh `stepId`s
immediately after planning. No separate list-steps endpoint exists or is
needed. The mobile Item Status Detail screen builds its full step timeline
from `productionSteps` directly.

**"Raw materials sourcing" — dropped, not backed by any line-item-scoped
endpoint.** The original wireframe shows it as a step-like card on the item
timeline (entry per material, reminder, "Received raw materials" checkbox).
Once the production-steps-template bug was fixed (§5), the confirmed template
returns exactly the three real work steps (`CARPENTRY`, `POLISHING`,
`UPHOLSTERY`) — raw materials sourcing was never one of them, and the only
raw-materials mechanism in the contract (`POST /api/raw-material-requests`,
§6) is a fixed, order-agnostic request queue with no `lineItemId` field at
all, so a request can't be tied back to a specific item's timeline anyway.
This card is not built. If raw-materials tracking per line item is wanted
later, it needs its own contract decision (most likely a `lineItemId` field
added to the raw-material-request shape) rather than reusing production-plan.

**Step interaction model**: checkboxes ("Work started" / "Complete") fire the
step-update call immediately rather than deferring to a separate "Save" —
`status` is required on every call and re-sending the current status is a
`409`, so there's no way to persist assignedNames/photos without also
advancing status. Photos can only be attached while a step is
pending/started; once complete there's no further transition to attach them
to, so the picker is disabled.

**Post-production routing is computed dynamically, not the static 5-option
mockup list** — see `src/utils/orderStatusGraph.ts`. The v4 status graph only
allows one hop at a time (`IN_PRODUCTION` → `READY_TO_INVOICE` for customer
orders or `{KEEP_IN_FACTORY, SENT_TO_WAREHOUSE}` for stock; `IN_TRANSIT` needs
a destination store set first), and only the moves contract §3 actually
grants `factory_supervisor` are offered — `SENT_TO_STORE` onward is
store_manager/company_manager's job (Epic 5) and isn't shown here.

### Epic 5 — Store Manager / Company Manager flow

**Item logistics is order-level, not line-item — confirmed, not a guess.**
Early in this epic the line-item `targetStatus` table (contract §4, ~line
429) was read in isolation and looked like it might extend to
`RECEIVED_IN_STORE`/`OUT_FOR_DELIVERY`/`DELIVERED`, contradicting the order-
status table (~line 372) and the destination-store note (~line 989) which
both say this chain is order-level. Flagged and confirmed with the backend
team rather than guessed: **order-level is correct as built.** Lesson for
future contract questions: cross-reference the order-status table and the
line-item-targetStatus table together before concluding a status belongs to
one or the other — they're easy to conflate since both use the same status
vocabulary in places.

`OrderStatusActionPanel` (renamed from the Epic 4 `PostProductionRoutingPanel`)
is now generic — takes `legalStates` as a prop instead of computing it
internally, so both `supervisorLegalNextStatuses` and the new
`managerLegalNextStatuses` (SENT_TO_STORE → RECEIVED_IN_STORE → OUT_FOR_DELIVERY
→ DELIVERED, contract §3 "Store-side movements through DELIVERED") drive the
same component. `IN_TRANSIT → SENT_TO_STORE` is deliberately not offered
anywhere in the manager's UI — no design screen or CLAUDE.md action names a
manager step for it, so it's treated as covered by the supervisor's dispatch.

**Raw materials "Sent to Factory" tab — resolved, dropped.** The mockup
showed a 5th tab after "Received in Store," but the documented chain
(`requested → sent_to_supplier → order_placed → order_accepted → received`)
ends at `received`. Confirmed with the client: not a real status, no backend
change coming. Built as 4 tabs only (New Requirement =
`requested`+`sent_to_supplier` merged, Order Placed, Accepted, Received in
Store) — nothing drives a 5th tab server-side, so none was added.

**Raw-material supplier is free text, by design** — `GET /api/suppliers` is
explicitly outsourcing/import-only (contract §6); a raw-material request's
`supplier` field is free-form JSON with no predefined list, confirmed as the
intended pilot behavior, not a gap to fill. No supplier picker was built for
raw materials.

**No vendor-messaging/WhatsApp integration** — the mockup's "Select
Vendor/Group" + editable message + "Send Message" screens go beyond the
contract, which is explicit that supplier contact is "manual, outside the
app" (§6). The app only records the resulting status; confirmed, not built.

### Epic 6 — Outsourcing/Import (Company Manager vendor flow)

**`GET /api/outsourcing-requests` has no documented response shape at all**
— just query params (`status`, `method`), no JSON example, unlike every
other list endpoint in the contract. Blocks building the Order Placed/
Accepted/Received-in-Store/Received-in-Factory tabs from the mockup. Flagged,
not guessed.

**"Item Arrived in: Kochi Store / Factory" doesn't map to any documented
field.** Best guess was a friendlier relabeling of `received_finished` vs
`received_semi_finished`, but that breaks for Import — the contract is
explicit `received_semi_finished` is outsource-only, yet the mockup (filtered
to Import in every screenshot reviewed) shows both Store and Factory options
regardless. Flagged rather than guessed which reading is right.

"New Requirement" — confirmed this isn't sourced from
`GET /api/outsourcing-requests` at all, since that chain starts at
`status: "placed"` (per the `POST` response) with no earlier state to list.
It's items with `method` already set to outsource/import (Epic 4) but
`currentStatus: PENDING` (not yet `WITH_SUPPLIER`) — i.e. the Epic 4
work-queue endpoint (`GET /api/order-line-items?method=…&status=PENDING`),
not this section's endpoint.

**Both gaps resolved** (2026-08-04): `GET /api/outsourcing-requests` is now
company_manager-gated with a documented response shape and no per-record
filtering (every request the caller can see is simply returned, unlike raw
materials' mixed own/item-linked visibility) — the response shape hadn't
synced into `docs/API-INTERFACE-CONTRACT.md` by build time, so
`outsourcingTypes.ts`'s `OutsourcingRequest` was inferred defensively from
the strongly analogous `GET /api/raw-material-requests` shape and this same
section's own `POST`/`POST .../status` responses; re-check that type against
the contract file next time it's touched, in case the real field names differ
slightly. The "Item Arrived in" modal turned out to be unrelated to the
finished/semi-finished branch entirely — it's a **destination-store
convenience** layered on top: "Kochi Store" calls the existing
`POST /api/orders/{orderId}/destination-store` immediately, "Factory" is a
no-op. The finished/semi-finished choice itself (a real branch for outsource,
never asked for import) is a separate picker built specifically for outsource,
since the Import-only mockup never had to show it. All 5 tabs are built.
Store options come from `GET /api/stores`, not hardcoded to "Kochi" — same
reasoning as the Sent to Store dashboard sub-filter (Epic 3).

Company-manager-only: mounted only on `CompanyManagerTabs`, not
`StoreManagerTabs`, matching contract §3's role table (create *and* status
progression are both `company_manager`-gated) — no separate role check
needed inside the screen since it's simply unreachable from the store
manager's tab set.

### Epic 8 — Notifications, Order History, Search Inventory (all roles)

Was flagged as genuinely unbuilt at Epic 6's close (bell icon decorative,
Order History still the Epic 1 placeholder, Search Inventory salesperson-only
despite being role-agnostic per contract §9 and design/INDEX.md) — now built:

- **Notifications**: `GET /api/notifications`, reachable from Menu (all
  roles) and from the bell icon on every stack-based dashboard (Salesperson,
  Store/Company Manager, Supervisor Orders, Stages). Not wired on the two
  "leaf" screens without their own stack (Raw Materials procurement,
  Outsource/Import) — Menu still covers those roles.
- **Order History**: `GET /api/order-history`, replaces the placeholder,
  reachable from Menu. Server-side role scoping (contract §10) means no
  client-side filtering is needed.
- **Search Inventory**: added to Menu for every role whose primary tab set
  doesn't already have it as a dedicated tab — computed via
  `resolvePrimaryRole`, the same role-precedence logic `RootNavigator` uses
  to choose a multi-role user's tab set, not a raw `roles.includes(...)`
  check (which would show a redundant Menu entry for e.g. a
  supervisor+company_manager user, since their tab set is company_manager's
  and already has what they'd need). Fixed the pre-existing Raw Materials
  Menu-entry check to use the same logic while touching this code.

### Post-Epic-8 device QA (2026-08-04)

First round of testing on a real Android device (EAS dev-client build)
surfaced two issues:

**Fixed — `ProductionStepCard` crash on assigning a step.** Live backend
returns `assignedNames: null` for a step nobody has been assigned to yet,
not `[]`, even though the contract's example JSON for `productionSteps`
(§4, ~lines 176/499) shows it populated. `useState<string[]>(step.assignedNames)`
crashed immediately (`Cannot read property 'length' of null`) on mount.
Guarded with `?? []` — same class of gap as `OutsourcingLineItemRef` in
Epic 6 (contract example shows the happy-path shape; the empty/fresh-record
case comes back null instead of an empty array). Worth defensively guarding
on sight anywhere else a "list" field is read straight off a fresh/empty
backend record, rather than waiting for the next crash report.

**Fixed (backend) — `POST .../production-plan` wrongly rejected empty
`steps` for outsource/import.** `MethodChoicePanel` sends `steps: []` for
`method: "outsource"` / `"import"`, which is correct per §6: those methods
skip factory steps entirely (the supplier does the work, no in-house steps
exist), going straight to `WITH_SUPPLIER`; only `factory` gets a step
checklist. This previously surfaced as "At least one production step is
required" on submit — the raw backend validation error, not a string that
exists anywhere in the mobile codebase — because the live API's "at least
one step" check wasn't scoped to `method: "factory"` the way §6 says it
should be. Confirmed with the user this was a backend validation bug, not a
client misunderstanding; **backend fixed and deployed 2026-08-04, contract
§5 updated to document `steps` as required only for `factory`** — and
explicitly not "non-factory forbids steps," since a claimed semi-finished
item re-enters this same endpoint later, still under method `outsource`, to
plan its remaining factory steps (§6). No client-side workaround was ever
built for this — the mobile code was already correct; only the backend
validation was wrong. Nothing to change here.
