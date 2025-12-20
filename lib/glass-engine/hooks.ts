import type { TranscriptSegment } from '@/types/video';
import type { HookAnalysis, HookType } from '@/types/analysis';
import { extractSentences, wordCount } from '@/lib/utils/text';

interface HookPattern {
  type: HookType;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
}

const HOOK_PATTERNS: HookPattern[] = [
  {
    type: 'question',
    keywords: ['what if', 'did you know', 'have you ever', 'why do', 'how do', 'what would', 'can you'],
    patterns: [
      /^(what|why|how|when|where|who|which|did|do|does|is|are|can|could|would|have)\s/i,
      /\?$/,
    ],
    weight: 1.0,
  },
  {
    type: 'statistic',
    keywords: ['percent', 'million', 'billion', 'study', 'research', 'data', 'found', 'shows', 'according'],
    patterns: [
      /\d+(\.\d+)?(%|\s*(percent|million|billion|thousand))/i,
      /\d+\s*(out of|in)\s*\d+/i,
      /(study|research|survey|report)\s*(shows?|found|reveals?)/i,
    ],
    weight: 1.2,
  },
  {
    type: 'controversy',
    keywords: [
      'wrong', 'lie', 'truth', 'actually', 'nobody tells', 'secret', 'myth',
      'stop', 'never', 'worst', 'mistake', 'unpopular', 'controversial', 'hate'
    ],
    patterns: [
      /everything\s*(you|we)\s*(know|think|believe)/i,
      /(they|experts|gurus)\s*(don't|won't|never)\s*tell/i,
      /^(stop|never|don't)\s/i,
      /\b(lie|lying|lied|wrong|myth|fake|scam)\b/i,
    ],
    weight: 1.3,
  },
  {
    type: 'story',
    keywords: [
      'yesterday', 'last week', 'last month', 'years ago', 'when i',
      'i was', 'i remember', 'let me tell', 'story', 'happened'
    ],
    patterns: [
      /^(yesterday|last\s*(week|month|year)|(\d+|a few|several)\s*(days?|weeks?|months?|years?)\s*ago)/i,
      /^(when\s*i|i\s*was|i\s*remember|so\s*there\s*i\s*was)/i,
      /^(let\s*me\s*tell|i('ll|'m going to)\s*share|here's\s*(a|my)\s*story)/i,
    ],
    weight: 1.1,
  },
  {
    type: 'curiosity-gap',
    keywords: [
      'secret', 'hidden', 'discover', 'reveal', 'truth', 'unlock',
      'nobody knows', 'few people', 'most people', "you won't believe"
    ],
    patterns: [
      /(secret|hidden|unknown)\s*(that|to|about)/i,
      /you\s*(won't|wouldn't)\s*believe/i,
      /(wait\s*(until|till)|by\s*the\s*end)/i,
      /i('ll|'m going to)\s*(show|reveal|tell)\s*you/i,
    ],
    weight: 1.2,
  },
  {
    type: 'direct-challenge',
    keywords: [
      'you need', 'you must', 'you should', 'you have to',
      'stop doing', 'start doing', 'listen', 'pay attention'
    ],
    patterns: [
      /^you\s*(need|must|should|have)\s*to/i,
      /^(stop|start|listen|look|pay\s*attention|hear\s*me)/i,
      /^if\s*you('re| are)\s*(still|not|serious)/i,
    ],
    weight: 1.0,
  },
];

const HOOK_STRENGTHS: Record<HookType, string[]> = {
  question: [
    'Engages viewer curiosity immediately',
    'Creates mental engagement by prompting thought',
    'Low barrier to entry - viewers want to know the answer',
  ],
  statistic: [
    'Establishes credibility through data',
    'Creates concrete mental anchor',
    'Appeals to logical decision-makers',
  ],
  controversy: [
    'High pattern interrupt - breaks expectations',
    'Triggers emotional response',
    'Creates strong "prove it" engagement',
  ],
  story: [
    'Builds emotional connection quickly',
    'Activates narrative processing in brain',
    'Creates natural curiosity about outcome',
  ],
  'curiosity-gap': [
    'Creates information asymmetry that viewers want to resolve',
    'Strong "open loop" that demands closure',
    'Works well for longer content retention',
  ],
  'direct-challenge': [
    'Creates immediate stakes for the viewer',
    'Filters for engaged audience',
    'Establishes authority positioning',
  ],
  unknown: [],
};

const HOOK_WEAKNESSES: Record<HookType, string[]> = {
  question: [
    'Can feel generic if question is too broad',
    'May not work if answer seems obvious',
  ],
  statistic: [
    'Can feel cold without emotional context',
    'Viewers may be skeptical of unsourced data',
  ],
  controversy: [
    'Risk of appearing clickbait-y',
    'May alienate some viewers immediately',
  ],
  story: [
    'Takes longer to establish value proposition',
    'May lose impatient viewers',
  ],
  'curiosity-gap': [
    'Overused - viewers may be desensitized',
    'Must deliver on promise or damage trust',
  ],
  'direct-challenge': [
    'Can feel aggressive to some viewers',
    'May create defensive response',
  ],
  unknown: ['Hook type not clearly defined - may not grab attention effectively'],
};

export function analyzeHook(
  transcript: string,
  segments: TranscriptSegment[]
): HookAnalysis {
  const hookText = extractHookText(transcript, segments);
  const hookSentences = extractSentences(hookText);

  if (hookSentences.length === 0) {
    return createEmptyHookAnalysis();
  }

  const scores = calculateHookScores(hookText, hookSentences);
  const detectedType = determineHookType(scores);
  const confidence = calculateConfidence(scores, detectedType);

  const breakdown = generateBreakdown(hookText, hookSentences, detectedType, scores);

  return {
    type: detectedType,
    confidence,
    text: hookText,
    breakdown,
    strengths: HOOK_STRENGTHS[detectedType] || [],
    weaknesses: HOOK_WEAKNESSES[detectedType] || [],
  };
}

function extractHookText(transcript: string, segments: TranscriptSegment[]): string {
  if (segments.length > 0) {
    const hookSegments = segments.filter((s) => s.start < 10);
    if (hookSegments.length > 0) {
      return hookSegments.map((s) => s.text).join(' ').trim();
    }
  }

  const sentences = extractSentences(transcript);
  const hookSentences = sentences.slice(0, 3);
  return hookSentences.join(' ').trim();
}

function calculateHookScores(hookText: string, sentences: string[]): Map<HookType, number> {
  const scores = new Map<HookType, number>();
  const lowerText = hookText.toLowerCase();
  const firstSentence = sentences[0]?.toLowerCase() || '';

  for (const pattern of HOOK_PATTERNS) {
    let score = 0;

    for (const keyword of pattern.keywords) {
      if (lowerText.includes(keyword)) {
        score += 0.3;
      }
      if (firstSentence.includes(keyword)) {
        score += 0.2;
      }
    }

    for (const regex of pattern.patterns) {
      if (regex.test(hookText)) {
        score += 0.4;
      }
      if (regex.test(firstSentence)) {
        score += 0.3;
      }
    }

    score *= pattern.weight;

    scores.set(pattern.type, score);
  }

  return scores;
}

function determineHookType(scores: Map<HookType, number>): HookType {
  let maxScore = 0;
  let detectedType: HookType = 'unknown';

  for (const [type, score] of scores) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }

  if (maxScore < 0.3) {
    return 'unknown';
  }

  return detectedType;
}

function calculateConfidence(scores: Map<HookType, number>, detectedType: HookType): number {
  const typeScore = scores.get(detectedType) || 0;

  let totalOtherScores = 0;
  let count = 0;
  for (const [type, score] of scores) {
    if (type !== detectedType) {
      totalOtherScores += score;
      count++;
    }
  }
  const avgOtherScore = count > 0 ? totalOtherScores / count : 0;

  const separation = typeScore - avgOtherScore;
  const confidence = Math.min(0.95, Math.max(0.1, 0.5 + separation * 0.5));

  return Math.round(confidence * 100) / 100;
}

function generateBreakdown(
  hookText: string,
  sentences: string[],
  type: HookType,
  scores: Map<HookType, number>
): string {
  const lines: string[] = [];

  lines.push(`Hook Type: ${formatHookType(type)}`);
  lines.push('');
  lines.push('Analysis:');

  const firstSentence = sentences[0] || hookText;
  lines.push(`• Opening line: "${firstSentence.slice(0, 100)}${firstSentence.length > 100 ? '...' : ''}"`);

  const words = wordCount(hookText);
  lines.push(`• Hook length: ${words} words (${words < 20 ? 'concise' : words < 40 ? 'moderate' : 'long'})`);

  if (type === 'question') {
    lines.push('• Pattern: Opens with interrogative, engages curiosity');
  } else if (type === 'statistic') {
    lines.push('• Pattern: Leads with data point, establishes credibility');
  } else if (type === 'controversy') {
    lines.push('• Pattern: Challenges assumptions, creates tension');
  } else if (type === 'story') {
    lines.push('• Pattern: Personal narrative, builds connection');
  } else if (type === 'curiosity-gap') {
    lines.push('• Pattern: Promise of revelation, information asymmetry');
  } else if (type === 'direct-challenge') {
    lines.push('• Pattern: Addresses viewer directly, creates urgency');
  }

  lines.push('');
  lines.push('Secondary signals detected:');
  const sortedScores = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  for (const [hookType, score] of sortedScores.slice(1, 4)) {
    if (score > 0.1) {
      lines.push(`• ${formatHookType(hookType)}: ${Math.round(score * 100)}% match`);
    }
  }

  return lines.join('\n');
}

function formatHookType(type: HookType): string {
  const formats: Record<HookType, string> = {
    question: 'Question Hook',
    statistic: 'Statistic Hook',
    controversy: 'Controversy/Contrarian Hook',
    story: 'Story Hook',
    'curiosity-gap': 'Curiosity Gap Hook',
    'direct-challenge': 'Direct Challenge Hook',
    unknown: 'Unclassified Hook',
  };
  return formats[type] || type;
}

function createEmptyHookAnalysis(): HookAnalysis {
  return {
    type: 'unknown',
    confidence: 0,
    text: '',
    breakdown: 'No hook content detected. The transcript may be empty or too short.',
    strengths: [],
    weaknesses: ['No clear hook pattern detected'],
  };
}
