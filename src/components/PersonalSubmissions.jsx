import React from 'react';
import {
  Search,
  ChevronDown,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Code,
  Activity,
  Plus,
  X
} from 'lucide-react';
import CodeBlock from './CodeBlock';

export default function PersonalSubmissions({
  activeTag,
  submissionSearchQuery,
  setSubmissionSearchQuery,
  difficultyFilter,
  setDifficultyFilter,
  setVisibleQuestionsCount,
  activeTagDifficultyStats,
  filteredSolvedQuestions,
  visibleQuestionsCount,
  expandedSolutionId,
  handleToggleSolution,
  expandedSubTabs,
  setExpandedSubTabs,
  problemDetailsCache,
  dryRunState,
  setDryRunState,
  getDifficultyStyles,
  getTagStats,
  getDryRunTrace,
  getSlugFromUrl
}) {
  if (!activeTag) return null;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Search Bar + Difficulty Filter Pills Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${getTagStats(activeTag).userSolvedCount} solved ${activeTag.tagName} questions...`}
            value={submissionSearchQuery}
            onChange={(e) => setSubmissionSearchQuery(e.target.value)}
            className="w-full bg-purple-950/20 border border-purple-900/40 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all font-sans"
          />
        </div>

        {/* Difficulty Filter Pills */}
        <div className="flex gap-1.5 items-center">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
            const count = diff === 'All' ? activeTagDifficultyStats.Total : activeTagDifficultyStats[diff];
            const isActive = difficultyFilter === diff;
            const pillColors = {
              All: isActive ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-slate-700/50 text-slate-400 hover:border-purple-500/30',
              Easy: isActive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'border-slate-700/50 text-slate-400 hover:border-emerald-500/30',
              Medium: isActive ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'border-slate-700/50 text-slate-400 hover:border-amber-500/30',
              Hard: isActive ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'border-slate-700/50 text-slate-400 hover:border-rose-500/30',
            };
            return (
              <button
                key={diff}
                onClick={() => { setDifficultyFilter(diff); setVisibleQuestionsCount(15); }}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${pillColors[diff]}`}
              >
                {diff} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Difficulty Stats Summary Bar */}
      <div className="glass-card rounded-xl p-3 flex items-center gap-4">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Tag Breakdown:</span>
        <div className="flex-1 flex items-center gap-1.5 h-2 rounded-full overflow-hidden bg-slate-800">
          {activeTagDifficultyStats.Total > 0 && (
            <>
              <div
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                style={{ width: `${(activeTagDifficultyStats.Easy / activeTagDifficultyStats.Total) * 100}%` }}
              ></div>
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${(activeTagDifficultyStats.Medium / activeTagDifficultyStats.Total) * 100}%` }}
              ></div>
              <div
                className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                style={{ width: `${(activeTagDifficultyStats.Hard / activeTagDifficultyStats.Total) * 100}%` }}
              ></div>
            </>
          )}
        </div>
        <div className="flex gap-3 text-[10px] font-mono">
          <span className="text-emerald-400">{activeTagDifficultyStats.Easy} Easy</span>
          <span className="text-amber-400">{activeTagDifficultyStats.Medium} Med</span>
          <span className="text-rose-400">{activeTagDifficultyStats.Hard} Hard</span>
        </div>
      </div>

      {/* Header info */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-mono uppercase">
        <span>Solved Problems ({getTagStats(activeTag).userSolvedCount})</span>
        <span>Showing ({Math.min(visibleQuestionsCount, filteredSolvedQuestions.length)} of {filteredSolvedQuestions.length})</span>
      </div>

      {/* Submissions Feed — paginated */}
      <div className="space-y-3">
        {filteredSolvedQuestions.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-slate-500 text-sm space-y-3">
            {submissionSearchQuery.trim() || difficultyFilter !== 'All' ? (
              <p>No solved questions found matching your filters.</p>
            ) : (
              <>
                <p>You have solved <strong className="text-slate-300 font-mono">{getTagStats(activeTag).userSolvedCount}</strong> problems under this tag on LeetCode.</p>
                <p className="text-xs text-slate-500">Solve some questions on LeetCode, sync your profile, and they will appear here!</p>
              </>
            )}
          </div>
        ) : (
          filteredSolvedQuestions.slice(0, visibleQuestionsCount).map((solution) => {
            const isExpanded = expandedSolutionId === solution.problemId;
            const difficultyStyle = getDifficultyStyles(solution.difficulty);
            const currentSubTab = expandedSubTabs[solution.problemId] || 'description';

            return (
              <div
                key={solution.problemId}
                className={`glass-card rounded-2xl transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? 'ring-1 ring-purple-500/30 shadow-lg shadow-purple-950/20'
                    : 'glass-card-hover'
                }`}
              >

                {/* Problem card Header (clickable) */}
                <div
                  onClick={() => handleToggleSolution(solution.problemId, solution.titleSlug || getSlugFromUrl(solution.leetcodeUrl))}
                  className="p-4.5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="font-mono text-xs text-slate-500 font-semibold">
                      #{solution.problemId}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 hover:text-purple-300 transition-colors">
                      {solution.title}
                    </h4>

                    {/* Difficulty Badge */}
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${difficultyStyle}`}>
                      {solution.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* External Leetcode link */}
                    <a
                      href={solution.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-purple-950/30 border border-purple-900/30 text-slate-400 hover:text-cyan-400 hover:bg-purple-900/20 hover:border-cyan-500/30 transition-all duration-200"
                      title="Open on LeetCode"
                    >
                      <ArrowUpRight size={14} />
                    </a>

                    {/* Accordion Arrow */}
                    <div className={`p-1 text-slate-400 hover:text-slate-200 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-purple-400' : ''}`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Expanded Content Block — IDE Sub-Tabs */}
                {isExpanded && (() => {
                  const cache = problemDetailsCache[solution.problemId];
                  const defaultSlug = solution.titleSlug || getSlugFromUrl(solution.leetcodeUrl);

                  if (cache?.loading) {
                    return (
                      <div className="px-5 pb-5 border-t border-purple-950/30 bg-[#0d0918]/60 py-6 text-center text-xs text-slate-500 font-mono space-y-2 flex flex-col items-center justify-center">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing question description and C++ solution from LeetCode...</span>
                      </div>
                    );
                  }

                  const codeToDisplay = cache?.code || solution.code;
                  const logicToDisplay = cache?.logic || solution.logic;
                  const questionHtml = cache?.questionHtml;
                  const similarQuestions = cache?.similarQuestions || [];
                  const dryRun = dryRunState[solution.problemId];

                  return (
                    <div className="border-t border-purple-950/30 bg-[#0d0918]/60 animate-slide-down">

                      {/* IDE Sub-Tab Bar */}
                      <div className="flex border-b border-purple-950/30 px-3 bg-[#0c0818]/80 overflow-x-auto sidebar-scrollbar">
                        {[
                          { key: 'description', icon: <BookOpen size={12} />, label: 'Problem Description' },
                          { key: 'walkthrough', icon: <Sparkles size={12} />, label: 'Walkthrough & Complexity' },
                          { key: 'code', icon: <Code size={12} />, label: 'C++ Code' }
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setExpandedSubTabs(prev => ({ ...prev, [solution.problemId]: tab.key }))}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] md:text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                              currentSubTab === tab.key
                                ? 'border-purple-500 text-white bg-purple-950/20'
                                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-purple-950/10'
                            }`}
                          >
                            {tab.icon}
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Sub-Tab Content */}
                      <div className="px-5 py-4 space-y-4 max-h-[400px] overflow-y-auto sidebar-scrollbar">

                        {/* Description Sub-Tab */}
                        {currentSubTab === 'description' && (
                          <div className="space-y-4">
                            {questionHtml ? (
                              <div
                                className="bg-[#0f0a1d]/40 border border-purple-950/35 rounded-xl p-4 text-xs md:text-sm text-slate-300 leading-relaxed font-sans overflow-y-auto sidebar-scrollbar leetcode-description-html"
                                dangerouslySetInnerHTML={{ __html: questionHtml }}
                              />
                            ) : (
                              <div className="text-xs text-slate-500 font-mono text-center py-6">
                                Problem description not available. Click "Open on LeetCode" to view the full problem.
                              </div>
                            )}

                            {/* Similar Questions Cross-Links */}
                            {similarQuestions.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-purple-950/20">
                                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Similar Questions</span>
                                <div className="flex flex-wrap gap-2">
                                  {similarQuestions.slice(0, 8).map((sq, sqIdx) => (
                                    <a
                                      key={sqIdx}
                                      href={`https://leetcode.com/problems/${sq.titleSlug}/`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-semibold border transition-all hover:scale-105 ${
                                        sq.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-400/50' :
                                        sq.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-400/50' :
                                        sq.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:border-rose-400/50' :
                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                      }`}
                                    >
                                      {sq.title}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Walkthrough Sub-Tab */}
                        {currentSubTab === 'walkthrough' && (
                          <div className="space-y-4">
                            <div className="bg-[#0f0a1d]/75 border border-purple-950/50 rounded-xl p-4 text-xs md:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                              {logicToDisplay}
                            </div>

                            {/* Dry Run Trace Simulation */}
                            <div className="space-y-3 pt-2 border-t border-purple-950/20">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                                  <Activity size={12} className="text-cyan-400" />
                                  Dry Run Trace
                                </span>
                                <div className="flex items-center gap-2">
                                  {dryRun && (
                                    <button
                                      onClick={() => {
                                        setDryRunState(prev => {
                                          const next = { ...prev };
                                          delete next[solution.problemId];
                                          return next;
                                        });
                                      }}
                                      className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold uppercase hover:bg-rose-500/20 transition-all cursor-pointer"
                                    >
                                      ✕ Close
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      const trace = getDryRunTrace(solution.problemId, solution.title);
                                      setDryRunState(prev => ({
                                        ...prev,
                                        [solution.problemId]: { running: true, step: 0, logs: [] }
                                      }));
                                      // Animate steps one by one
                                      trace.steps.forEach((step, i) => {
                                        setTimeout(() => {
                                          setDryRunState(prev => {
                                            if (!prev[solution.problemId]) {
                                              return prev;
                                            }
                                            return {
                                              ...prev,
                                              [solution.problemId]: {
                                                ...prev[solution.problemId],
                                                step: i + 1,
                                                logs: [...(prev[solution.problemId]?.logs || []), step],
                                                running: i < trace.steps.length - 1,
                                                input: trace.input
                                              }
                                            };
                                          });
                                        }, (i + 1) * 600);
                                      });
                                    }}
                                    className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold uppercase hover:bg-cyan-500/20 transition-all cursor-pointer"
                                  >
                                    {dryRun?.running ? '⏳ Running...' : '▶ Run Trace'}
                                  </button>
                                </div>
                              </div>

                              {dryRun && dryRun.logs && dryRun.logs.length > 0 && (
                                <div className="bg-[#0c0818] border border-cyan-900/30 rounded-xl p-3 space-y-2 font-mono text-[11px] dry-run-console relative">
                                  {/* Close button top right of console */}
                                  <button
                                    onClick={() => {
                                      setDryRunState(prev => {
                                        const next = { ...prev };
                                        delete next[solution.problemId];
                                        return next;
                                      });
                                    }}
                                    className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800/50 cursor-pointer transition-all"
                                    title="Close Console"
                                  >
                                    <X size={14} />
                                  </button>
                                  <div className="text-cyan-400 text-[10px] pb-1 border-b border-cyan-900/20 pr-6">
                                    Input: <span className="text-slate-300">{dryRun.input}</span>
                                  </div>
                                  {dryRun.logs.map((log, lIdx) => (
                                    <div key={lIdx} className="flex gap-2 items-start animate-fade-in">
                                      <span className="text-purple-500 font-bold w-4 text-right flex-shrink-0">{lIdx + 1}.</span>
                                      <span className={`text-slate-300 ${lIdx === dryRun.logs.length - 1 && !dryRun.running ? 'text-emerald-400 font-bold' : ''}`}>
                                        {log}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Code Sub-Tab */}
                        {currentSubTab === 'code' && (
                          <div className="space-y-2">
                            <CodeBlock code={codeToDisplay} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })
        )}
      </div>

      {/* Show More Pagination Button */}
      {filteredSolvedQuestions.length > visibleQuestionsCount && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleQuestionsCount(prev => prev + 15)}
            className="px-6 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono uppercase tracking-wider hover:bg-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={14} />
            Show More ({filteredSolvedQuestions.length - visibleQuestionsCount} remaining)
          </button>
        </div>
      )}

    </div>
  );
}
