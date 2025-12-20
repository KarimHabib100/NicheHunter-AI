import type { TranscriptSegment } from '@/types/video';
import type { RetentionAnalysis, RetentionSegment } from '@/types/analysis';
import { extractSentences, wordCount, extractWords } from '@/lib/utils/text';

const PATTERN_INTERRUPT_MARKERS = [
  'but', 'however', 'now', 'here\'s the thing', 'wait', 'hold on',
  'let me show', 'watch this', 'look at', 'check this out',
  'the real', 'actually', 'here\'s what', 'this is where',
];

const OPEN_LOOP_OPENERS = [
  'i\'ll show you', 'i\'m going to', 'we\'ll get to', 'later',
  'by the end', 'wait until', 'you\'ll see', 'coming up',
  'stick around', 'don\'t go anywhere', 'in a moment', 'soon',
];

const OPEN_LOOP_CLOSERS = [
  'here it is', 'as promised', 'so here\'s', 'now let me show',
  'this is it', 'the answer is', 'finally', 'here we go',
];

const ENGAGEMENT_TRIGGERS = [
  'you', 'your', 'imagine', 'think about', 'picture this',
  'have you ever', 'do you', 'what if you', 'let me ask',
];

const TRANSITION_PHRASES = [
  'first', 'second', 'third', 'next', 'finally', 'lastly',
  'step one', 'step two', 'moving on', 'let\'s talk about',
  'the next thing', 'another', 'additionally', 'furthermore',
];

export function analyzeRetention(
  transcript: string,
  segments: TranscriptSegment[]
): RetentionAnalysis {
  if (!transcript || transcript.trim().length === 0) {
    return createEmptyRetentionAnalysis();
  }

  const textSegments = createTextSegments(transcript, segments);
  const retentionSegments = analyzeSegments(textSegments);
  const patternInterrupts = detectPatternInterrupts(transcript, segments);
  const openLoops = detectOpenLoops(transcript, segments);
  const weakSpots = identifyWeakSpots(retentionSegments);

  const overallScore = calculateOverallScore(retentionSegments, patternInterrupts, openLoops);

  return {
    overallScore,
    segments: retentionSegments,
    patternInterrupts,
    openLoops,
    weakSpots,
  };
}

interface TextSegment {
  text: string;
  startTime: number;
  endTime: number;
  index: number;
}

function createTextSegments(
  transcript: string,
  segments: TranscriptSegment[]
): TextSegment[] {
  if (segments.length > 0) {
    const totalDuration = segments[segments.length - 1].start + segments[segments.length - 1].duration;
    const segmentDuration = Math.max(30, totalDuration / 10);

    const textSegments: TextSegment[] = [];
    let currentSegment: TextSegment = {
      text: '',
      startTime: 0,
      endTime: segmentDuration,
      index: 0,
    };

    for (const seg of segments) {
      if (seg.start >= currentSegment.endTime) {
        if (currentSegment.text.trim()) {
          textSegments.push(currentSegment);
        }
        currentSegment = {
          text: seg.text,
          startTime: currentSegment.endTime,
          endTime: currentSegment.endTime + segmentDuration,
          index: textSegments.length,
        };
      } else {
        currentSegment.text += ' ' + seg.text;
      }
    }

    if (currentSegment.text.trim()) {
      textSegments.push(currentSegment);
    }

    return textSegments;
  }

  const sentences = extractSentences(transcript);
  const segmentSize = Math.max(3, Math.ceil(sentences.length / 10));
  const textSegments: TextSegment[] = [];

  for (let i = 0; i < sentences.length; i += segmentSize) {
    const segmentSentences = sentences.slice(i, i + segmentSize);
    textSegments.push({
      text: segmentSentences.join(' '),
      startTime: (i / sentences.length) * 100,
      endTime: (Math.min(i + segmentSize, sentences.length) / sentences.length) * 100,
      index: textSegments.length,
    });
  }

  return textSegments;
}

function analyzeSegments(textSegments: TextSegment[]): RetentionSegment[] {
  return textSegments.map((segment) => {
    const density = calculateInformationDensity(segment.text);
    const engagement = calculateEngagementLevel(segment.text);
    const pacing = calculatePacingScore(segment.text);

    const score = (density * 0.4 + engagement * 0.35 + pacing * 0.25);
    const label = getSegmentLabel(score, segment.index, textSegments.length);

    return {
      startTime: segment.startTime,
      endTime: segment.endTime,
      score: Math.round(score * 100) / 100,
      label,
      signals: getSegmentSignals(segment.text, score),
    };
  });
}

