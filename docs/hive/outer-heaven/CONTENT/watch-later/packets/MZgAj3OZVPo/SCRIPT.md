# SCRIPT — what happens on screen, in order

Written by Jarvis from watching the whole video (Gemini, 1 frame/s + audio). Columns are in VISUAL-LOG.csv.

**[00:00–00:35](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=0s)** · [Agent Zero / JFK Tower UI] Presenter introduces the TypeSafe AI Jev model running in JFK Tower simulator canvas alongside Agent Zero interface.
  - On screen: terminal: set -e ... \nBuilt: JFK Tower\nIt's installed and working in Agent Zero's right canvas...\nWhat's included\nFeature Implementation\nDark airport view North-up JFK map...\nMixed traffic Boeing 777, Boeing 737, Airbus A320...\nFour controllers Ground, Tower, Approach, and Departure...\nReal Jev decisions Structured traffic, runway...\nVisible uncertainty Actual action probabilities...\nRealtime radio Separate OpenAI Realtime sessions...\nInteractive events Close runway 22L...\nInspectable state View/export the exact structured request...\nThe compelling part is real-not simulated AI output\nDuring live testing: Jev chose continue route for BIA917 with 89% confidence...\nRun sector Ask Jev 3 AIRBORNE 0 ON SURFACE 0 CONFLICTS 1 COMPLETED 3 JFK Tower 00:00
  - Result: Left side shows Agent Zero terminal chat with built JFK Tower specs; right side shows dark airport radar map of JFK with aircraft tracks.
  - Said: "So I just got access to the new Jev model by TypeSafe AI. This model is very promising for detection..."
**[00:35–00:58](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=35s)** · [JFK Tower Canvas UI] Presenter clicks on State tab below radar display, revealing structured JSON state vector passed to Jev.
  - On screen: Traffics Decisions Radio State Profiles\nK3FK-STATE-V1.0 - JSON EXPORT\n{\n "meta": {\n "tick": 48,\n "airport": "KJFK",\n "phase": "day",\n ...\n "aircraft": [\n {\n "callsign": "DAL204",\n "type": "B738",\n "phase": "taxi",\n ...
  - Result: JSON code box displays airport traffic, taxiways, weather, runway states, and aircraft vectors.
  - Said: "So Jev is asked for classification for the traffic conflicts, for the takeoff landing clearance..."
**[00:58–01:07](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=58s)** · [JFK Tower Canvas UI] Clicks 'Enable radio' button in bottom right, then clicks green 'Run sector' button in top left.
  - On screen: Enable radio -> Radio on\nRun sector -> Pause\nEvaluating...\nSECTOR RUNNING 00:02
  - Result: Simulation starts, elapsed timer counts up, aircraft begin moving on the map.
  - Said: "So let's start. We have to enable the radio, and then start the simulation."
**[01:07–01:24](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=67s)** · [JFK Tower Canvas UI] AI voice speaks radio clearance; Decisions panel shows DAL204 cleared for takeoff with confidence percentages.
  - On screen: Delta Alpha Lima 204, Kennedy Tower, runway 22 right, cleared for takeoff.\nRunway 22 right, cleared for takeoff, Delta Alpha Lima 204.\nDECISION TRACK DAL204 B738 / JFK DAL204 Clear for takeoff 73% confidence
  - Result: Right drawer opens showing 'Clear for takeoff 73%' along with alternate options (Taxi to hold 15%, Abort 12%).
  - Said: "Evaluating because Jev was asked for clearance... The coolest thing about this model is that you get the confidence score."
**[01:24–01:45](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=84s)** · [JFK Tower Canvas UI] Controllers issue further audio clearances; UI updates active track to N42SR with 96% confidence for 'Continue route'.
  - On screen: Bravo Alpha Whiskey 117, Kennedy Tower, runway 22 left, cleared to land.\nNovember 42 Sierra Romeo, New York Approach, continue as instructed.\nContinue route 96%\nDECISION TRACK N42SR SR22 Continue route 96% confidence
  - Result: Confidence score breakdown graph displays: Continue route 96%, Reduce speed 3%, Ground hold 1%.
  - Said: "So Bravo Alpha Whiskey 117... Continue as instructed, November 42 Sierra Romeo."
**[01:45–01:52](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=105s)** · [JFK Tower Canvas UI] Presenter clicks 'Radio on' button to mute radio, then clicks maximize/expand icon in top right of the canvas.
  - On screen: Radio off\nFullscreen icon clicked
  - Result: JFK Tower canvas expands to full window modal.
  - Said: "So let's disable the radio so I can show you something..."
**[01:52–02:24](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=112s)** · [JFK Tower Canvas UI (Fullscreen)] Presenter toggles between Decisions tab and Radar view, demonstrating full automated operations without conflict.
  - On screen: TYPE SAFE AIR TRAFFIC LAB / JFK Tower\nSECTOR PAUSED 01:05\n4 AIRBORNE 4 ON SURFACE 0 CONFLICTS 1 COMPLETED 11 MATCHES\nEVENT INJECTION Close 22L Close 13L crossing + Traffic conflict Taxi obstruction\nDECISION TRACK REAL JEV OUTPUT\nN780LX Continue route 98%\nN5725P Continue route 91%\n280A18 Taxi to hold 87%\nN42SR Continue route 96%\nRAW JEV / JFK / N42SR Continue route 96% HIGH CONFIDENCE
  - Result: Full table of decisions with real Jev outputs, probabilities, and model verification notes; returns to full radar view showing planes maneuvering.
  - Said: "Here you can see that the coolest thing about the Jev model is that we get confidence scores out of the model... The virtual airport is running on its own."
**[02:24–02:40](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=144s)** · [Agent Zero Chat Interface] Closes JFK Tower modal and navigates to chat #225 in Agent Zero.
  - On screen: Built: JFK Tower\nChats: #225\nTest the new TypeSafe AI plugin. Call typesafe_query once with the state 'I was charged twice. Please refund the duplicate today.' and three questions: choose department (billing, technical, other), probability that a refund is requested, and urgency scored against No deadline / Within a week / Today or immediately...
  - Result: Chat displays a prompt testing TypeSafe AI plugin on customer support triage scenario.
  - Said: "The other thing that I've done with this model is to create a plugin for Agent Zero so that for any use case..."
**[02:40–03:26](https://www.youtube.com/watch?v=MZgAj3OZVPo&t=160s)** · [Agent Zero Chat Interface] Scrolls and reviews structured triage cards returned by Jev with probability distributions and execution timing (730 ms).
  - On screen: A0: Reporting typesafe_query test results\nJev Judgments\nDEPARTMENT billing Confidence 100.0%\nREFUND_REQUESTED 99.0% Probability of yes\nURGENCY 2/2 Expected score - levels start at 0 Confidence 100.0% (Today or immediately 100.0%)\nTokens: 408 input • 70 output • Confidence describes the answer distribution, not a guarantee of correctness.
  - Result: Interactive cards showing Department: billing (100%), Refund requested: 99.0% yes, Urgency: 2/2 (100% immediate).
  - Said: "It's a refund request from a customer... The model, given the structured data and all the options... it can take like four decisions per second. It works like at 4 Hz, it's insane."
