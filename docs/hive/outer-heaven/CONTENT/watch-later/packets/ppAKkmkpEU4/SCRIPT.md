# SCRIPT — what happens on screen, in order

Written by Jarvis from watching the whole video (Gemini, 1 frame/s + audio). Columns are in VISUAL-LOG.csv.

**[00:00–00:04](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=0s)** · [Design Studio (PRO) - Buda v1.7.0 released] Demonstrates user prompt and agent response in workbench chat
  - On screen: Design Studio PRO / Arcade Builder Agent / Market Research Agent / Buda v1.7.0 released / Can you make me a simple browser platform game called Mushroom Jump?...
  - Result: Full workbench view with left sidebar, center chat, and bottom input box
  - Said: "Look at the new Buddha agent workbench UI."
**[00:04–00:11](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=4s)** · [Design Studio - Arcade Builder Agent] Zooms in on the user's initial prompt
  - On screen: Can you make me a simple browser platform game called Mushroom Jump? I want a cute side-scrolling game where a little character can move left and right, jump over blocks, collect coins, and reach a flag at the end...
  - Code / command / prompt: `Can you make me a simple browser platform game called Mushroom Jump? I want a cute side-scrolling game where a little character can move left and right, jump over blocks, collect coins, and reach a flag at the end. Please make it playable in the browser, save the files in a folder, and write a short game design note so I can understand how it works. When it's ready, send me the design note file so I can open it.`
  - Result: Detailed user prompt displayed
  - Said: "So, I'm chatting with an AI agent here, asking it to build a small browser platform game called Mushroom Jump."
**[00:11–00:16](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=11s)** · [Design Studio - Arcade Builder Agent] Pans down showing agent output list of created files and preview links
  - On screen: Used 17 tools / Built it in /agent/mushroom-jump.app. What changed: Playable browser game with left/right movement, jumping, coins, blocks, side-scrolling camera, and finish flag / Files created: index.html, style.css, script.js, DESIGN_NOTE.md, buda.app.json...
  - Result: Agent execution summary and file attachment card for DESIGN_NOTE.md
  - Said: "While the agent is doing its thing, it creates files and a short game design note."
**[00:16–00:19](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=16s)** · [Design Studio - Arcade Builder Agent] Moves cursor to DESIGN_NOTE.md card and clicks it
  - On screen: DESIGN_NOTE.md text/markdown
  - Result: Card highlighted/clicked
  - Said: "I can just click this markdown file"
**[00:19–00:26](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=19s)** · [Design Studio - Arcade Builder Agent] Right side panel slides open displaying markdown preview
  - On screen: Files / DESIGN_NOTE.md / Mushroom Jump - Design Note / What it is / Mushroom Jump is a small side-scrolling browser platform game built with plain HTML, CSS, and JavaScript...
  - Result: Side panel rendered with rendered markdown text of Mushroom Jump - Design Note
  - Said: "and boom, it opens in the side panel on the right while our chat stays right in the center."
**[00:26–00:30](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=26s)** · [Design Studio - Arcade Builder Agent] Clicks tab dropdown menu on the right panel and selects 'Local Browser'
  - On screen: Files / Local Browser / Terminal / Cloud Browser / Git / Open Ports / Select a port to open a preview. / http://localhost:3000
  - Result: Local Browser panel loads showing Open Ports list containing localhost:3000
  - Said: "Then I can open up the local browser on the side to preview the game the agent just built."
**[00:30–00:39](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=30s)** · [Design Studio - Arcade Builder Agent] Clicks localhost:3000 link and plays the Mushroom Jump game inside the preview window
  - On screen: Local Browser / Mushroom Jump / Run, hop, collect coins, and reach the flag. / Coins 0 / 11 / Goal Reach the flag / Controls: A or D to move, Space / W to jump, R to restart.
  - Code / command / prompt: `http://localhost:3000`
  - Result: Interactive game renders; character moves, jumps over platforms, and collects coins up to 4 / 11
  - Said: "Now I can actually move the cat, jump over blocks, collect coins, and see the game running."
**[00:39–00:46](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=39s)** · [Design Studio - Arcade Builder Agent] Clicks 'Show bottom panel' button in the top right header, revealing bottom drawer options
  - On screen: Show bottom panel / Files / Local Browser / Terminal / Run shell commands / Cloud Browser / Git
  - Result: Bottom panel tray appears with tool options: Files, Local Browser, Terminal, Cloud Browser, Git
  - Said: "At the bottom, there's also a bottom panel for tools like the terminal."
**[00:46–00:51](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=46s)** · [Design Studio - Arcade Builder Agent] Clicks 'Terminal' tile in bottom tray; runs cd and curl commands
  - On screen: Terminal / agent@sandbox-530d7b88:~$ cd /agent/mushroom-jump.app && ls -la && curl -I http://localhost:3000
  - Code / command / prompt: `cd /agent/mushroom-jump.app && ls -la && curl -I http://localhost:3000`
  - Result: Terminal connects and executes bash command showing directory listing and HTTP response headers
  - Said: "I can keep them down there and quickly check the game files or confirm the local preview is running without covering up the conversation."
**[00:51–01:05](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=51s)** · [Design Studio - Arcade Builder Agent] Switches between tabs in right panel between DESIGN_NOTE.md and Local Browser while terminal remains open
  - On screen: HTTP/1.1 200 OK / Content-Type: text/html; charset=utf-8 / Files / Local Browser / DESIGN_NOTE.md / Mushroom Jump
  - Result: Complete multi-pane layout: navigation left, agent chat center, terminal bottom, preview/notes right
  - Said: "This is the new Buddha agent workbench UI. Files, game previews, and terminal outputs all sit right around the agent chat. So the AI can keep building while you inspect, play, and tweak things at any time."
**[01:05–01:08](https://www.youtube.com/watch?v=ppAKkmkpEU4&t=65s)** · [Buda end screen] Displays concluding branding screen
  - On screen: Buda / Build Your Agent Company / No Mac Mini. No setup. No model keys. / Try It Free / buda.im
  - Result: Call to action graphic with 'Try It Free' button and website url buda.im