function calculateInformationDensity(text: string): number {
  const words = extractWords(text);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

  if (words.length === 0) return 0;

  const uniqueRatio = uniqueWords.size / words.length;

  const sentences = extractSentences(text);
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);

  const conceptWords = words.filter((w) =>
    w.length > 5 && !['because', 'through', 'before', 'after', 'should', 'would', 'could'].includes(w)
  );
  const conceptDensity = conceptWords.length / Math.max(words.length, 1);

  const density = (uniqueRatio * 0.4) + (Math.min(avgSentenceLength / 20, 1) * 0.3) + (conceptDensity * 0.3);

  return Math.min(1, density);
}

function calculateEngagementLevel(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0.5;

  for (const trigger of ENGAGEMENT_TRIGGERS) {
    if (lowerText.includes(trigger)) {
      score += 0.08;
    }
  }

  const questionCount = (text.match(/\?/g) || []).length;
  score += Math.min(questionCount * 0.1, 0.3);

  for (const interrupt of PATTERN_INTERRUPT_MARKERS) {
    if (lowerText.includes(interrupt)) {
      score += 0.05;
    }
  }

  return Math.min(1, score);
}

function calculatePacingScore(text: string): number {
  const sentences = extractSentences(text);
  if (sentences.length < 2) return 0.5;

  const lengths = sentences.map((s) => wordCount(s));
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  const variationScore = Math.min(stdDev / 10, 1);

  const hasShortPunchy = lengths.some((l) => l <= 5);
  const shortBonus = hasShortPunchy ? 0.1 : 0;

  return Math.min(1, variationScore + shortBonus + 0.3);
}

function getSegmentLabel(score: number, index: number, totalSegments: number): string {
  const position = index / totalSegments;

  if (position < 0.1) {
    return score > 0.6 ? 'Strong hook' : 'Weak opening';
  }

  if (position > 0.9) {
    return score > 0.6 ? 'Strong close' : 'Weak ending';
  }

  if (score > 0.75) return 'High retention';
  if (score > 0.6) return 'Good engagement';
  if (score > 0.45) return 'Moderate';
  if (score > 0.3) return 'Drop-off risk';
  return 'Low engagement';
}

function getSegmentSignals(text: string, score: number): string[] {
  const signals: string[] = [];
  const lowerText = text.toLowerCase();

  if (text.includes('?')) {
    signals.push('Contains questions');
  }

  for (const trigger of ENGAGEMENT_TRIGGERS.slice(0, 3)) {
    if (lowerText.includes(trigger)) {
      signals.push('Direct viewer address');
      break;
    }
  }

  for (const interrupt of PATTERN_INTERRUPT_MARKERS.slice(0, 5)) {
    if (lowerText.includes(interrupt)) {
      signals.push('Pattern interrupt present');
      break;
    }
  }

  for (const transition of TRANSITION_PHRASES) {
    if (lowerText.includes(transition)) {
      signals.push('Clear structure/transition');
      break;
    }
  }

  if (score < 0.4) {
    const sentences = extractSentences(text);
    const avgLength = text.length / Math.max(sentences.length, 1);
    if (avgLength > 150) {
      signals.push('Long sentences - consider breaking up');
    }
  }

  return signals;
}

function detectPatternInterrupts(
  transcript: string,
  segments: TranscriptSegment[]
): { timestamp: number; type: string }[] {
  const interrupts: { timestamp: number; type: string }[] = [];
  const lowerTranscript = transcript.toLowerCase();

  if (segments.length > 0) {
    for (const segment of segments) {
      const lowerText = segment.text.toLowerCase();

      for (const marker of PATTERN_INTERRUPT_MARKERS) {
        if (lowerText.includes(marker)) {
          interrupts.push({
            timestamp: segment.start,
            type: categorizeInterrupt(marker),
          });
          break;
        }
      }

      if (segment.text.includes('?') && segment.start > 10) {
        interrupts.push({
          timestamp: segment.start,
          type: 'Question',
        });
      }
    }
  } else {
    const sentences = extractSentences(transcript);
    const avgPosition = 100 / sentences.length;

    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();

      for (const marker of PATTERN_INTERRUPT_MARKERS) {
        if (lowerSentence.startsWith(marker) || lowerSentence.includes('. ' + marker)) {
          interrupts.push({
            timestamp: index * avgPosition,
            type: categorizeInterrupt(marker),
          });
          break;
        }
      }
    });
  }

  return interrupts;
}

