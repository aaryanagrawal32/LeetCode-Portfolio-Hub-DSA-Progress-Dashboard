import React from 'react';
import { 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  Sun, 
  Moon, 
  X, 
  Activity, 
  Menu 
} from 'lucide-react';

export default function Header({
  sidebarCollapsed,
  setSidebarCollapsed,
  theme,
  setTheme,
  useSyncedData,
  setUseSyncedData,
  profileData,
  setProfileData,
  setSkillsData,
  setBadgesData,
  setCalendarData,
  inputUsername,
  setInputUsername,
  handleSyncProfile,
  syncing,
  setSyncError,
  stats,
  mobileSidebarOpen,
  setMobileSidebarOpen
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-purple-950/40 bg-[#0e0a1b]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Sidebar collapse button for desktop */}
        <button 
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className="hidden lg:flex p-2 rounded-xl bg-purple-950/45 border border-purple-900/40 text-purple-400 hover:text-white hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer transition-all duration-200"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Logo Icon */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20">
          <Layers className="w-5.5 h-5.5" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 blur-sm opacity-50 -z-10 animate-pulse-glow"></div>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent m-0 p-0 font-sans">
            LeetCode <span className="text-purple-400 hidden sm:inline">Portfolio Hub</span><span className="text-purple-400 inline sm:hidden"> Hub</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            <span className="hidden sm:inline">Developer Dashboard</span>
            <span className="inline sm:hidden">Dev Dashboard</span>
          </p>
        </div>
      </div>

      {/* LeetCode Profile Sync UI */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-purple-950/45 border border-purple-900/40 text-purple-400 hover:text-white hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer transition-all duration-200 shrink-0 flex items-center justify-center"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {useSyncedData && profileData ? (
          <div className="flex items-center gap-2.5 bg-purple-950/45 border border-purple-900/40 rounded-xl px-3 py-1.5 text-xs">
            <img 
              src={profileData.avatar} 
              alt="Avatar" 
              className="w-6.5 h-6.5 rounded-full border border-purple-500/30"
              onError={(e) => { e.target.src = "https://assets.leetcode.com/users/default_avatar.jpg" }}
            />
            <div className="text-left hidden sm:block">
              <span className="font-semibold text-slate-200 block leading-none text-[11px]">{profileData.name}</span>
              <span className="text-[9px] text-purple-400 font-mono">Rank: {profileData.ranking}</span>
            </div>
            <button
              onClick={() => {
                setUseSyncedData(false);
                setProfileData(null);
                setSkillsData(null);
                setBadgesData(null);
                setCalendarData(null);
                setInputUsername('');
                setSyncError(null);
              }}
              className="text-slate-500 hover:text-rose-400 transition-colors p-0.5 cursor-pointer ml-1"
              title="Disconnect Profile"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="LeetCode Username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSyncProfile(inputUsername)}
              className="bg-purple-950/30 border border-purple-900/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all w-24 sm:w-36 md:w-44 font-sans"
            />
            <button
              onClick={() => handleSyncProfile(inputUsername)}
              disabled={syncing}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        )}
      </div>

      {/* Global Statistics Summary */}
      <div className="hidden lg:flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2.5 bg-purple-950/20 border border-purple-900/30 rounded-xl px-4 py-1.5">
          <Activity size={16} className="text-cyan-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight font-mono">TOTAL SOLVED</span>
            <span className="font-semibold text-slate-200">{stats.totalSolved} / {stats.totalQuestions}</span>
          </div>
          <span className="text-xs text-purple-400 font-mono font-semibold ml-1">({stats.globalProgress}%)</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium font-mono">{stats.easy} Easy</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium font-mono">{stats.medium} Medium</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium font-mono">{stats.hard} Hard</span>
        </div>
      </div>

      {/* Mobile Hamburger menu */}
      <button 
        onClick={() => setMobileSidebarOpen(prev => !prev)}
        className="lg:hidden p-2 rounded-lg bg-purple-950/40 border border-purple-900/30 text-purple-400 hover:text-white cursor-pointer"
      >
        {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}
