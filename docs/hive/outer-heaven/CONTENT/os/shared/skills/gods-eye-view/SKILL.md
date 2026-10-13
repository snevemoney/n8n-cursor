---
name: God's Eye View
description: >-
  use this when a question is about what is physically happening somewhere right now: weather,
  severe alerts, quakes, hurricanes, fires, flights, ships, satellites/ISS passes, public cameras,
  ports and chokepoints. Also use it to show Evens a live 3D globe on his Mac, or to make
  data-driven map content. Runs headless; it opens the globe only on demand.
---
# God's Eye View (gods-eye-view MCP + gev CLIs)

This skill is advise-only and local. It never sends, posts, publishes or trades.
Open-source app (MIT, github.com/bilawalsidhu/gods-eye-view), installed on Evens's Mac at `~/tools/gods-eye-view`.
It is **not** installed on the Grok box. From the box, use the Mac machineId with Shell to run the commands below.

## Access
| Surface | How |
|---|---|
| Claude Code / Codex / Cursor / Jarvis (MCP) | server `gods-eye-view`, 30 tools such as `situation_brief`, `get_earthquakes`, `get_cyclones`, `aircraft_in_area`, `find_aircraft`, `get_aircraft_info`, `get_aircraft_track`, `next_satellite_pass`, `satellites_overhead`, `get_weather_map`, `get_recent_imagery`, `find_cctv_cameras`, `find_infrastructure`, `find_submarine_cables`, `find_military_installations`, `get_recent_launches`, `get_terrain_height`, `get_map_features`, `show_in_gods_eye_view` |
| Any shell (headless) | `gev-call <tool> '<json args>'` prints JSON; `gev-call --list` lists the tools |
| Backend | `gev-headless start\|stop\|status\|logs` (loopback :4173, about 130 MB RAM, on demand only) |
| Show Evens the globe | `gev-show` (home) or `gev-show '<data.view.url from any tool>'`; it starts the backend if needed and opens it in the Mac browser |
| Recipes | `gev brief`, `gev alerts`, `gev flight <CALLSIGN or ICAO24> [--show]`, `gev market`; reports are saved in `~/jarvis-int/data/gev/<kind>/` |

Area argument: give exactly one of `{"place":"Montreal"}`, `{"bbox":[w,s,e,n]}` or `{"lat":..,"lon":..,"radius_km":..}` (at most 2000 km).
Lat/lon is the most reliable form; place names go through a geocoder.

## When to open the globe
Open it only when the answer is spatial **and** notable: an active EC warning or watch, a quake or cyclone in range, a flight Evens is tracking, or a scene he asked to see.
Otherwise give the text and the link. Never auto-open between 23:00 and 07:00 unless it is safety-critical.

## Keys (all free; none configured yet; don't print them; they belong in `~/tools/gods-eye-view/.env`)
- `FIRMS_MAP_KEY` (NASA FIRMS): needed for active fires.
- `TOMTOM_API_KEY`: needed for live traffic.
- `AISSTREAM_API_KEY`: needed for ships (`vessels_in_area`, `find_vessel`).
- `GOOGLE_MAPS_API_KEY` / `CESIUM_ION_TOKEN`: photoreal 3D.
- `OPENAI_API_KEY`: voice.
Ask Evens before adding any key. Never use a paid tier.

Works with no keys: weather, aircraft, quakes, NHC cyclones, satellites/ISS, launches, CCTV catalogue, ALPR map, imagery, cables, infrastructure, terrain, OSM features, military installations, situation_brief.
Fire perimeters come from the US WFIGS service and cover the US only.

## Use-case catalogue
Personal
1. Morning brief for Montreal (`gev brief`, scheduled 07:00 by launchd `com.evens.gev-morning-brief`).
2. Safety watch for saved places (`gev alerts`; edit `~/jarvis-int/data/gev/places.json`): EC warnings, quakes, cyclones, fires once a key is added.
3. Travel and flight tracker (`gev flight AC870 --show`): live position, aircraft type, route, track.
4. Sky-watch: visible ISS passes (`next_satellite_pass`), satellites overhead and recent launches.
5. Trip pre-check: `situation_brief` and `get_recent_imagery` for a destination before booking. Advise only; never book.
6. Ambient wall or second screen: `gev-show` with the "cyber radar" or surveillance style.

Professional and ArtCraft Studio
7. Data-driven explainer videos: run `~/tools/gev-remotion/scripts/make-draft.sh [view-url]`. It captures the live globe, pulls the data and renders a local DRAFT MP4. This is Remotion; the same assets can go into HyperFrames. Credit the sources and never publish without Evens.
8. Director Mode stories in the app's UI (geolocated video and imagery timelines) to storyboard content.
9. Before/after satellite comparisons (`get_recent_imagery`) for news-context content.
10. Researcher: OSINT context for a place, with infrastructure, submarine cables, datacenters and military installations.
11. Wealth Manager: `gev market` gives physical signals for ports and chokepoints (Hormuz, Suez, Panama, Taiwan, Gulf Coast, Rotterdam, Shanghai, Singapore, LA/LB, Montreal). It is advise-only; flags need human review and nothing is traded.
12. Day Planner: fold the weather, EC alerts and ISS passes into the daily plan.
13. Creative Studio: style presets (thermal, noir, anime, snow) as visual references.
14. Product research: forks add custom data layers (an X post shows an XRPL fork), a pattern for future ArtCraft or Jarvis layers.

## Guardrails
- Public data only. ALPR and CCTV entries are mapped locations, not feeds about people. Don't use them to track individuals.
- No sends or posts. Reports are drafts.
- Keep the Mac light: recipes stop the backend when they started it and didn't open the globe.
