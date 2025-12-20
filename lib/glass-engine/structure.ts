import type { TranscriptSegment } from '@/types/video';
import type { StructureAnalysis, StructureSection, ScriptSection, ScriptFramework } from '@/types/analysis';
import { extractSentences } from '@/lib/utils/text';

const SECTION_PATTERNS: Record<ScriptSection, { keywords: string[]; patterns: RegExp[] }> = {
  hook: {
    keywords: ['what if', 'imagine', 'picture this', 'did you know', 'ever wondered'],
    patterns: [/^(what|why|how|did|have|can)\s/i, /\?$/],
  },
  problem: {
    keywords: [
      'struggle', 'frustrating', 'hard', 'difficult', 'problem', 'issue', 'challenge',
      'pain', 'stuck', 'failing', 'mistake', 'wrong', 'broken', 'doesn\'t work',
    ],
    patterns: [
      /(the problem|the issue|the challenge)\s*(is|with)/i,
      /(struggling|frustrated|stuck)\s*(with|on|at)/i,
      /most\s*(people|creators|businesses)\s*(fail|struggle|don't)/i,
    ],
  },
  agitation: {
    keywords: [
      'worse', 'even more', 'not only', 'but also', 'imagine if', 'think about',
      'every time', 'constantly', 'keeps happening', 'over and over',
    ],
    patterns: [
      /(what|it)\s*(gets|makes)\s*(it\s*)?(worse|harder)/i,
      /not\s*only.*but\s*also/i,
      /(every|each)\s*(time|day|week)/i,
    ],
  },
  solution: {
    keywords: [
      'here\'s how', 'the answer', 'the solution', 'what works', 'the secret',
      'let me show', 'i discovered', 'the key', 'the trick', 'simple',
    ],
    patterns: [
      /(here'?s|this is)\s*(how|what|the)/i,
      /(the|a)\s*(solution|answer|secret|key|trick)\s*(is|to)/i,
      /let\s*me\s*(show|explain|tell)/i,
      /(what|here'?s what)\s*(actually\s*)?(works|helps)/i,
    ],
  },
  proof: {
    keywords: [
      'example', 'case study', 'results', 'proof', 'evidence', 'worked',
      'achieved', 'got', 'made', 'earned', 'grew', 'increased',
    ],
    patterns: [
      /(for\s*example|here'?s\s*an?\s*example)/i,
      /(i|we|they)\s*(got|achieved|made|earned|grew)/i,
      /\d+(%|k|K|\s*(percent|thousand|million))/,
      /(case\s*study|real\s*(example|story|results))/i,
    ],
  },
  cta: {
    keywords: [
      'subscribe', 'click', 'download', 'comment', 'share', 'like', 'link',
      'below', 'description', 'sign up', 'join', 'get started', 'try',
    ],
    patterns: [
      /(click|tap|hit)\s*(the|that|on)/i,
      /link\s*(in|below|in\s*the\s*description)/i,
      /(subscribe|like|comment|share)\s*(and|if|to|for|below)?/i,
      /(let\s*me\s*know|drop\s*a\s*comment)/i,
    ],
  },
};

const FRAMEWORK_PATTERNS: Record<ScriptFramework, ScriptSection[][]> = {
  pas: [['hook'], ['problem'], ['agitation'], ['solution'], ['cta']],
  aida: [['hook'], ['problem', 'agitation'], ['solution', 'proof'], ['cta']],
  'hook-value-cta': [['hook'], ['solution', 'proof'], ['cta']],
  'story-lesson': [['hook'], ['problem', 'proof'], ['solution'], ['cta']],
  'problem-solution': [['problem'], ['solution'], ['cta']],
  unknown: [],
};

export function analyzeStructure(
  transcript: string,
  segments: TranscriptSegment[]
): StructureAnalysis {
  if (!transcript || transcript.trim().length === 0) {
    return createEmptyStructureAnalysis();
  }

  const sentences = extractSentences(transcript);
  const sections = detectSections(sentences, segments);
  const { framework, confidence } = detectFramework(sections);
  const flow = generateFlowDescription(sections, framework);
  const recommendations = generateStructureRecommendations(sections, framework);

  return {
    framework,
    frameworkConfidence: confidence,
    sections,
    flow,
    recommendations,
  };
}

function detectSections(
  sentences: string[],
  segments: TranscriptSegment[]
): StructureSection[] {
  const detectedSections: StructureSection[] = [];
  const totalSentences = sentences.length;

  if (totalSentences === 0) return [];

  const sectionScores: { index: number; section: ScriptSection; score: number; text: string }[] = [];

  sentences.forEach((sentence, index) => {
    const position = index / totalSentences;
    const lowerSentence = sentence.toLowerCase();

    for (const [section, { keywords, patterns }] of Object.entries(SECTION_PATTERNS) as [ScriptSection, { keywords: string[]; patterns: RegExp[] }][]) {
      let score = 0;

      for (const keyword of keywords) {
        if (lowerSentence.includes(keyword)) {
          score += 0.3;
        }
      }

      for (const pattern of patterns) {
        if (pattern.test(sentence)) {
          score += 0.4;
        }
      }

      score += getPositionalBonus(section, position);

      if (score > 0.3) {
        sectionScores.push({ index, section, score, text: sentence });
      }
    }
  });

  const groupedSections = groupConsecutiveSections(sectionScores, sentences, segments);

  return groupedSections;
}

function getPositionalBonus(section: ScriptSection, position: number): number {
  const bonuses: Record<ScriptSection, (pos: number) => number> = {
    hook: (pos) => (pos < 0.15 ? 0.3 : pos < 0.25 ? 0.1 : -0.2),
    problem: (pos) => (pos > 0.1 && pos < 0.4 ? 0.2 : 0),
    agitation: (pos) => (pos > 0.15 && pos < 0.5 ? 0.15 : 0),
    solution: (pos) => (pos > 0.3 && pos < 0.8 ? 0.2 : 0),
    proof: (pos) => (pos > 0.4 && pos < 0.9 ? 0.15 : 0),
    cta: (pos) => (pos > 0.75 ? 0.3 : pos > 0.6 ? 0.1 : -0.2),
  };

  return bonuses[section]?.(position) || 0;
}

function groupConsecutiveSections(
  sectionScores: { index: number; section: ScriptSection; score: number; text: string }[],
  sentences: string[],
  segments: TranscriptSegment[]
): StructureSection[] {
  const grouped: StructureSection[] = [];
  const usedIndices = new Set<number>();

  sectionScores.sort((a, b) => b.score - a.score);

  const sectionOrder: ScriptSection[] = ['hook', 'problem', 'agitation', 'solution', 'proof', 'cta'];

  for (const section of sectionOrder) {
    const candidates = sectionScores.filter(
      (s) => s.section === section && !usedIndices.has(s.index)
    );

    if (candidates.length === 0) continue;

    const best = candidates[0];

    let startIndex = best.index;
    let endIndex = best.index;

    while (
      startIndex > 0 &&
      !usedIndices.has(startIndex - 1) &&
      sectionScores.some((s) => s.index === startIndex - 1 && s.section === section)
    ) {
      startIndex--;
    }

    while (
      endIndex < sentences.length - 1 &&
      !usedIndices.has(endIndex + 1) &&
      sectionScores.some((s) => s.index === endIndex + 1 && s.section === section)
    ) {
      endIndex++;
    }

    for (let i = startIndex; i <= endIndex; i++) {
      usedIndices.add(i);
    }

    const text = sentences.slice(startIndex, endIndex + 1).join(' ');

    let startTime = 0;
    let endTime = 0;

    if (segments.length > 0) {
      const totalDuration = segments[segments.length - 1].start + segments[segments.length - 1].duration;
      startTime = (startIndex / sentences.length) * totalDuration;
      endTime = ((endIndex + 1) / sentences.length) * totalDuration;
    } else {
      startTime = (startIndex / sentences.length) * 100;
      endTime = ((endIndex + 1) / sentences.length) * 100;
    }

    grouped.push({
      type: section,
      startTime,
      endTime,
      text: text.slice(0, 500),
      confidence: Math.min(0.95, best.score),
    });
  }

  grouped.sort((a, b) => a.startTime - b.startTime);

  return grouped;
}

function detectFramework(
  sections: StructureSection[]
): { framework: ScriptFramework; confidence: number } {
  if (sections.length === 0) {
    return { framework: 'unknown', confidence: 0 };
  }

  const sectionTypes = sections.map((s) => s.type);
  let bestMatch: ScriptFramework = 'unknown';
  let bestScore = 0;

  for (const [framework, expectedPatterns] of Object.entries(FRAMEWORK_PATTERNS) as [ScriptFramework, ScriptSection[][]][]) {
    if (framework === 'unknown') continue;

    let matchScore = 0;
    let patternIndex = 0;

    for (const sectionType of sectionTypes) {
      while (patternIndex < expectedPatterns.length) {
        if (expectedPatterns[patternIndex].includes(sectionType)) {
          matchScore += 1;
          patternIndex++;
          break;
        }
        patternIndex++;
      }
    }

    const normalizedScore = matchScore / expectedPatterns.length;

    if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      bestMatch = framework;
    }
  }

  if (bestScore < 0.3) {
    return { framework: 'unknown', confidence: 0.2 };
  }

  return {
    framework: bestMatch,
    confidence: Math.round(Math.min(0.95, bestScore) * 100) / 100,
  };
}

function generateFlowDescription(
  sections: StructureSection[],
  framework: ScriptFramework
): string {
  if (sections.length === 0) {
    return 'No clear structure detected. Consider organizing content into distinct sections.';
  }

  const sectionNames: Record<ScriptSection, string> = {
    hook: 'Hook',
    problem: 'Problem',
    agitation: 'Agitation',
    solution: 'Solution',
    proof: 'Proof/Evidence',
    cta: 'Call to Action',
  };

  const flowParts = sections.map((s) => sectionNames[s.type]);
  const flowString = flowParts.join(' → ');

  const frameworkNames: Record<ScriptFramework, string> = {
    pas: 'Problem-Agitate-Solution (PAS)',
    aida: 'Attention-Interest-Desire-Action (AIDA)',
    'hook-value-cta': 'Hook-Value-CTA',
    'story-lesson': 'Story-Lesson',
    'problem-solution': 'Problem-Solution',
    unknown: 'Custom/Unstructured',
  };

  return `${flowString}\n\nDetected Framework: ${frameworkNames[framework]}`;
}

function generateStructureRecommendations(
  sections: StructureSection[],
  framework: ScriptFramework
): string[] {
  const recommendations: string[] = [];
  const sectionTypes = new Set(sections.map((s) => s.type));

  if (!sectionTypes.has('hook')) {
    recommendations.push('Add a strong hook in the first 5-10 seconds to capture attention immediately');
  }

  if (!sectionTypes.has('problem') && !sectionTypes.has('agitation')) {
    recommendations.push('Consider adding a problem/pain point section to create emotional connection');
  }

  if (!sectionTypes.has('solution')) {
    recommendations.push('Include a clear solution or value delivery section');
  }

  if (!sectionTypes.has('proof')) {
    recommendations.push('Add proof elements (examples, results, testimonials) to build credibility');
  }

  if (!sectionTypes.has('cta')) {
    recommendations.push('End with a clear call-to-action to drive engagement');
  }

  if (sections.length > 0) {
    const hookSection = sections.find((s) => s.type === 'hook');
    if (hookSection && hookSection.startTime > 10) {
      recommendations.push('Move hook content earlier - ideally within the first 5 seconds');
    }

    const ctaSection = sections.find((s) => s.type === 'cta');
    if (ctaSection) {
      const lastSection = sections[sections.length - 1];
      if (ctaSection !== lastSection) {
        recommendations.push('Consider moving CTA closer to the end for maximum impact');
      }
    }
  }

  if (framework === 'unknown' && sections.length >= 2) {
    recommendations.push('Content has elements but lacks cohesive structure - consider following a proven framework like PAS or Hook-Value-CTA');
  }

  return recommendations.slice(0, 5);
}

function createEmptyStructureAnalysis(): StructureAnalysis {
  return {
    framework: 'unknown',
    frameworkConfidence: 0,
    sections: [],
    flow: 'No content to analyze',
    recommendations: [
      'Add a hook to capture attention',
      'Include a clear problem statement',
      'Provide a solution or value',
      'End with a call-to-action',
    ],
  };
}
