import React from 'react';
import { Sparkles, Terminal, FileCode2, Cpu, ShieldCheck } from 'lucide-react';
import { TokenMetrics } from '../types/paper';

interface HeaderProps {
  tokenMetrics?: TokenMetrics;
  onOpenRawOutput: () => void;
  onOpenAdvisorChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tokenMetrics,
  onOpenRawOutput,
  onOpenAdvisorChat,
}) => {
  const totalTokens = tokenMetrics?.totalTokens || 0;
  const budget = tokenMetrics?.tokenBudget || 25000;
  const percentUsed = Number(((totalTokens / budget) * 100).toFixed(1));

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                CS Research Agent
              </h1>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-400 uppercase">
                v2.4 Agent
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Academic Paper Parser • Architecture Flowcharts • Student Resume Opportunities
            </p>
          </div>
        </div>

        {/* Right Actions & Token Budget Monitor */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Token Constraint Badge */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] leading-tight text-slate-400">
                Token Constraint: &lt; 25k
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {totalTokens > 0 ? `${totalTokens.toLocaleString()} tokens (${percentUsed}%)` : 'Ready • Efficient'}
              </span>
            </div>
          </div>

          {/* Quick Raw Prompt Output Modal Trigger */}
          <button
            onClick={onOpenRawOutput}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
            title="View Raw Formatted Agent Output (with [FLOWCHART])"
          >
            <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Raw Output</span>
          </button>

          {/* Student Advisor Chat Trigger */}
          <button
            onClick={onOpenAdvisorChat}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-cyan-500"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Research Mentor</span>
          </button>
        </div>
      </div>
    </header>
  );
};
