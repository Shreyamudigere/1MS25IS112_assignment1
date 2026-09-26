import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Download,
  Code2,
  Eye,
  AlertTriangle,
  GitBranch,
  Layers,
} from 'lucide-react';
import { ArchitecturalFlowchart } from '../types/paper';

interface MermaidChartProps {
  flowchart: ArchitecturalFlowchart;
  paperTitle: string;
}

// Initialize mermaid once with custom dark theme settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: 'basis',
  },
  themeVariables: {
    darkmode: true,
    background: '#090d16',
    primaryColor: '#1e293b',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#6366f1',
    lineColor: '#38bdf8',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e1b4b',
  },
});

export const MermaidChart: React.FC<MermaidChartProps> = ({ flowchart, paperTitle }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');
  const [editableCode, setEditableCode] = useState<string>(flowchart.mermaidCode || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'diagram' | 'layers'>('diagram');

  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  // Sync editable code whenever flowchart prop updates
  useEffect(() => {
    if (flowchart.mermaidCode) {
      setEditableCode(flowchart.mermaidCode);
    }
  }, [flowchart.mermaidCode]);

  // Render mermaid SVG
  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      if (!editableCode.trim()) {
        setSvgContent('');
        return;
      }

      try {
        setParseError(null);
        // Ensure clean mermaid code without markdown code fences
        let cleanCode = editableCode
          .replace(/^```(?:mermaid)?/gm, '')
          .replace(/```$/gm, '')
          .trim();

        // Ensure graph TD or flowchart TD header exists
        if (!cleanCode.startsWith('graph ') && !cleanCode.startsWith('flowchart ')) {
          cleanCode = `graph TD\n${cleanCode}`;
        }

        const uniqueId = `mermaid-svg-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, cleanCode);

        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.warn('Mermaid render error:', err);
        if (isMounted) {
          setParseError(err.message || 'Syntax error in Mermaid flowchart definition.');
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [editableCode]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.4));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paperTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_architecture.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-6 transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-slate-950 p-6' : ''
      }`}
    >
      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Step 2
              </span>
              <span className="text-xs text-slate-500">•</span>
              <h3 className="text-base font-bold text-white">
                Architectural Flowchart (Mermaid.js)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Syntactically verified <code className="text-cyan-300">graph TD</code> charting data inputs, model layers, and outputs
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle (Diagram vs Code) */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs">
            <button
              onClick={() => {
                setViewMode('diagram');
                setActiveTab('diagram');
              }}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
                viewMode === 'diagram' && activeTab === 'diagram'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('layers');
              }}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
                activeTab === 'layers'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Components</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
                viewMode === 'code'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Mermaid Code</span>
            </button>
          </div>

          {/* Zoom controls for diagram */}
          {viewMode === 'diagram' && activeTab === 'diagram' && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                onClick={handleZoomOut}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="px-1 text-[10px] font-mono text-slate-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Download SVG */}
          <button
            onClick={handleDownloadSvg}
            disabled={!svgContent}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-300 transition hover:border-slate-700 hover:text-white disabled:opacity-40"
            title="Download diagram as vector SVG"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 text-xs text-slate-300 transition hover:border-slate-700 hover:text-white"
            title="Copy Mermaid.js syntax"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition hover:border-slate-700 hover:text-white"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Diagram'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="mt-4">
        {activeTab === 'layers' ? (
          /* Component breakdown view */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              {/* Data Inputs */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  Data Inputs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {flowchart.dataInputs?.map((inp, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-1 text-xs text-cyan-300 font-mono"
                    >
                      {inp}
                    </span>
                  )) || <span className="text-xs text-slate-500">Standard tensor inputs</span>}
                </div>
              </div>

              {/* Model Layers */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                  Model Layers Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {flowchart.modelLayers?.map((layer, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-indigo-500/20 bg-indigo-950/30 px-2.5 py-1 text-xs text-indigo-300"
                    >
                      {layer}
                    </span>
                  )) || <span className="text-xs text-slate-500">Backbone representation layers</span>}
                </div>
              </div>

              {/* Data Outputs */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  Data Outputs & Objectives
                </h4>
                <div className="flex flex-wrap gap-2">
                  {flowchart.dataOutputs?.map((out, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-1 text-xs text-emerald-300 font-mono"
                    >
                      {out}
                    </span>
                  )) || <span className="text-xs text-slate-500">Output predictions and embeddings</span>}
                </div>
              </div>
            </div>

            {/* Components & Roles Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Key Architectural Components
              </h4>
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {flowchart.components && flowchart.components.length > 0 ? (
                  flowchart.components.map((comp, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5 transition hover:border-slate-700"
                    >
                      <div className="text-xs font-semibold text-white">{comp.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{comp.role}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Refer to the diagram for all component mappings.</p>
                )}
              </div>
            </div>
          </div>
        ) : viewMode === 'diagram' ? (
          /* Diagram render view */
          <div
            ref={containerRef}
            className="relative min-h-[380px] w-full overflow-hidden rounded-xl border border-slate-800/90 bg-gradient-to-b from-slate-950 via-[#070b13] to-slate-950 p-4 flex items-center justify-center"
          >
            {/* Background grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {parseError ? (
              <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
                <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
                <h4 className="text-sm font-semibold text-slate-200">
                  Flowchart Syntax Recovery
                </h4>
                <p className="text-xs text-slate-400 mt-1 mb-3">
                  {parseError}
                </p>
                <button
                  onClick={() => setViewMode('code')}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                >
                  Edit Mermaid Code Manually
                </button>
              </div>
            ) : svgContent ? (
              <div
                className="w-full overflow-auto flex justify-center py-4 transition-transform duration-150"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mb-2" />
                <p className="text-xs">Generating architectural diagram...</p>
              </div>
            )}

            {/* Prompt Requirement Indicator Badge */}
            <div className="absolute bottom-2 left-2 rounded-md bg-slate-900/90 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
              [FLOWCHART] Validated graph TD
            </div>
          </div>
        ) : (
          /* Live code editor view */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-cyan-400">[FLOWCHART] Syntax</span>
              <span>Edit live to update the diagram in real time</span>
            </div>
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              rows={12}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-cyan-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="graph TD..."
            />
          </div>
        )}
      </div>
    </div>
  );
};
