'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Share2, Download } from 'lucide-react';
import { Background } from '@/app/components/landing';
import {
  AnalysisLoading,
  SummaryCard,
  HookCard,
  RetentionChart,
  StructureMap,
  PersonaProfile,
  PlatformTips,
} from '@/app/components/analysis';
import { Button } from '@/app/components/ui';
import { getAnalysisGrade } from '@/lib/glass-engine';

interface AnalysisData {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
  video: {
    id: string | null;
    url: string | null;
    title: string;
    duration: number;
    thumbnail: string | null;
  };
  transcript: string;
  hook: {
    type: string;
    confidence: number;
    text: string;
    breakdown: string;
    strengths?: string[];
    weaknesses?: string[];
  };
  retention: {
    score: number;
    segments: Array<{
      startTime: number;
      endTime: number;
      score: number;
      label: string;
      signals: string[];
    }>;
    patternInterrupts?: Array<{ timestamp: number; type: string }>;
    openLoops?: Array<{ opened: number; closed: number | null; text: string }>;
    weakSpots?: Array<{ timestamp: number; reason: string }>;
  };
  structure: {
    framework: string;
    confidence: number;
    sections: Array<{
      type: string;
      startTime: number;
      endTime: number;
      text: string;
      confidence: number;
    }>;
    flow?: string;
    recommendations?: string[];
  };
  visual: {
    style: string;
    pattern: {
      facePresence: number;
      textOverlayFrequency: number;
      sceneChangeRate: number;
      brollUsage: number;
      dominantColors: string[];
      editingStyle: string;
    };
    strengths?: string[];
    recommendations?: string[];
  };
  persona: {
    archetype: string;
    confidence: number;
    traits: {
      speakingPace: string;
      wordsPerMinute: number;
      authorityScore: number;
      relatabilityScore: number;
      engagementStyle: string;
      energyLevel: string;
      persuasionType: string;
    };
    voiceDescription?: string;
    recommendations?: string[];
  };
  platformTips: Array<{
    platform: string;
    tips: string[];
    score: number;
  }>;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`/api/analysis/${id}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch analysis');
      }

      setData(result);

      if (result.status === 'PENDING' || result.status === 'PROCESSING') {
        setLoadingStage((prev) => (prev + 1) % 5);
        setTimeout(fetchAnalysis, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (error) {
    return (
      <>
        <Background />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-white">Analysis Failed</h1>
            <p className="text-gray-400">{error}</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!data || data.status === 'PENDING' || data.status === 'PROCESSING') {
    return (
      <>
        <Background />
        <div className="min-h-screen">
          <AnalysisLoading stage={loadingStage} />
        </div>
      </>
    );
  }

  if (data.status === 'FAILED') {
    return (
      <>
        <Background />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-white">Analysis Failed</h1>
            <p className="text-gray-400">{data.error || 'An error occurred during analysis'}</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  const overallScore =
    (data.hook.confidence +
      data.retention.score +
      data.structure.confidence +
      data.persona.confidence) /
    4;

  const { grade, label } = getAnalysisGrade(overallScore);

  const strengths: string[] = [];
  const improvements: string[] = [];
  const quickWins: string[] = [];

  if (data.hook.confidence > 0.7) {
    strengths.push(`Strong ${data.hook.type} hook`);
  } else {
    improvements.push('Hook could be stronger');
    quickWins.push('Try a more provocative opening');
  }

  if (data.retention.score > 0.6) {
    strengths.push('Good retention mechanics');
  } else {
    improvements.push('Retention needs improvement');
    quickWins.push('Add pattern interrupts every 60s');
  }

  if (data.structure.confidence > 0.6) {
    strengths.push(`Clear ${data.structure.framework} structure`);
  } else {
    improvements.push('Structure could be clearer');
    quickWins.push('Organize into Hook → Value → CTA');
  }

  if (data.persona.confidence > 0.7) {
    strengths.push(`Distinct ${data.persona.archetype} voice`);
  }

  return (
    <>
      <Background />
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.header
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              New Analysis
            </button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => fetchAnalysis()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.header>

          <SummaryCard
            overallScore={overallScore}
            grade={grade}
            label={label}
            strengths={strengths}
            improvements={improvements}
            quickWins={quickWins}
            videoTitle={data.video.title}
            hookType={data.hook.type}
            framework={data.structure.framework}
            archetype={data.persona.archetype}
          />

          <div className="grid lg:grid-cols-2 gap-6">
            <HookCard
              type={data.hook.type}
              confidence={data.hook.confidence}
              text={data.hook.text}
              breakdown={data.hook.breakdown}
              strengths={data.hook.strengths || []}
              weaknesses={data.hook.weaknesses || []}
            />

            <RetentionChart
              overallScore={data.retention.score}
              segments={data.retention.segments}
              patternInterrupts={data.retention.patternInterrupts || []}
              weakSpots={data.retention.weakSpots || []}
            />

            <StructureMap
              framework={data.structure.framework}
              frameworkConfidence={data.structure.confidence}
              sections={data.structure.sections}
              flow={data.structure.flow || ''}
              recommendations={data.structure.recommendations || []}
            />

            <PersonaProfile
              archetype={data.persona.archetype}
              confidence={data.persona.confidence}
              traits={data.persona.traits}
              voiceDescription={data.persona.voiceDescription || ''}
              recommendations={data.persona.recommendations || []}
            />
          </div>

          <PlatformTips tips={data.platformTips} duration={data.video.duration} />

          <motion.footer
            className="text-center py-8 text-gray-600 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Analysis powered by Glass Engine™ • NicheHunter AI
          </motion.footer>
        </div>
      </div>
    </>
  );
}
