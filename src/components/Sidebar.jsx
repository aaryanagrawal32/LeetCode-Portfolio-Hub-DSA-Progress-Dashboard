import React from 'react';
import { 
  Layers, 
  X, 
  Award, 
  Search 
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeTagId,
  setActiveTagId,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  sidebarCollapsed,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredTags,
  getTagStats,
  setExpandedSolutionId
}) {
  return (
    <aside className={`
      inset-y-0 left-0 border-r border-purple-950/30 bg-[#0c0818]/95 lg:bg-[#0c0818]/65
      flex-col transform transition-all duration-300 ease-in-out
      ${mobileSidebarOpen 
        ? 'flex fixed top-0 bottom-0 z-50 w-72 translate-x-0' 
        : sidebarCollapsed 
          ? 'hidden lg:hidden lg:w-0 lg:border-r-0' 
          : 'hidden lg:flex lg:relative lg:transform-none lg:z-auto lg:w-80 lg:translate-x-0'
      }
    `}>
      {/* Mobile Sidebar Header */}
      <div className="flex lg:hidden items-center justify-between px-4 py-3.5 border-b border-purple-950/30 bg-[#0e0a1b]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm text-white font-sans">Menu</span>
        </div>
        <button 
          onClick={() => setMobileSidebarOpen(false)}
          className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-900/30 text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Sticky wrapper inside sidebar to support independent scrollbar while page scrolls */}
      <div className="flex flex-col w-full flex-1 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] overflow-hidden">
        
        {/* Profile Dashboard Sidebar Button (Fixed at the top) */}
        <div className="p-4 pb-2 border-b border-purple-950/30 bg-purple-950/5">
          <button
            onClick={() => {
              setActiveTab('profile');
              setActiveTagId(null); // No active tag when viewing profile
              setMobileSidebarOpen(false); // Close mobile drawer
            }}
            className={`w-full text-left rounded-xl p-3 px-3.5 border transition-all duration-300 cursor-pointer flex items-center gap-3.5 relative overflow-hidden group ${
              activeTab === 'profile'
                ? 'bg-purple-900/20 border-purple-500 shadow-md shadow-purple-500/10'
                : 'bg-[#120c24]/50 border-purple-950/20 hover:border-purple-900/40 hover:bg-purple-950/15'
            }`}
          >
            {/* Glowing side indicator */}
            {activeTab === 'profile' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r"></div>
            )}
            
            <div className={`p-2 rounded-lg transition-colors ${
              activeTab === 'profile' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-950/40 text-slate-400 group-hover:text-slate-200'
            }`}>
              <Award size={18} />
            </div>
            
            <div className="flex flex-col">
              <span className={`font-semibold text-sm transition-colors duration-200 ${
                activeTab === 'profile' ? 'text-purple-300' : 'text-slate-300 group-hover:text-slate-100'
              }`}>
                Profile Dashboard
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Overview & Stats</span>
            </div>
          </button>
        </div>

        {/* Sidebar Search Bar & Category Filters */}
        <div className="p-4 border-b border-purple-950/30 bg-purple-950/10 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search topic tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-purple-950/35 border border-purple-900/40 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all font-sans"
            />
          </div>

          {/* Category Filter Pills (LeetCode style) */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-medium sidebar-scrollbar">
            {['All', 'Algorithms', 'Database', 'Shell', 'Concurrency'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all duration-200 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/10'
                    : 'bg-purple-950/10 text-slate-400 border-transparent hover:text-slate-200 hover:bg-purple-950/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list of Tags */}
        <div className="flex-1 overflow-y-auto sidebar-scrollbar p-4 space-y-2.5">
          
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono tracking-wider px-2 pb-1.5 uppercase font-medium">
            <span>Topic Tag</span>
            <span>Completion Ratio</span>
          </div>

          {filteredTags.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm font-sans">
              No tags matches "{searchQuery}"
            </div>
          ) : (
            filteredTags.map((tag) => {
              const isActive = tag.tagId === activeTagId;
              const { userSolvedCount, percent } = getTagStats(tag);

              return (
                <button
                  key={tag.tagId}
                  onClick={() => {
                    setActiveTagId(tag.tagId);
                    setActiveTab('concepts'); // Reset to core concepts when tag changes
                    setExpandedSolutionId(null);
                    setMobileSidebarOpen(false); // Close mobile drawer
                  }}
                  className={`w-full text-left rounded-xl p-3.5 border transition-all duration-300 cursor-pointer flex flex-col gap-2 relative overflow-hidden group ${
                    isActive 
                      ? 'bg-purple-900/15 border-purple-500 shadow-md shadow-purple-500/5' 
                      : 'bg-[#120c24]/40 border-purple-950/20 hover:border-purple-900/40 hover:bg-purple-950/10'
                  }`}
                >
                  {/* Glowing side indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r"></div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm transition-colors duration-200 ${
                      isActive ? 'text-purple-300' : 'text-slate-300 group-hover:text-slate-100'
                    }`}>
                      {tag.tagName}
                    </span>
                    <span className="font-mono text-xs font-medium text-slate-400 group-hover:text-slate-300">
                      {userSolvedCount} / {tag.totalLeetcodeQuestions}
                    </span>
                  </div>

                  {/* Progress Bar Component */}
                  <div className="w-full">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1">
                      <span>Progress</span>
                      <span className={isActive ? 'text-purple-400 font-bold' : ''}>{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-purple-950/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${
                          isActive 
                            ? 'from-cyan-400 to-purple-500' 
                            : 'from-purple-900/60 to-purple-700/60'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar Footer branding */}
        <div className="p-4 border-t border-purple-950/30 bg-[#08050e] flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono tracking-wider">LEETCODE HUB v1.0</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-400 font-mono uppercase">Sync OK</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
