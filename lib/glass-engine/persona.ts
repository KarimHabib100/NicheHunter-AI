import type { TranscriptSegment } from '@/types/video';
import type { PersonaAnalysis, PersonaArchetype, PersonaTraits } from '@/types/analysis';
import { extractSentences, wordCount, extractWords } from '@/lib/utils/text';

const LOGICAL_MARKERS = [
  'because', 'therefore', 'thus', 'data', 'research', 'study', 'evidence',
  'proves', 'shows', 'demonstrates', 'logically', 'reason', 'fact', 'statistics',
];

const EMOTIONAL_MARKERS = [
  'feel', 'feeling', 'imagine', 'picture', 'amazing', 'incredible', 'love',
  'hate', 'frustrated', 'excited', 'scared', 'dream', 'passion', 'heart',
];

const SOCIAL_MARKERS = [
  'everyone', 'most people', 'they', 'others', 'community', 'together',
  'we all', 'nobody', 'somebody', 'people say', 'experts', 'successful',
];

const AUTHORITY_MARKERS = [
  'must', 'should', 'need to', 'have to', 'always', 'never', 'the truth',
  'the fact is', 'let me be clear', 'understand this', 'listen',
];

const FRIENDLY_MARKERS = [
  'honestly', 'between you and me', 'look', 'hey', 'friend', 'buddy',
  'real talk', 'confession', 'truth be told', 'personally', 'my experience',
];

const PROVOCATIVE_MARKERS = [
  'wrong', 'lie', 'scam', 'fake', 'myth', 'stupid', 'ridiculous',
  'nobody tells', 'secret', 'controversial', 'unpopular opinion', 'harsh truth',
];

export function analyzePersona(
  transcript: string,
  segments: TranscriptSegment[]
): PersonaAnalysis {
  if (!transcript || transcript.trim().length === 0) {
    return createDefaultPersonaAnalysis();
  }

  const traits = calculateTraits(transcript, segments);
  const { archetype, confidence } = classifyArchetype(traits, transcript);
  const voiceDescription = generateVoiceDescription(traits, archetype);
  const recommendations = generatePersonaRecommendations(traits, archetype);

  return {
    archetype,
    confidence,
    traits,
    voiceDescription,
    recommendations,
  };
}

function calculateTraits(
  transcript: string,
  segments: TranscriptSegment[]
): PersonaTraits {
  const words = extractWords(transcript);
  const sentences = extractSentences(transcript);
  const totalWords = words.length;

  let durationMinutes = 1;
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    durationMinutes = Math.max((lastSegment.start + lastSegment.duration) / 60, 1);
  } else {
    durationMinutes = Math.max(totalWords / 150, 1);
  }

  const wordsPerMinute = Math.round(totalWords / durationMinutes);

  let speakingPace: 'slow' | 'moderate' | 'fast' = 'moderate';
  if (wordsPerMinute < 120) speakingPace = 'slow';
  else if (wordsPerMinute > 170) speakingPace = 'fast';

  const avgSentenceLength = totalWords / Math.max(sentences.length, 1);

  const authorityScore = calculateAuthorityScore(transcript, avgSentenceLength);
  const relatabilityScore = calculateRelatabilityScore(transcript);
  const engagementStyle = determineEngagementStyle(transcript);
  const energyLevel = calculateEnergyLevel(transcript);
  const persuasionType = determinePersuasionType(transcript);

  return {
    speakingPace,
    wordsPerMinute,
    authorityScore,
    relatabilityScore,
    engagementStyle,
    energyLevel,
    persuasionType,
  };
}

function calculateAuthorityScore(transcript: string, avgSentenceLength: number): number {
  const lowerTranscript = transcript.toLowerCase();
  let score = 0.5;

  for (const marker of AUTHORITY_MARKERS) {
    if (lowerTranscript.includes(marker)) {
      score += 0.05;
    }
  }

  if (avgSentenceLength > 18) score += 0.1;
  if (avgSentenceLength > 25) score += 0.1;

  const iCount = (lowerTranscript.match(/\bi\b/g) || []).length;
  const totalWords = transcript.split(/\s+/).length;
  const iRatio = iCount / totalWords;
  if (iRatio < 0.02) score += 0.1;

  return Math.min(1, Math.max(0, score));
}

