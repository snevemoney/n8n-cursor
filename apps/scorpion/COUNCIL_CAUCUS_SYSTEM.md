# Council Caucus System - Bidirectional Telepathic Communication

## Overview

The council now includes a **caucus phase** where all members can communicate bidirectionally before making their final voting decisions. This creates a more collaborative and intelligent deliberation process.

## How It Works

### Phase 1: Caucus (Telepathic Communication)

1. **Round 1: Initial Thoughts**
   - All members share their initial analysis simultaneously
   - Each member provides:
     - Their initial thought/analysis
     - Key points they've identified
     - Concerns (if any)
     - Suggestions (if any)
   - All members can "hear" each other's thoughts in real-time

2. **Round 2: Discussion & Response**
   - Members respond to what others have said
   - They can:
     - Agree or disagree with specific points
     - Ask clarifying questions
     - Build on others' ideas
     - Raise new concerns
     - Suggest improvements
   - Each response includes:
     - Who they're responding to
     - What they agree/disagree with
     - New points they want to add

### Phase 2: Voting (Final Decisions)

After the caucus, members make their final voting decisions with full context of the discussion:
- They've heard all initial thoughts
- They've participated in the discussion
- They can reference specific points from the caucus
- Their votes are more informed and collaborative

## Events Streamed

### `council_caucus_start`
- Fires when caucus begins
- Data: `{ message, memberCount, maxRounds }`

### `council_caucus_round`
- Fires at the start of each round
- Data: `{ round, message }`

### `council_caucus_message`
- Fires when a member shares a thought
- Data: `{ from, fromId, fromRole, message, timestamp, round, keyPoints?, concerns?, suggestions?, respondingTo?, agreement?, disagreement?, newPoints? }`

### `council_caucus_complete`
- Fires when caucus finishes
- Data: `{ message, totalRounds, totalMessages, context }`

## Benefits

1. **Collaborative Intelligence**: Members build on each other's ideas
2. **Informed Decisions**: Votes are made with full context of discussion
3. **Diverse Perspectives**: All viewpoints are heard before decisions
4. **Better Consensus**: Discussion helps identify common ground
5. **Transparency**: Users can see the full deliberation process

## Configuration

- **Max Rounds**: Default 2 (initial thoughts + discussion)
- **Temperature**: Lower for initial thoughts (0.2), slightly higher for discussion (0.25)
- **Max Tokens**: Configurable per round (default 300-400)

## Integration

The caucus system is automatically integrated into `runCouncilDeliberationStreaming`:
- Caucus runs before voting
- Caucus context is included in voting prompts
- All events are streamed to the UI
- Falls back gracefully if caucus fails

## Example Flow

```
1. Council Caucus Start
   → "Members connecting telepathically..."

2. Round 1: Initial Thoughts
   → Architectus: "I see potential scalability issues..."
   → Analytica: "We should check the knowledge base first..."
   → Pragmaton: "This plan is executable but needs error handling..."

3. Round 2: Discussion
   → Architectus: "I agree with Analytica - let's verify KB first"
   → Analytica: "Building on Architectus' point about scalability..."
   → Pragmaton: "Good point, I'll add error handling to my vote"

4. Caucus Complete
   → "Members have shared thoughts and discussed"

5. Voting Phase
   → Members vote with full caucus context
```

## UI Display

The caucus messages appear in the Council Panel alongside voting:
- Caucus messages are shown as "telepathic communication"
- They're grouped by round
- Members can see who responded to whom
- Full discussion history is visible

