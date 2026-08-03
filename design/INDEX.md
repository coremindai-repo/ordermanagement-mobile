# Design Reference — Figma Exports

Source of truth for mobile screen design. These are real Figma exports
(not the earlier PowerPoint-extracted placeholders, which should be
deleted from this repo if any remain). Filenames match what's actually
in each folder — keep this file in sync if screens are renamed or added.

## 00-auth/ — Login, Logout and Forgot password flow

| Screen file | Notes |
|---|---|
| login-signin | |
| login-forgot-password | |
| login-logout-confirm | |

## 01-salesperson/ — Order capture flow

| Screen file | Notes |
|---|---|
| salesperson-dashboard-landingpage | |
| salesperson-dashboard-02 | |
| salesperson-dashboard-createorder | |
| salesperson-dashboard-createcustomorder-01 | |
| salesperson-dashboard-createcustomorder-itemdetails | |
| salesperson-dashboard-createcustomorder-item-materials | |
| salesperson-dashboard-createcustomorder-itemdetails-02 | |
| salesperson-dashboard-createcustomorder-itemsadded | |
| salesperson-dashboard-createcustomorder-billinganddelivery-billto | |
| salesperson-dashboard-createcustomorder-billinganddelivery-shipto | |
| salesperson-dashboard-createcustomorder-orderowner | |
| salesperson-dashboard-createcustomorder-orderdetails | |
| salesperson-dashboard-createcustomorder-orderdetails-filters | |
| salesperson-dashboard-createstockorder | Stock order follows the same process/screens as customer order, just `orderType = stock`. No separate design needed beyond this. |
| salesperson-dashboard-order-item-detailswithstatus | |
| salesperson-profilescreen | **Shared across all roles** — same screen regardless of who's logged in. |
| salesperson-order-history | **Shared across all roles** — order history is available to everyone. |
| salesperson-order-history-filters | **Shared across all roles.** |
| salesperson-searchinventory | Before placing an order, user can search whether an item already exists in stock (factory or store) and claim it as part of the new order — see the inventory-claim backend work. An order can mix claimed stock items and newly-manufactured items. **Note:** claimed items can be `semi_finished` even though the stock order that produced them is itself complete — this is expected, not a bug (see `ORIENTATION.md`). |
| salesperson-searchinventory-filters | |

**All rows above marked "shared across all roles" apply identically no
matter which role's dashboard the user is on — build once, reuse.**

## 02-factory-supervisor/ — Production flow

