# All methods: "Design Software Systems Like a Senior Engineer – Complete Course"
freeCodeCamp.org · 3:16:48 · youtu.be/soTfFFIQQ8U
Source: English auto-captions (re-fetched 2026-10-13 1:24 PM ET). Explanations are in my own words. Timestamps are h:mm, approximate to the minute.
Tags: **[Useful]** = useful for Evens · **[Tech]** = interview/tech-only

## A. How to approach any big design (framework)
| t | Method | Plain explanation | Tag |
|---|---|---|---|
| 0:04 | Lock scope before building | Vague briefs are normal; the first job is to pin down what's being asked. | Useful |
| 0:05 | Five things you're judged on | Communication, structured thinking, justified choices, real-world depth, time management. | Useful |
| 0:06 | Clarify first, avoid rework | Building on guesses wastes time when you have to redo it. | Useful |
| 0:07 | Choose tools for a reason | Pick from the needs, not habit or familiarity. | Useful |
| 0:09 | Five time-boxed steps | Requirements, then data/interfaces, then overall layout, then failures and scale, then wrap-up, each with a time budget. | Useful |
| 0:11 | Must-haves plus an explicit "not doing" list | Name the core uses and what's deliberately left out. | Useful |
| 0:12 | Quality targets up front | How many users, how fast, how much downtime is acceptable. | Tech |
| 0:12 | Check in at the end of each phase | "Does this make sense before I move on?" catches gaps early. | Useful |
| 0:15 | Default starter kit when stuck | Begin from a standard set of building blocks. | Tech |
| 0:16 | Walk one request end to end | Trace a single job from start to finish to find gaps. | Useful |
| 0:17 | Hunt single points of failure | Find the one piece whose failure stops everything, and back it up. | Useful |
| 0:17 | Slower backup path | When the fast route breaks, fall back to a slower one that still works. | Useful |
| 0:18 | Monitoring and alerts | Watch speed and error rates and alert on thresholds. Often forgotten. | Useful |
| 0:19 | Say what you sacrificed and why | Close by naming the trade-offs, plus ideas for 10x growth. | Useful |
| 0:21 | Treat the reviewer as a colleague | Neither silent nor monologuing; invite input. | Tech |
| 0:21 | Offer alternatives, explain the rejected one | Even obvious choices get a one-line "why not the other". | Useful |
| 0:49 | Planning > tool choice > doing | Doing the work is the smallest, cheapest layer now that AI does it. | Useful |

## B. Sizing and cost
| t | Method | Plain explanation | Tag |
|---|---|---|---|
| 0:26 | Back-of-envelope estimate | Rough maths reveals the dominant cost (in the Spotify example, audio files). | Useful |
| 0:29 | Watch data-transfer fees | Cloud providers charge when data leaves their network. | Tech |
| 0:56 | "Remove it and it's not the product" test | Identifies the true core features. | Useful |
| 0:59 | Traffic funnel | Most visitors browse, few buy. Size for the browsers too. | Useful |
| 1:00 | Top-down vs bottom-up estimates | Start from visits or from sales; either works. | Tech |

## C. Structure and components
| t | Method | Plain explanation | Tag |
|---|---|---|---|
| 0:31 | Expiring access links | Files are shared through links that stop working after a while. | Tech |
| 0:33 | Reject bad input at the door | Check size and format before doing any work. | Useful |
| 0:46 | Stateless workers | Workers that hold no memory can be copied freely to scale. | Useful |
| 0:48 | Start simple, grow with load | Don't over-engineer for users you don't have. | Useful |
| 1:04 | Pragmatic split of services | Separate the services, but keep tightly linked data together. | Tech |
| 1:08 | Queue between steps | One step posts a note and the others pick it up independently. | Useful |
| 1:10 | One big app vs many small ones | Trade simplicity against independent scaling. | Tech |
| 2:01 | Live "who's online" register | A fast lookup of which user is on which server. | Tech |
| 2:03 | Polling vs a persistent connection | Asking repeatedly wastes effort; an open line is instant. | Tech |
| 2:07 | Health checks; route only to healthy servers | Ping every ~10s and drop the broken ones from rotation. | Useful |
| 2:29 | Keep heavy files off core servers | Large uploads go direct to storage, not through the main servers. | Tech |

