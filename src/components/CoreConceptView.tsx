import React, { useState } from 'react';
import { Target, Layers, Binary, Check, Copy, Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';
import { CoreConcept, PaperMetadata } from '../types/paper';

interface CoreConceptViewProps {
  coreConcept: CoreConcept;
  paper: PaperMetadata;
}

export const CoreConceptView: React.FC<CoreConceptViewProps> = ({ coreConcept, paper }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'full'>('structured');

  const wordCount = coreConcept.wordCount || coreConcept.fullSummary.split(/\s+/).filter(Boolean).length;
  const isUnder300 = wordCount <= 300;

  const handleCopy = () => {
    navigator.clipboard.writeText(coreConcept.fullSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(coreConcept.fullSummary);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Step 1
              </span>
              <span className="text-xs text-slate-500">•</span>
              <h3 className="text-base font-bold text-white">
                Core Concept Extraction
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Plain, accessible language summary under 300 words
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Word Count Indicator Badge */}
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
              isUnder300
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400'
                : 'border-amber-500/30 bg-amber-950/40 text-amber-400'
            }`}
          >
            {wordCount} words {isUnder300 ? '(&lt; 300 target met ✓)' : '(exceeds 300)'}
          </span>

          {/* Structured vs Full toggle */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('structured')}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                viewMode === 'structured'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Structured
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                viewMode === 'full'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Text
            </button>
          </div>

          {/* Audio Listen */}
          {'speechSynthesis' in window && (
            <button
              onClick={handleSpeak}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                isSpeaking
                  ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              title={isSpeaking ? 'Stop Audio' : 'Listen to Core Concept'}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
            title="Copy summary"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Content presentation */}
      {viewMode === 'structured' ? (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Problem Statement Card */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4 transition hover:border-rose-500/30">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/20 text-rose-400">
                <Target className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Problem Statement
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {coreConcept.problemStatement || 'Identifies critical computational bottlenecks in prior sequence models.'}
            </p>
          </div>

          {/* Primary Methodology Card */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-4 transition hover:border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Primary Methodology
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {coreConcept.primaryMethodology || 'Introduces a novel architectural mechanism.'}
            </p>
          </div>

          {/* Mathematical / Algorithmic Breakthroughs Card */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-4 transition hover:border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400">
                <Binary className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Key Breakthroughs & Math
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {coreConcept.mathematicalBreakthroughs || 'Key algorithmic formulations and GPU memory optimizations.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm leading-relaxed text-slate-200 font-sans whitespace-pre-line">
            {coreConcept.fullSummary}
          </p>
        </div>
      )}

      {/* Synthesis Footer Highlight */}
      {viewMode === 'structured' && coreConcept.fullSummary && (
        <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs italic text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Agent Synthesis:</span> {coreConcept.fullSummary}
          </p>
        </div>
      )}
    </div>
  );
};
