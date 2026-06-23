import React from 'react';
import {
  Layers,
  Terminal,
  Code,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ExternalLink,
  Search,
  Copy,
  Check
} from 'lucide-react';
import CodeBlock from './CodeBlock';
import ComplexityGauge from './ComplexityGauge';
import { STL_CONTAINER_DIRECTORY } from '../data/stlDirectory';

export default function CoreConcepts({
  activeTag,
  activeTemplateIndex,
  setActiveTemplateIndex,
  selectedStlContainer,
  setSelectedStlContainer,
  stlSearchQuery,
  setStlSearchQuery,
  copiedMethodName,
  handleCopyMethod,
  getTagKeywords,
  getEdgeCases,
  getStlCheatSheet
}) {
  if (!activeTag) return null;

  const stlInfo = getStlCheatSheet(activeTag.tagId);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* 1. Identification Rules & Complexity Dials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Rules & Tag Cloud Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-purple-300 flex items-center gap-2 font-mono border-b border-purple-950/30 pb-2">
            <Layers size={16} className="text-purple-400" />
            IDENTIFICATION RULES & TRIGGERS
          </h3>

          {/* Keywords Tag Cloud */}
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-2">Core Keyword Triggers</span>
            <div className="flex flex-wrap gap-2 mb-4">
              {getTagKeywords(activeTag.tagId).map((keyword, kidx) => (
                <span key={kidx} className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider font-mono bg-cyan-955/40 border border-cyan-800/30 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.1)] hover:border-cyan-400 transition-colors">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Rules Card Capsules */}
          <div className="grid grid-cols-1 gap-3">
            {activeTag.identificationRules.map((rule, idx) => {
              const words = rule.split(' ');
              const highlightedRule = words.map((word, wIdx) => {
                const cleanWord = word.replace(/[^a-zA-Z-]/g, '').toLowerCase();
                const keywords = getTagKeywords(activeTag.tagId);
                const isKeyword = keywords.some(k => k.toLowerCase().includes(cleanWord) || cleanWord.includes(k.toLowerCase())) && cleanWord.length > 3;
                if (isKeyword) {
                  return <strong key={wIdx} className="text-cyan-300 font-semibold underline decoration-cyan-500/30 underline-offset-2">{word} </strong>;
                }
                return word + ' ';
              });
              return (
                <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-purple-950/10 border-l-2 border-purple-500/50 hover:bg-purple-950/20 transition-colors">
                  <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">{highlightedRule}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complexity Gauges Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2 font-mono border-b border-purple-950/30 pb-2">
              <Terminal size={16} className="text-cyan-400" />
              COMPLEXITY METRICS GAUGE
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <ComplexityGauge title="Time Complexity" complexityStr={activeTag.complexityBenchmarks.time} />
              <ComplexityGauge title="Space Complexity" complexityStr={activeTag.complexityBenchmarks.space} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-950/20 text-xs text-slate-400 leading-relaxed flex items-start gap-2 bg-purple-950/10 p-2.5 rounded-xl">
            <Clock size={14} className="text-purple-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <span>
              <strong className="text-slate-300">Target Note:</strong> {activeTag.complexityBenchmarks.note}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Generalized C++ Templates Switcher & STL Directory */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Code Templates Selector */}
        <div className="glass-card rounded-2xl p-6 xl:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="space-y-4 w-full">
            <h3 className="text-base font-bold text-slate-300 flex items-center gap-2 font-mono border-b border-purple-950/30 pb-2">
              <Code size={18} className="text-purple-400" />
              C++ PATTERN TEMPLATES
            </h3>

            {activeTag.generalTemplates && activeTag.generalTemplates.length > 0 ? (
              <div className="space-y-4">
                {/* Template Tab Header */}
                <div className="flex border-b border-purple-950/30 overflow-x-auto sidebar-scrollbar">
                  {activeTag.generalTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTemplateIndex(idx)}
                      className={`px-4 py-2 text-xs md:text-sm font-bold font-mono border-b-2 transition-all relative cursor-pointer whitespace-nowrap ${
                        activeTemplateIndex === idx
                          ? 'border-purple-500 text-white bg-purple-950/20'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-purple-950/10'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>

                {/* Template Body */}
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-sans">
                    {activeTag.generalTemplates[activeTemplateIndex]?.description}
                  </p>
                  <CodeBlock code={activeTag.generalTemplates[activeTemplateIndex]?.code || ''} />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">No templates available for this tag.</p>
            )}
          </div>
        </div>

        {/* C++ STL Container Reference Finder */}
        <div className="glass-card rounded-2xl p-6 xl:col-span-2 flex flex-col justify-between space-y-4">
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-purple-950/30 pb-2">
              <h3 className="text-base font-bold text-slate-300 flex items-center gap-2 font-mono">
                <BookOpen size={18} className="text-cyan-400" />
                C++ STL CONTAINER DIRECTORY
              </h3>
              {STL_CONTAINER_DIRECTORY[selectedStlContainer] && (
                <a
                  href={STL_CONTAINER_DIRECTORY[selectedStlContainer].docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-all duration-200"
                >
                  Docs <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Dropdown Container Selector + Search Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Select Container</label>
                <select
                  value={selectedStlContainer}
                  onChange={(e) => {
                    setSelectedStlContainer(e.target.value);
                    setStlSearchQuery('');
                  }}
                  className="bg-[#0f0a1d] border border-purple-900/40 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {Object.keys(STL_CONTAINER_DIRECTORY).map((key) => (
                    <option key={key} value={key}>
                      {STL_CONTAINER_DIRECTORY[key].name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Search Operations</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. push, find, size..."
                    value={stlSearchQuery}
                    onChange={(e) => setStlSearchQuery(e.target.value)}
                    className="w-full bg-[#0f0a1d] border border-purple-900/40 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                  />
                  <Search size={12} className="absolute left-2.5 top-3 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Selected Container Overview */}
            {STL_CONTAINER_DIRECTORY[selectedStlContainer] && (() => {
              const containerData = STL_CONTAINER_DIRECTORY[selectedStlContainer];
              const filteredMethods = containerData.methods.filter(
                method =>
                  method.name.toLowerCase().includes(stlSearchQuery.toLowerCase()) ||
                  method.desc.toLowerCase().includes(stlSearchQuery.toLowerCase()) ||
                  method.syntax.toLowerCase().includes(stlSearchQuery.toLowerCase())
              );

              return (
                <div className="flex-1 flex flex-col justify-between mt-3 space-y-3">
                  <div className="space-y-2">
                    {/* Header info */}
                    <div className="flex items-center justify-between text-xs font-mono bg-[#0c0818] border border-purple-950/40 p-2.5 rounded-lg">
                      <span className="text-pink-400 font-bold">{containerData.header}</span>
                      <span className="text-[10px] text-slate-500">{containerData.spaceComplexity}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans italic bg-purple-950/5 p-2.5 rounded-lg border border-purple-900/10">
                      {containerData.desc}
                    </p>

                    <div className="text-[10px] font-mono text-amber-400 bg-amber-950/10 px-2.5 py-1.5 rounded-md border border-amber-900/20">
                      <span className="font-bold uppercase tracking-wider text-[9px] block text-amber-500/80 mb-0.5">Big-O Complexities</span>
                      {containerData.timeComplexity}
                    </div>
                  </div>

                  {/* Scrollable method list */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">Container Methods ({filteredMethods.length})</span>
                    <div className="min-h-[220px] max-h-[280px] overflow-y-auto sidebar-scrollbar space-y-2 pr-1 flex-1">
                      {filteredMethods.length > 0 ? (
                        filteredMethods.map((method, idx) => {
                          const isCopied = copiedMethodName === `${selectedStlContainer}_${method.name}`;
                          return (
                            <div key={idx} className="group/item flex flex-col p-2.5 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 space-y-1.5 transition-all duration-150 text-left">
                              <div className="flex justify-between items-start">
                                <span className="font-mono text-cyan-400 text-xs font-semibold">{method.name}</span>
                                <span className="font-mono text-[10px] text-purple-400">{method.complexity}</span>
                              </div>
                              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">{method.desc}</p>

                              {/* Code snippet with copy button */}
                              <div className="flex items-center justify-between bg-[#0f0a1d] rounded border border-purple-950/50 p-2 text-left relative overflow-hidden group-hover/item:border-purple-900/40">
                                <pre className="font-mono text-[10px] text-cyan-300 overflow-x-auto whitespace-pre pr-6 select-all flex-1">
                                  {method.syntax}
                                </pre>
                                <button
                                  onClick={() => handleCopyMethod(method.syntax, `${selectedStlContainer}_${method.name}`)}
                                  className={`absolute right-1 top-1 p-1 rounded transition-all duration-200 cursor-pointer ${
                                    isCopied
                                      ? 'text-emerald-400 bg-emerald-500/10'
                                      : 'text-slate-500 hover:text-white hover:bg-purple-950/40 opacity-0 group-hover/item:opacity-100'
                                  }`}
                                  title="Copy snippet"
                                >
                                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-slate-600 text-xs font-mono border border-dashed border-purple-950/30 rounded-lg">
                          No matching container methods found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 3. STL Cheat Sheet & Common Edge Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* STL Cheat Sheet Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-purple-950/30 pb-2">
              <h3 className="text-base font-bold text-purple-300 flex items-center gap-2 font-mono">
                <Zap size={16} className="text-purple-400" />
                C++ STL CONTAINER SYNTAX
              </h3>
              {stlInfo.docUrl && (
                <a
                  href={stlInfo.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-all duration-200 bg-purple-950/40 hover:bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-900/40 hover:border-cyan-500/30 hover:shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                >
                  Docs <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Container Type</span>
              <div className="text-sm font-bold text-white font-mono mt-1 bg-purple-950/20 p-2.5 rounded-lg border border-purple-900/30">
                {stlInfo.container}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Declaration</span>
              <pre className="text-xs font-mono text-cyan-300 mt-1 bg-[#0f0a1d]/60 p-3 rounded-lg border border-purple-955/45 overflow-x-auto">
                {stlInfo.syntax}
              </pre>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Key Operations</span>
              <div className="grid grid-cols-1 gap-2">
                {stlInfo.methods.map((method, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-950/30 hover:bg-slate-950/50 border border-white/5">
                    <span className="font-mono text-cyan-400 font-semibold">{method.name}</span>
                    <span className="text-slate-400 font-sans text-center max-w-[200px] line-clamp-1">{method.desc}</span>
                    <span className="font-mono text-purple-400 text-right">{method.complexity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-purple-950/20 text-xs text-slate-400 italic mt-4">
            <span className="font-bold text-slate-300 not-italic">Best Practice Tip:</span> {stlInfo.note}
          </div>
        </div>

        {/* Common Edge Cases & Pitfalls Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-rose-300 flex items-center gap-2 font-mono border-b border-purple-950/30 pb-2">
            <AlertTriangle size={16} className="text-rose-400" />
            EDGE CASES & PITFALLS
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Look out for these common bug-traps and edge cases when solving {activeTag.tagName} questions:
          </p>

          <div className="space-y-3.5 mt-2">
            {getEdgeCases(activeTag.tagId).map((item, idx) => (
              <div key={idx} className="bg-rose-955/10 border border-rose-900/20 rounded-xl p-3.5 space-y-1 hover:bg-rose-950/15 transition-all">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <h4 className="text-xs font-bold text-rose-300 font-mono uppercase tracking-wider">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed pl-3.5">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
