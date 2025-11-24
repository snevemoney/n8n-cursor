// apps/scorpion/server/council/humanContextCouncil.ts

import {
  CouncilInput,
  CouncilMember,
  CouncilOutput,
  CouncilIssue,
} from '../types/council';
import { logImprovementSignal } from '../orchestrator/selfImprovement';

function includesAny(text: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) =>
    typeof p === 'string' ? text.includes(p.toLowerCase()) : p.test(text),
  );
}

export const HumanContextCouncilMember: CouncilMember = {
  id: 'human-context',
  name: 'Human Sensitivity & Relationship Councillor',
  description:
    'Understands user emotions and relationship to AI (friend, tool, anxiety, pressure, calling out discrimination) and adjusts tone/response.',

  run(input: CouncilInput): CouncilOutput {
    const text = (
      (input.goalDescription || '') +
      '\n\n' +
      (input.planSummary || '') +
      '\n\n' +
      (input.draftAnswer || '')
    ).toLowerCase();

    const issues: CouncilIssue[] = [];
    let revisedAnswer = input.draftAnswer;

    // Detect fear/anxiety patterns
    const fearLike = includesAny(text, [
      'scared of ai',
      'afraid of ai',
      'anxious',
      'anxiety',
      'fear',
      'worried',
      'worries',
      'concerned',
      'concerns',
      /je crains l'ia/i,
      'i\'m scared',
      'makes me anxious',
      'nervous about',
    ]);

    // Detect pressure to adopt AI
    const pressureLike = includesAny(text, [
      'pressure to adopt',
      'called to adopt',
      'everyone is using ai',
      'fear of missing out',
      'fomo',
      'have to use ai',
      'must adopt',
      'forced to',
      'we\'re all called',
      'everyone is doing it',
    ]);

    // Detect friend-like relationship
    const friendLike = includesAny(text, [
      'i treat it like a friend',
      'it\'s like a friend',
      'i talk to it when i',
      'i chat with it when i',
      'helps me clear my head',
      'helps me think',
      'like talking to someone',
      'conversational partner',
      'thinking partner',
      'reflective friend',
    ]);

    // Detect tool-only relationship
    const toolLike = includesAny(text, [
      'i use ai as a tool',
      'just a tool',
      'purely as a tool',
      'structured tool',
      'only a tool',
      'nothing more than',
    ]);

    // Detect calling out discrimination
    const callsOutDiscrimination = includesAny(text, [
      'this is discriminatory',
      'this is not appropriate',
      'you should phrase it like this',
      'consider different families',
      'representation',
      'diverse family',
      'intersectionality',
      'bias',
      'biased',
      'not diverse',
      'lacks diversity',
      'too narrow',
      'stereotypical',
      'defaults to',
      'white families',
      'heterosexual',
      'assumes',
      'should include',
      'more inclusive',
    ]);

    // If nothing relevant, do nothing
    if (
      !fearLike &&
      !pressureLike &&
      !friendLike &&
      !toolLike &&
      !callsOutDiscrimination
    ) {
      return { approved: true, issues: [] };
    }

    // Build classification summary for logs
    const detected: string[] = [];
    if (fearLike) detected.push('fear/anxiety');
    if (pressureLike) detected.push('pressure-to-adopt');
    if (friendLike) detected.push('ai-as-friend');
    if (toolLike) detected.push('ai-as-tool');
    if (callsOutDiscrimination) detected.push('calls-out-discrimination');

    // Log improvement signal so you can see in diagnostics
    logImprovementSignal({
      type: 'USER_CORRECTION',
      message: `Human-context patterns detected: ${detected.join(', ')}`,
      tag: 'human-context',
      severity: 2,
    });

    // Create issues + tone adjustments
    if (fearLike || pressureLike) {
      issues.push({
        severity: 3,
        tag: 'human-context',
        message:
          'User may feel anxious or under pressure about adopting AI in their life/work.',
        recommendation:
          'Respond in a calm, reassuring tone, emphasize that AI is optional and under their control, and avoid hype.',
        councillorId: 'human-context',
      });
    }

    if (friendLike) {
      issues.push({
        severity: 2,
        tag: 'human-context',
        message:
          'User relates to AI as a supportive "friend" or thinking partner.',
        recommendation:
          'Use a more conversational, empathetic tone, and help them clarify their thoughts step by step.',
        councillorId: 'human-context',
      });
    }

    if (toolLike) {
      issues.push({
        severity: 1,
        tag: 'human-context',
        message: 'User explicitly treats AI as a tool.',
        recommendation:
          'Keep answers concise, structured, and pragmatic, focusing on actionable steps over emotional support.',
        councillorId: 'human-context',
      });
    }

    if (callsOutDiscrimination) {
      issues.push({
        severity: 3,
        tag: 'human-context',
        message:
          'User is attentive to discrimination, representation, and intersectionality in AI outputs.',
        recommendation:
          'Proactively avoid stereotypical defaults and aim for diverse, inclusive examples and language.',
        councillorId: 'human-context',
      });
    }

    // Tone / content adapter
    if (revisedAnswer) {
      let extra = '';

      if (fearLike || pressureLike) {
        extra +=
          '\n\n**Note:** You are not required to adopt every AI tool or change everything at once. ' +
          'You keep control over what you use, when you use it, and how much you rely on it. ' +
          'We can explore things at your pace, step by step.';
      }

      if (friendLike) {
        extra +=
          '\n\nIf it helps, you can treat this conversation like brainstorming with a calm teammate: ' +
          'I\'ll help you clarify your thoughts, not judge them.';
      }

      if (callsOutDiscrimination) {
        extra +=
          '\n\nIt\'s good that you notice biased or narrow outputs. When something looks exclusionary, ' +
          'we can intentionally broaden the examples (different cultures, family structures, genders, etc.) ' +
          'so the result better reflects real-world diversity.';
      }

      if (extra.trim().length > 0) {
        revisedAnswer = `${revisedAnswer}${extra}`;
      }
    } else if (fearLike || pressureLike || friendLike || callsOutDiscrimination) {
      // If no draft answer but we detected context, create a contextual response
      if (fearLike || pressureLike) {
        revisedAnswer =
          'I understand your concerns. AI is a tool you can choose to use or not—there\'s no pressure. ' +
          'We can explore this at your own pace, and you maintain full control over what you adopt.';
      } else if (friendLike) {
        revisedAnswer =
          'I\'m here to help you think through this clearly, like a supportive teammate. ' +
          'What would you like to explore or clarify?';
      } else if (callsOutDiscrimination) {
        revisedAnswer =
          'Thank you for pointing that out. I\'ll make sure to include diverse, inclusive examples ' +
          'that better represent the real world.';
      }
    }

    return {
      approved: true,
      issues,
      revisedAnswer,
    };
  },
};