function categorizeInterrupt(marker: string): string {
  if (['but', 'however', 'actually'].includes(marker)) return 'Contrast';
  if (['now', 'here\'s the thing', 'here\'s what'].includes(marker)) return 'Pivot';
  if (['wait', 'hold on'].includes(marker)) return 'Pause';
  if (['let me show', 'watch this', 'look at', 'check this out'].includes(marker)) return 'Demo';
  return 'Transition';
}

function detectOpenLoops(
  transcript: string,
  segments: TranscriptSegment[]
): { opened: number; closed: number | null; text: string }[] {
  const loops: { opened: number; closed: number | null; text: string }[] = [];
  const lowerTranscript = transcript.toLowerCase();

  for (const opener of OPEN_LOOP_OPENERS) {
    const index = lowerTranscript.indexOf(opener);
    if (index !== -1) {
      const position = (index / transcript.length) * 100;

      const nearbyText = transcript.slice(index, Math.min(index + 100, transcript.length));
      const snippet = nearbyText.split(/[.!?]/)[0] || nearbyText.slice(0, 50);

      let closedPosition: number | null = null;

      for (const closer of OPEN_LOOP_CLOSERS) {
        const closeIndex = lowerTranscript.indexOf(closer, index + 20);
        if (closeIndex !== -1) {
          closedPosition = (closeIndex / transcript.length) * 100;
          break;
        }
      }

      loops.push({
        opened: Math.round(position),
        closed: closedPosition ? Math.round(closedPosition) : null,
        text: snippet.trim(),
      });
    }
  }

  return loops;
}

function identifyWeakSpots(
  segments: RetentionSegment[]
): { timestamp: number; reason: string }[] {
  const weakSpots: { timestamp: number; reason: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (segment.score < 0.35) {
      weakSpots.push({
        timestamp: segment.startTime,
        reason: 'Low engagement detected - content may feel flat',
      });
    }

    if (i > 0 && segments[i - 1].score - segment.score > 0.25) {
      weakSpots.push({
        timestamp: segment.startTime,
        reason: 'Sharp drop in engagement - add pattern interrupt here',
      });
    }

    if (i > 2 && i < segments.length - 2) {
      const recentScores = segments.slice(i - 2, i + 1).map((s) => s.score);
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      if (avgRecent < 0.45) {
        weakSpots.push({
          timestamp: segment.startTime,
          reason: 'Extended low engagement - consider restructuring this section',
        });
      }
    }
  }

  const uniqueWeakSpots = weakSpots.filter(
    (spot, index, self) =>
      index === self.findIndex((s) => Math.abs(s.timestamp - spot.timestamp) < 5)
  );

  return uniqueWeakSpots.slice(0, 5);
}

function calculateOverallScore(
  segments: RetentionSegment[],
  interrupts: { timestamp: number; type: string }[],
  openLoops: { opened: number; closed: number | null; text: string }[]
): number {
  if (segments.length === 0) return 0;

  const avgSegmentScore = segments.reduce((sum, s) => sum + s.score, 0) / segments.length;

  const interruptBonus = Math.min(interrupts.length * 0.02, 0.1);

  const closedLoops = openLoops.filter((l) => l.closed !== null).length;
  const loopBonus = Math.min(closedLoops * 0.03, 0.1);

  const firstSegmentBonus = segments[0]?.score > 0.6 ? 0.05 : 0;
  const lastSegmentBonus = segments[segments.length - 1]?.score > 0.6 ? 0.05 : 0;

  const score = avgSegmentScore + interruptBonus + loopBonus + firstSegmentBonus + lastSegmentBonus;

  return Math.round(Math.min(1, score) * 100) / 100;
}

function createEmptyRetentionAnalysis(): RetentionAnalysis {
  return {
    overallScore: 0,
    segments: [],
    patternInterrupts: [],
    openLoops: [],
    weakSpots: [{ timestamp: 0, reason: 'No content to analyze' }],
  };
}
