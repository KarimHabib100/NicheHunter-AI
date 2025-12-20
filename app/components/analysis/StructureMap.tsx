'use client';

import { motion } from 'framer-motion';
import { Layers, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface StructureSection {
  type: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

interface StructureMapProps {
  framework: string;
  frameworkConfidence: number;
  sections: StructureSection[];
  flow: string;
  recommendations: string[];
}

const sectionColors: Record<string, string> = {
  hook: 'bg-cyan-500',
  problem: 'bg-red-500',
  agitation: 'bg-orange-500',
  solution: 'bg-green-500',
  proof: 'bg-blue-500',
  cta: 'bg-purple-500',
};

const sectionLabels: Record<string, string> = {
  hook: 'Hook',
  problem: 'Problem',
  agitation: 'Agitation',
  solution: 'Solution',
  proof: 'Proof',
  cta: 'CTA',
};

const frameworkLabels: Record<string, string> = {
  pas: 'Problem-Agitate-Solution',
  aida: 'AIDA',
  'hook-value-cta': 'Hook-Value-CTA',
  'story-lesson': 'Story-Lesson',
  'problem-solution': 'Problem-Solution',
  unknown: 'Custom Structure',
};

export function StructureMap({
  framework,
  frameworkConfidence,
  sections,
  flow,
  recommendations,
}: StructureMapProps) {
  const confidencePercent = Math.round(frameworkConfidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card variant="hover" className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Layers className="w-5 h-5 text-purple-500" />
              </div>
              <CardTitle>Script Structure</CardTitle>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-400">{confidencePercent}%</span>
              <p className="text-xs text-gray-500">confidence</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
              <span className="text-purple-400 font-medium text-sm">
                {frameworkLabels[framework] || framework}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Detected Sections</p>
            <div className="flex gap-1 h-8 bg-surface-light rounded-lg overflow-hidden">
              {sections.map((section, i) => (
                <motion.div
                  key={i}
                  className={`${sectionColors[section.type] || 'bg-gray-500'} relative group flex items-center justify-center`}
                  style={{ flex: section.endTime - section.startTime }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span className="text-[10px] font-medium text-white/80 truncate px-1">
                    {sectionLabels[section.type] || section.type}
                  </span>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                    {sectionLabels[section.type]}: {Math.round(section.confidence * 100)}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sections.map((section, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-gray-400"
              >
                <div className={`w-2 h-2 rounded-full ${sectionColors[section.type] || 'bg-gray-500'}`} />
                {sectionLabels[section.type] || section.type}
              </div>
            ))}
          </div>

          {recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-purple-500" />
                Recommendations
              </p>
              <ul className="space-y-1">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