function calculateRelatabilityScore(transcript: string): number {
  const lowerTranscript = transcript.toLowerCase();
  let score = 0.5;

  for (const marker of FRIENDLY_MARKERS) {
    if (lowerTranscript.includes(marker)) {
      score += 0.06;
    }
  }

  const youCount = (lowerTranscript.match(/\byou\b/g) || []).length;
  const weCount = (lowerTranscript.match(/\bwe\b/g) || []).length;
  const totalWords = transcript.split(/\s+/).length;

  const engagementRatio = (youCount + weCount) / totalWords;
  if (engagementRatio > 0.02) score += 0.1;
  if (engagementRatio > 0.04) score += 0.1;

  const questionCount = (transcript.match(/\?/g) || []).length;
  const questionRatio = questionCount / (transcript.length / 100);
  if (questionRatio > 0.5) score += 0.1;

  return Math.min(1, Math.max(0, score));
}

function determineEngagementStyle(
  transcript: string
): 'conversational' | 'educational' | 'persuasive' {
  const lowerTranscript = transcript.toLowerCase();

  const questionCount = (transcript.match(/\?/g) || []).length;
  const youCount = (lowerTranscript.match(/\byou\b/g) || []).length;
  const imperativeCount = countImperatives(lowerTranscript);

  const conversationalScore = questionCount * 2 + youCount * 0.5;
  const educationalScore = countEducationalMarkers(lowerTranscript);
  const persuasiveScore = imperativeCount * 2 + countPersuasiveMarkers(lowerTranscript);

  if (conversationalScore > educationalScore && conversationalScore > persuasiveScore) {
    return 'conversational';
  }
  if (educationalScore > persuasiveScore) {
    return 'educational';
  }
  return 'persuasive';
}

function countImperatives(text: string): number {
  const imperativePatterns = [
    /^(do|make|take|get|try|start|stop|think|look|watch|listen|remember|consider)\b/gim,
    /\b(you need to|you must|you should|you have to)\b/gi,
  ];

  let count = 0;
  for (const pattern of imperativePatterns) {
    const matches = text.match(pattern);
    count += matches ? matches.length : 0;
  }
  return count;
}

function countEducationalMarkers(text: string): number {
  const markers = [
    'step', 'first', 'second', 'third', 'next', 'finally',
    'how to', 'guide', 'tutorial', 'learn', 'understand',
    'explained', 'breakdown', 'tip', 'strategy', 'method',
  ];

  let count = 0;
  for (const marker of markers) {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = text.match(regex);
    count += matches ? matches.length : 0;
  }
  return count;
}

function countPersuasiveMarkers(text: string): number {
  const markers = [
    'must', 'need', 'should', 'have to', 'urgent', 'now',
    'don\'t miss', 'limited', 'exclusive', 'only', 'best',
  ];

  let count = 0;
  for (const marker of markers) {
    if (text.includes(marker)) count++;
  }
  return count;
}

function calculateEnergyLevel(transcript: string): 'low' | 'medium' | 'high' {
  const exclamationCount = (transcript.match(/!/g) || []).length;
  const capsWordCount = (transcript.match(/\b[A-Z]{2,}\b/g) || []).length;

  const sentences = extractSentences(transcript);
  const shortSentences = sentences.filter((s) => wordCount(s) <= 6).length;
  const shortRatio = shortSentences / Math.max(sentences.length, 1);

  const energyScore = exclamationCount * 0.3 + capsWordCount * 0.2 + shortRatio * 2;

  if (energyScore > 3) return 'high';
  if (energyScore > 1) return 'medium';
  return 'low';
}

function determinePersuasionType(transcript: string): 'logical' | 'emotional' | 'social' {
  const lowerTranscript = transcript.toLowerCase();

  let logicalScore = 0;
  let emotionalScore = 0;
  let socialScore = 0;

  for (const marker of LOGICAL_MARKERS) {
    if (lowerTranscript.includes(marker)) logicalScore++;
  }

  for (const marker of EMOTIONAL_MARKERS) {
    if (lowerTranscript.includes(marker)) emotionalScore++;
  }

  for (const marker of SOCIAL_MARKERS) {
    if (lowerTranscript.includes(marker)) socialScore++;
  }

  if (logicalScore >= emotionalScore && logicalScore >= socialScore) {
    return 'logical';
  }
  if (emotionalScore >= socialScore) {
    return 'emotional';
  }
  return 'social';
}