## D. Correctness: no doubles, no losses
| t | Method | Plain explanation | Tag |
|---|---|---|---|
| 0:14 | Strictly correct vs "eventually right" | Decide which data must always be exact and which can lag. | Useful |
| 0:51 | Last-item race | Two people grabbing the last room at once causes double booking. | Useful |
| 1:18 | Same request twice gives one result | A one-time ID makes a repeat click return the existing booking. | Useful |
| 1:25 | Separate money ledger | Each charge, change and refund is its own entry. | Useful |
| 1:29 | Pre-filled daily inventory plus a daily top-up job | Track availability per day; a scheduled job adds future dates. | Tech |
| 1:31 | Deliberate overbooking factor | Allow ~10% extra, knowing some will cancel. | Tech |
| 1:33 | Gap between check and act | Reading then writing leaves a window for a clash. | Useful |
| 1:35 | Lock the specific item | Lock only the row being booked; strict one-at-a-time mode is fine at low volume. | Tech |
| 1:22 | Fast copy for search, master for decisions | Search can be slightly stale; the final check uses the master record. | Useful |
| 1:48 | Auto-sync the copy from the master's change log | Changes stream from the master to update the search copy. | Tech |
| 1:50 | Read your own write from the master | Right after an update, read the master, not a lagging copy. | Useful |
| 2:15 | Multi-device sync, last write wins | Version numbers settle conflicts; recent history first, older on demand. | Tech |
| 2:20 | Status lifecycle with receipts | Sent, then delivered, then read, each confirmed. | Useful |
| 2:37 | Validate, tag and dedupe each item | Check format and fingerprint duplicates before saving. | Useful |

## E. Scale
| t | Method | Plain explanation | Tag |
|---|---|---|---|
| 0:47 | Separate reading from writing | One main copy takes writes; extra copies serve reads. | Tech |
| 0:47 | Split data across databases | Split by region or by key when one database is too small. | Tech |
| 1:37 | Choosing the split key | Keep related data together to avoid cross-database work. | Tech |
| 1:39 | Simple vs "consistent" splitting | Consistent hashing avoids reshuffling everything when you add a server. | Tech |
| 1:40 | Cache with expiry, cleared on change | Keep hot data for ~5 min and clear it after a booking. | Useful |
| 1:51 | Route users to the nearest region | Regional copies; one main write copy. | Tech |
| 2:25 | Group fan-out | Push to online members; park the message for offline ones; store it once. | Tech |
| 2:34 | Partitioned workers plus batch saves | Saving in batches is far faster (the speaker claims about 100x). | Tech |
| 2:52 | Split by user vs by message | Trade even load against fast lookups; duplicate writes to speed reads. | Tech |
| 3:04 | Full stack per region | Each region can run independently. | Tech |

## F. Reliability and failure handling
| t | Method | Plain explanation | Tag |
|---|---|---|---|
| 1:57 | Retention policy | Don't keep what you don't need (e.g. 30 days for undelivered messages). | Useful |
| 2:00 | Acknowledge fast, process later | Confirm receipt immediately; do the heavy work in the background. | Useful |
| 2:22 | Offline inbox plus notification | Hold items for someone who's away; deliver when they return. | Useful |
| 2:36 | Retry, then park failures, then tell the user | Failed items go to a holding list, not the bin. | Useful |
| 2:58 | Scheduled cleanup jobs | Regular purges of expired files, with results reported. | Useful |
| 3:00 | Fast store down: fall back to the durable store | Then resync when it recovers. | Useful |
| 3:06 | Queue down: local buffer, then disk log, then replay | Nothing is lost while the pipeline is out. | Tech |

## G. Security and abuse control
| t | Method | Plain explanation | Tag |
|---|---|---|---|
| 2:41 | End-to-end encryption | Only sender and receiver can read messages, not even the servers. | Tech |
| 2:45 | Per-action limits | Caps per user per action (messages, groups, uploads). | Useful |
| 2:46 | Escalating penalties | Warning, then 1-hour block, then 24 hours, then suspension pending human review. | Useful |
| 2:50 | Connection and IP flood limits | Flag many logins from different addresses in a short time. | Tech |
| 2:51 | Central shared counter | All servers share one tally, so limits can't be dodged by switching servers. | Useful |

## H. Release and closing advice
| t | Method | Plain explanation | Tag |
|---|---|---|---|
| 3:11 | Feature switches plus gradual rollout | On in testing, then 20% of users, then everyone. | Useful |
| 3:13 | Add complexity only at real bottlenecks | Build simple first and fix what actually breaks. | Useful |
| 3:14 | Every choice has a cost | State the trade-off out loud. | Useful |

**Count:** 72 methods: 44 Useful, 28 Tech.
