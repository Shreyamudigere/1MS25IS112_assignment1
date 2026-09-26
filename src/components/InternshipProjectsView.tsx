import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  Wrench,
  CheckCircle,
  Copy,
  Check,
  Calendar,
  Sparkles,
  GitFork,
  Award,
  ChevronRight,
} from 'lucide-react';
import { InternshipOpportunity } from '../types/paper';

interface InternshipProjectsViewProps {
  opportunities: InternshipOpportunity[];
  paperTitle: string;
}

export const InternshipProjectsView: React.FC<InternshipProjectsViewProps> = ({
  opportunities,
  paperTitle,
}) => {
  const [copiedBulletId, setCopiedBulletId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(opportunities[0]?.id || 1);

  const handleCopyBullet = (id: number, bulletText: string) => {
    navigator.clipboard.writeText(bulletText);
    setCopiedBulletId(id);
    setTimeout(() => setCopiedBulletId(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Step 3
              </span>
              <span className="text-xs text-slate-500">•</span>
              <h3 className="text-base font-bold text-white">
                Future Work & Internship Resume Projects
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              3 concrete, realistic extensions for a 3rd-year CS student to build and feature on their resume
            </p>
          </div>
        </div>

        <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
          3 Tailored Proposals
        </span>
      </div>

      {/* Projects Grid */}
      <div className="mt-5 space-y-4">
        {opportunities.map((opp, index) => {
          const isExpanded = expandedId === opp.id;
          const defaultBullet =
            opp.resumeBullet ||
            `Engineered ${opp.extension.toLowerCase()} utilizing ${opp.techStack.join(', ')}, achieving ${opp.targetMetric.toLowerCase()}.`;

          return (
            <div
              key={opp.id || index}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-indigo-500/60 bg-slate-950/80 shadow-lg shadow-indigo-500/5'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              {/* Card Title Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                className="flex cursor-pointer items-start justify-between gap-4 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white hover:text-cyan-400 transition">
                        {opp.title}
                      </h4>
                      {opp.difficulty && (
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                          {opp.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                      {opp.extension}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ChevronRight
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-90 text-indigo-400' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 px-4 pb-5 pt-3 space-y-4">
                  {/* Required Parameters Grid */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* The Exact Extension */}
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>The Exact Extension</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {opp.extension}
                      </p>
                    </div>

                    {/* Targeted Performance Metric */}
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1.5">
                        <Award className="h-3.5 w-3.5" />
                        <span>Targeted Performance Metric</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-mono">
                        {opp.targetMetric}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Tech Stack */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-2">
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Recommended Tech Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {opp.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded-md border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-xs font-mono font-medium text-slate-200 shadow-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Milestone Plan */}
                  {opp.weeklyMilestones && opp.weeklyMilestones.length > 0 && (
                    <div className="rounded-lg border border-slate-800/90 bg-slate-900/40 p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>4-Week Student Implementation Roadmap</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {opp.weeklyMilestones.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="flex items-start gap-2 rounded-md bg-slate-950/60 p-2 text-xs text-slate-300 border border-slate-850"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume STAR Bullet Generator */}
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Ready-To-Use Resume STAR Bullet</span>
                      </div>
                      <button
                        onClick={() => handleCopyBullet(opp.id, defaultBullet)}
                        className="flex items-center gap-1 rounded bg-indigo-600/30 px-2 py-0.5 text-[11px] font-medium text-indigo-200 hover:bg-indigo-600/50 transition"
                      >
                        {copiedBulletId === opp.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-300">Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy for CV / LinkedIn</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                      • {defaultBullet}
                    </p>
                  </div>

                  {/* Recommended Starter Repo */}
                  {opp.recommendedStarterRepo && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                      <GitFork className="h-3.5 w-3.5 text-slate-400" />
                      <span>Recommended starter repo:</span>
                      <code className="text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {opp.recommendedStarterRepo}
                      </code>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