function classifyArchetype(
  traits: PersonaTraits,
  transcript: string
): { archetype: PersonaArchetype; confidence: number } {
  const lowerTranscript = transcript.toLowerCase();

  const scores: Record<PersonaArchetype, number> = {
    teacher: 0,
    entertainer: 0,
    authority: 0,
    friend: 0,
    provocateur: 0,
  };

  if (traits.engagementStyle === 'educational') scores.teacher += 0.3;
  if (traits.persuasionType === 'logical') scores.teacher += 0.2;
  if (countEducationalMarkers(lowerTranscript) > 5) scores.teacher += 0.2;

  if (traits.energyLevel === 'high') scores.entertainer += 0.3;
  if (traits.speakingPace === 'fast') scores.entertainer += 0.2;
  if (traits.relatabilityScore > 0.6) scores.entertainer += 0.2;

  scores.authority += traits.authorityScore * 0.5;
  if (traits.engagementStyle === 'persuasive') scores.authority += 0.2;
  for (const marker of AUTHORITY_MARKERS) {
    if (lowerTranscript.includes(marker)) scores.authority += 0.05;
  }

  scores.friend += traits.relatabilityScore * 0.4;
  if (traits.engagementStyle === 'conversational') scores.friend += 0.2;
  for (const marker of FRIENDLY_MARKERS) {
    if (lowerTranscript.includes(marker)) scores.friend += 0.08;
  }

  for (const marker of PROVOCATIVE_MARKERS) {
    if (lowerTranscript.includes(marker)) scores.provocateur += 0.1;
  }
  if (traits.energyLevel === 'high' && traits.persuasionType === 'emotional') {
    scores.provocateur += 0.15;
  }

  let maxScore = 0;
  let archetype: PersonaArchetype = 'teacher';

  for (const [type, score] of Object.entries(scores) as [PersonaArchetype, number][]) {
    if (score > maxScore) {
      maxScore = score;
      archetype = type;
    }
  }

  const confidence = Math.min(0.95, Math.max(0.3, maxScore));

  return { archetype, confidence: Math.round(confidence * 100) / 100 };
}

function generateVoiceDescription(traits: PersonaTraits, archetype: PersonaArchetype): string {
  const parts: string[] = [];

  const archetypeDescriptions: Record<PersonaArchetype, string> = {
    teacher: 'Educational and instructive tone',
    entertainer: 'Energetic and engaging delivery',
    authority: 'Confident and directive voice',
    friend: 'Warm and conversational style',
    provocateur: 'Bold and challenging approach',
  };

  parts.push(archetypeDescriptions[archetype]);

  if (traits.speakingPace === 'fast') {
    parts.push('with rapid delivery');
  } else if (traits.speakingPace === 'slow') {
    parts.push('with measured, deliberate pacing');
  }

  if (traits.persuasionType === 'logical') {
    parts.push('emphasizing facts and reasoning');
  } else if (traits.persuasionType === 'emotional') {
    parts.push('leveraging emotional connection');
  } else {
    parts.push('using social proof and relatability');
  }

  if (traits.energyLevel === 'high') {
    parts.push('High energy throughout.');
  } else if (traits.energyLevel === 'low') {
    parts.push('Calm, steady energy.');
  }

  return parts.join(', ') + '.';
}

function generatePersonaRecommendations(
  traits: PersonaTraits,
  archetype: PersonaArchetype
): string[] {
  const recommendations: string[] = [];

  if (archetype === 'teacher') {
    recommendations.push('Break content into clear, numbered steps');
    recommendations.push('Use analogies to simplify complex concepts');
    if (traits.relatabilityScore < 0.5) {
      recommendations.push('Add personal anecdotes to increase relatability');
    }
  }

  if (archetype === 'entertainer') {
    recommendations.push('Maintain high energy but ensure substance');
    if (traits.persuasionType !== 'logical') {
      recommendations.push('Add data points to increase credibility');
    }
  }

  if (archetype === 'authority') {
    recommendations.push('Back claims with specific examples or data');
    if (traits.relatabilityScore < 0.5) {
      recommendations.push('Balance authority with moments of vulnerability');
    }
  }

  if (archetype === 'friend') {
    recommendations.push('Use direct address ("you", "your") frequently');
    if (traits.authorityScore < 0.5) {
      recommendations.push('Add more decisive statements to build authority');
    }
  }

  if (archetype === 'provocateur') {
    recommendations.push('Ensure controversial claims are backed by substance');
    recommendations.push('Balance provocation with genuine value delivery');
  }

  if (traits.speakingPace === 'slow') {
    recommendations.push('Consider picking up pace during less critical sections');
  }

  if (traits.energyLevel === 'low') {
    recommendations.push('Inject energy spikes at key moments to maintain interest');
  }

  return recommendations.slice(0, 4);
}

function createDefaultPersonaAnalysis(): PersonaAnalysis {
  return {
    archetype: 'teacher',
    confidence: 0.5,
    traits: {
      speakingPace: 'moderate',
      wordsPerMinute: 150,
      authorityScore: 0.5,
      relatabilityScore: 0.5,
      engagementStyle: 'educational',
      energyLevel: 'medium',
      persuasionType: 'logical',
    },
    voiceDescription: 'Standard educational delivery style.',
    recommendations: [
      'Develop a consistent vocal identity',
      'Vary energy levels strategically',
      'Use direct address to engage viewers',
      'Balance authority with relatability',
    ],
  };
}