| Screen file | Notes |
|---|---|
| supervisor-dashboard-01 | |
| supervisor-newitem-details | |
| supervisor-newitem-chooseproductionmethod-factory | |
| supervisor-newitems-chooseproductionsteps | |
| supervisor-newitems-rawmaterialssourcing | Only shown if the raw-materials option is chosen. |
| supervisor-newitems-rawmaterialssourcing-updates | |
| supervisor-newitems-choosenextstep-carpentry | |
| supervisor-newitems-choosenextstep-carpentry-01 | |
| supervisor-newitems-choosenextstep-carpentry-assigncarpenter | |
| supervisor-newitems-choosenextstep-carpentry-assigncarpenter-statusupdate | |
| supervisor-carpentrysection-view | Supervisor's view of all items currently in the Carpentry stage. |
| supervisor-newitems-choosenextstep-carpentry-assigncarpenter-statusupdate-01 | |
| supervisor-newitems-choosenextstep-polishing | Mirrors the Carpentry screens above — same pattern, different step name. |
| supervisor-newitems-choosenextstep-polishing-01 | |
| supervisor-newitems-choosenextstep-polishing-assignpolisher | |
| supervisor-newitems-choosenextstep-polishing-statusupdate | |
| supervisor-newitems-choosenextstep-polishing-statusupdate-01 | |
| supervisor-polishingsection-view | |
| supervisor-newitems-allstepscomplete-confirmation | **Pattern generalizes:** any other production step (Upholstery, QA, etc., per the client's process template) follows the exact same screen pattern as Carpentry/Polishing above — build one reusable step-screen component, don't hardcode to these two. |
| supervisor-newitems-allstepscomplete-view | |
| supervisor-newitems-allstepscomplete-choosestate | Choosing the finished item's location (Keep in Factory / Sent to Warehouse / etc.). |
| supervisor-newitems-allstepscomplete-choosestate-01 | |
| supervisor-newitems-allstepscomplete-finalscreen-endofproduction | **Important:** there is no separate "ready to invoice" action shown — choosing the location here is what moves a customer order to Ready to Invoice. Don't build a separate invoice-trigger step in this flow. |
| supervisor-newitem-chooseproductionmethod-outsource | Full outsource flow is designed. **Import is not designed but is visually identical** — same screens, same flow, just labeled/data-sourced as Import instead of Outsource. |
| supervisor-newitem-chooseproductionmethod-outsource-initiate-finished | |
| supervisor-newitem-chooseproductionmethod-outsource-await | |
| supervisor-newitem-chooseproductionmethod-outsource-statusupdate | |
| supervisor-newitem-chooseproductionmethod-outsource-postcompletion | |
| supervisor-newitem-chooseproductionmethod-outsource-initiate-semi-finished | |
| supervisor-newitem-chooseproductionmethod-outsource-semi-finished-productionsteps | Semi-finished outsourced items re-enter the normal step-screen pattern (Carpentry/Polishing/etc.) to finish remaining work. |

## 03-store-manager/ — Invoicing, logistics, raw materials

| Screen file | Notes |
|---|---|
| storemanager-dashboard-readyforinvoice | |
| storemanager-dashboard-readyforinvoice-details | |
| storemanager-dashboard-confirm-storearrival | |
| storemanager-dashboard-confirm-storearrival-updatestatus | |
| storemanager-dashboard-confirm-storearrival-updatestatus-outfordelivery | |
| storemanager-dashboard-confirm-storearrival-updatestatus-outfordelivery-01 | |
| storemanager-dashboard-confirm-storearrival-updatestatus-delivered | |
| storemanager-dashboard-confirm-storearrival-updatestatus-delivered-01 | |
| storemanager-dashboard-view-rawmeterial-orders | Raw material requests are placed by store_manager, with company_manager as a backup/alternate (role-configurable, both permitted — matches backend role gating). |
| storemanager-dashboard-view-rawmeterial-orders-selection | |
| storemanager-dashboard-view-rawmeterial-orders-selectvendors | |
| storemanager-dashboard-view-rawmeterial-orders-selectvendors-chooseandmessage | |
| storemanager-dashboard-view-rawmeterial-orders-acceptedbyvendor | |
| storemanager-dashboard-view-rawmeterial-orders-receivedinstore | |
| storemanager-dashboard-view-rawmeterial-orders-senttofactory | |

## 04-outsourcing-and-import/ — Company Manager vendor flow

| Screen file | Notes |
|---|---|
| manager-outsourceimport-choosemode-items | **Only Import is designed here.** Outsourcing (at the company-manager/vendor level, distinct from the supervisor's per-item outsource choice in §02) is visually identical — reuse this design, swap labels/data source. |
| manager-outsourceimport-choose-importvendor | |
| manager-outsourceimport-choose-importvendor-sendmessage | |
| manager-outsourceimport-choose-importvendor-orderaccepted | |
| manager-outsourceimport-choose-importvendor-orderarrived | |
| manager-outsourceimport-choose-importvendor-orderarrived-location | |

## 05-inventory-notifications/ — Shared across roles

| Screen file | Notes |
|---|---|
| allusers-notifications | **Filter UI not designed.** Reuse the filter pattern already established in `salesperson-order-history-filters` / `salesperson-searchinventory-filters` rather than inventing a new filter style. |

## Cross-cutting notes (apply across multiple screens, not shown in any single mockup)

- **Refresh icon:** most dashboard/list screens need a manual refresh control — this pilot has no real-time push-driven updates, everything is pull-only. Not shown explicitly in most mockups; add consistently per `CLAUDE.md`'s refresh-model section.
- **Profile, order history, order history filters, search-inventory filters:** identical regardless of logged-in role — build once as shared components, not per-role duplicates.
