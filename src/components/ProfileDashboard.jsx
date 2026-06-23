import React, { useMemo } from 'react';
import { 
  Users, 
  Activity, 
  Sliders, 
  Award, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ExternalLink, 
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function ProfileDashboard({
  profileData,
  stats,
  attemptingCount,
  isDuelActive,
  setIsDuelActive,
  rivalProfileData,
  setRivalProfileData,
  rivalSkillsData,
  setRivalSkillsData,
  rivalBadgesData,
  setRivalBadgesData,
  rivalInputName,
  setRivalInputName,
  handleSyncRival,
  syncingRival,
  rivalSyncError,
  userSkillsMap,
  rivalSkillsMap,
  targetProblems,
  handleSkillTagClick,
  badgesData,
  calendarData,
  monthLabels,
  calendarGrid,
  skillsData
}) {

  // Radar chart definitions moved inside the component
  const topics = useMemo(() => [
    { key: 'array', label: 'Array' },
    { key: 'dynamic-programming', label: 'Dynamic Programming' },
    { key: 'string', label: 'String' },
    { key: 'tree', label: 'Tree' },
    { key: 'depth-first-search', label: 'DFS' },
    { key: 'binary-search', label: 'Binary Search' },
    { key: 'graph', label: 'Graph' },
    { key: 'greedy', label: 'Greedy' }
  ], []);

  const angleStep = useMemo(() => (2 * Math.PI) / topics.length, [topics]);
  const angles = useMemo(() => topics.map((_, i) => i * angleStep - Math.PI / 2), [topics, angleStep]);

  const radarData = useMemo(() => {
    const userPoints = topics.map((topic, i) => ({
      label: topic.label,
      value: userSkillsMap.get(topic.key) || 0,
      angle: angles[i]
    }));

    const rivalPoints = topics.map((topic, i) => ({
      label: topic.label,
      value: rivalSkillsMap.get(topic.key) || 0,
      angle: angles[i]
    }));

    const maxValue = Math.max(
      10,
      ...userPoints.map(p => p.value),
      ...rivalPoints.map(p => p.value)
    );

    return { userPoints, rivalPoints, maxValue };
  }, [topics, angles, userSkillsMap, rivalSkillsMap]);

  const userCoords = radarData.userPoints;
  const rivalCoords = radarData.rivalPoints;
  const maxValue = radarData.maxValue;

  const renderDuelController = () => {
    return (
      <div className="glass-card rounded-2xl p-5 border border-purple-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-purple-500 to-rose-500 rounded-r"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Users size={16} className="text-cyan-400" />
              Rival Duel Mode (VS Mode)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Compare your progress side-by-side with any LeetCode user, analyze topic strengths, and find gap targets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isDuelActive ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Dueling with: <strong className="text-slate-100 font-bold">@{rivalProfileData?.username}</strong>
                </span>
                <button
                  onClick={() => {
                    setIsDuelActive(false);
                    setRivalProfileData(null);
                    setRivalSkillsData(null);
                    setRivalBadgesData(null);
                    try {
                      localStorage.removeItem('rivalUsername');
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Exit Duel
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Rival LeetCode Username..."
                  value={rivalInputName}
                  onChange={(e) => setRivalInputName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSyncRival(rivalInputName)}
                  className="px-3 py-1.5 text-xs font-mono rounded-xl bg-purple-950/20 border border-purple-900/30 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 flex-1 min-w-[150px] sm:w-56"
                />
                <button
                  onClick={() => handleSyncRival(rivalInputName)}
                  disabled={syncingRival || !rivalInputName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/25 text-cyan-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncingRival ? '⏳ Syncing...' : 'Duel'}
                </button>
                <button
                  onClick={() => handleSyncRival('rival_demo')}
                  disabled={syncingRival}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/25 text-purple-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                  title="Load preloaded demo competitor to preview comparison dashboard immediately"
                >
                  Demo
                </button>
              </div>
            )}
          </div>
        </div>
        {rivalSyncError && (
          <div className="mt-3 text-xs text-rose-400 font-mono flex items-center gap-1.5">
            <AlertTriangle size={12} />
            {rivalSyncError}
          </div>
        )}
      </div>
    );
  };

  const renderDuelDashboard = () => {
    if (!rivalProfileData) return null;

    return (
      <div className="space-y-6">
        {/* Header VS Card */}
        <div className="glass-card rounded-2xl p-6 border border-purple-950/30 relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {/* User profile side */}
          <div className="flex items-center gap-4 w-full md:w-2/5 justify-center md:justify-end">
            <div className="text-center md:text-right">
              <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider block">Primary User</span>
              <span className="text-lg font-bold text-slate-100 block">{profileData ? profileData.name : 'Aaryan'}</span>
              <span className="text-xs text-slate-400 font-mono">@{profileData?.username || '68yxxnyWG8'}</span>
            </div>
            <img 
              src={profileData?.avatar || "https://assets.leetcode.com/users/default_avatar.jpg"} 
              alt="User Avatar" 
              className="w-14 h-14 rounded-xl border border-purple-500/30 object-cover" 
            />
          </div>

          {/* VS Divider Badge */}
          <div className="flex items-center justify-center shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-950/40 relative border border-purple-900/35">
              <span className="text-sm font-black font-mono tracking-widest text-slate-900 animate-pulse">VS</span>
            </div>
          </div>

          {/* Rival profile side */}
          <div className="flex items-center gap-4 w-full md:w-2/5 justify-center md:justify-start">
            <img 
              src={rivalProfileData.avatar} 
              alt="Rival Avatar" 
              className="w-14 h-14 rounded-xl border border-cyan-500/30 object-cover" 
            />
            <div className="text-center md:text-left">
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">Rival Challenger</span>
              <span className="text-lg font-bold text-slate-100 block">{rivalProfileData.name}</span>
              <span className="text-xs text-slate-400 font-mono">@{rivalProfileData.username}</span>
            </div>
          </div>
        </div>

        {/* Comparison scorecard & Radar chart grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Side-by-Side Solved Scorecard */}
          <div className="glass-card rounded-2xl p-6 space-y-6 col-span-1 lg:col-span-2">
            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-purple-950/30 pb-2.5">
              <Activity size={16} className="text-purple-400" />
              Comparative Solved Stats
            </h3>
            
            <div className="space-y-5">
              {/* Easy Comparative Progress */}
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-400 font-semibold uppercase">Easy</span>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span>You: <strong>{profileData?.easySolved || 0}</strong></span>
                    <span className="text-slate-600">vs</span>
                    <span className="text-cyan-300">Rival: <strong>{rivalProfileData.easySolved}</strong></span>
                  </div>
                </div>
                {/* Visual progress bar comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500">YOU</span>
                    <div className="w-full h-1.5 bg-purple-950/40 rounded-full overflow-hidden border border-purple-900/10">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${((profileData?.easySolved || 0) / (profileData?.totalEasy || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 text-right block">RIVAL</span>
                    <div className="w-full h-1.5 bg-purple-950/40 rounded-full overflow-hidden border border-purple-900/10">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(rivalProfileData.easySolved / rivalProfileData.totalEasy) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Medium Comparative Progress */}
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-400 font-semibold uppercase">Medium</span>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span>You: <strong>{profileData?.mediumSolved || 0}</strong></span>
                    <span className="text-slate-600">vs</span>
                    <span className="text-amber-300">Rival: <strong>{rivalProfileData.mediumSolved}</strong></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500">YOU</span>
                    <div className="w-full h-1.5 bg-purple-950/40 rounded-full overflow-hidden border border-purple-900/10">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${((profileData?.mediumSolved || 0) / (profileData?.totalMedium || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 text-right block">RIVAL</span>
                    <div className="w-full h-1.5 bg-purple-950/40 rounded-full overflow-hidden border border-purple-900/10">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(rivalProfileData.mediumSolved / rivalProfileData.totalMedium) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hard Comparative Progress */}
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-rose-400 font-semibold uppercase">Hard</span>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span>You: <strong>{profileData?.hardSolved || 0}</strong></span>
                    <span className="text-slate-600">vs</span>
                    <span className="text-rose-300">Rival: <strong>{rivalProfileData.hardSolved}</strong></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500">YOU</span>
                    <div className="w-full h-1.5 bg-purple-950/40 rounded-full overflow-hidden border border-purple-900/10">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${((profileData?.hardSolved || 0) / (profileData?.totalHard || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 text-right block">RIVAL</span>
                    <div className="w-full h-1.5 bg-purple-950/40 rounded-full overflow-hidden border border-purple-900/10">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(rivalProfileData.hardSolved / rivalProfileData.totalHard) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rank / Badges scoreboard cards */}
              <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-purple-950/20 font-mono">
                {/* Ranking Box */}
                <div className="bg-purple-950/10 border border-purple-900/10 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block tracking-wider leading-none">Global Ranking</span>
                  <div className="flex items-baseline justify-between mt-2.5">
                    <div className="text-slate-200 text-[11px]">
                      You: <span className="text-slate-100 font-bold">#{profileData?.ranking || 'N/A'}</span>
                    </div>
                    <div className="text-cyan-400 text-[11px]">
                      Rival: <span className="text-cyan-300 font-bold">#{rivalProfileData.ranking}</span>
                    </div>
                  </div>
                </div>

                {/* Total Solved Box */}
                <div className="bg-purple-950/10 border border-purple-900/10 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block tracking-wider leading-none">Total Solved</span>
                  <div className="flex items-baseline justify-between mt-2.5">
                    <div className="text-slate-200 text-[11px]">
                      You: <span className="text-slate-100 font-bold">{profileData?.totalSolved || 0}</span>
                    </div>
                    <div className="text-cyan-400 text-[11px]">
                      Rival: <span className="text-cyan-300 font-bold">{rivalProfileData.totalSolved}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: SVG Radar Chart (Mastery Comparison) */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-between col-span-1">
            <div className="w-full">
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-purple-950/30 pb-2.5">
                <Sliders size={16} className="text-purple-400" />
                Mastery Comparison
              </h3>
            </div>
            
            {/* Custom SVG Radar Chart */}
            <div className="w-full max-w-[280px] h-[280px] flex items-center justify-center mt-4 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 300">
                {/* Grid level circles/polygons */}
                {[0.25, 0.5, 0.75, 1.0].map((lvl, idx) => {
                  const points = angles.map(angle => {
                    const x = 150 + (lvl * 95) * Math.cos(angle);
                    const y = 150 + (lvl * 95) * Math.sin(angle);
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <polygon 
                      key={idx} 
                      points={points} 
                      fill="none" 
                      stroke="rgba(147, 51, 234, 0.12)" 
                      strokeWidth="1" 
                    />
                  );
                })}
                
                {/* Spokes */}
                {angles.map((angle, idx) => {
                  const x = 150 + 95 * Math.cos(angle);
                  const y = 150 + 95 * Math.sin(angle);
                  return (
                    <line
                      key={idx}
                      x1="150"
                      y1="150"
                      x2={x}
                      y2={y}
                      stroke="rgba(147, 51, 234, 0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* User polygon (solid purple) */}
                <polygon 
                  points={userCoords.map((c, i) => {
                    const r = ((userSkillsMap.get(topics[i].key) || 0) / maxValue) * 95;
                    const x = 150 + r * Math.cos(c.angle);
                    const y = 150 + r * Math.sin(c.angle);
                    return `${x},${y}`;
                  }).join(' ')} 
                  fill="rgba(168, 85, 247, 0.2)" 
                  stroke="rgb(168, 85, 247)" 
                  strokeWidth="2" 
                />

                {/* Rival polygon (dashed cyan) */}
                <polygon 
                  points={rivalCoords.map((c, i) => {
                    const r = ((rivalSkillsMap.get(topics[i].key) || 0) / maxValue) * 95;
                    const x = 150 + r * Math.cos(c.angle);
                    const y = 150 + r * Math.sin(c.angle);
                    return `${x},${y}`;
                  }).join(' ')} 
                  fill="rgba(14, 165, 233, 0.18)" 
                  stroke="rgb(14, 165, 233)" 
                  strokeWidth="2" 
                  strokeDasharray="4,3" 
                />

                {/* Outer Labels */}
                {topics.map((topic, idx) => {
                  const angle = angles[idx];
                  const x = 150 + 115 * Math.cos(angle);
                  const y = 150 + 115 * Math.sin(angle);
                  
                  let textAnchor = "middle";
                  if (Math.cos(angle) > 0.1) textAnchor = "start";
                  else if (Math.cos(angle) < -0.1) textAnchor = "end";
                  
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      className="fill-slate-400 text-[9px] font-mono select-none"
                    >
                      {topic.label}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center gap-5 mt-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-purple-500 rounded"></span>
                <span className="text-slate-300">You ({profileData?.totalSolved || 0})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 border-t-2 border-dashed border-cyan-400"></span>
                <span className="text-slate-300">Rival ({rivalProfileData.totalSolved})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overlap Gaps / Target Problems section */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-950/30 pb-3">
            <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap size={16} className="text-rose-400 font-bold" />
              Target Problems (Rival Solved, You Haven't)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              {targetProblems.length} targets identified
            </span>
          </div>

          {targetProblems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              {targetProblems.map((problem, pIdx) => (
                <a
                  key={pIdx}
                  href={problem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border border-purple-950/30 bg-[#0d0918]/40 hover:bg-[#120c24]/50 hover:border-purple-500/25 transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:shadow-purple-950/15 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-[9px] text-slate-500 group-hover:text-purple-400 transition-colors uppercase tracking-wider">
                      {problem.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-2.5 group-hover:text-white transition-colors leading-snug line-clamp-1 pr-4">
                    {problem.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors mt-2">
                    <span>Solve on LeetCode</span>
                    <ExternalLink size={10} />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-[#07040e]/30 border border-purple-950/15 rounded-xl">
              <p className="text-xs text-slate-500 font-mono italic">
                No gap targets identified from rival's recent submissions.
              </p>
              <p className="text-[10px] text-slate-600 font-sans mt-1">
                Either you have solved them all, or the rival does not have recent accepted submissions.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {renderDuelController()}
      {isDuelActive && rivalProfileData ? (
        renderDuelDashboard()
      ) : (
        <>
          {/* Grid of Profile Stats & Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Solved Problems Statistics Circle */}
            <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-around gap-6 col-span-1 lg:col-span-2">
              {/* Left part: The circular SVG chart */}
              <div className="relative flex items-center justify-center w-40 h-40 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="40" stroke="#18132b" strokeWidth="6" fill="transparent" />
                  {/* Solved Progress Circle with Gradient */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="url(#solvedCircleGradient)" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={251.3} 
                    strokeDashoffset={251.3 - (Math.min(100, ((profileData?.totalSolved || stats.totalSolved) / (profileData?.totalQuestions || stats.totalQuestions)) * 100) / 100) * 251.3}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="solvedCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Text inside circle */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-white leading-none font-mono">
                    {profileData ? profileData.totalSolved : stats.totalSolved}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">
                    / {profileData ? profileData.totalQuestions : stats.totalQuestions}
                  </span>
                  <span className="text-[11px] text-purple-400 font-semibold mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                    Solved
                  </span>
                  {attemptingCount > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono mt-1">
                      {attemptingCount} Attempting
                    </span>
                  )}
                </div>
              </div>

              {/* Right part: Easy, Medium, Hard Progress Bars */}
              <div className="flex-1 w-full max-w-xs space-y-4 font-mono">
                {/* Easy Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-cyan-400 font-semibold uppercase">Easy</span>
                    <span className="text-slate-300 font-medium">
                      {profileData ? profileData.easySolved : stats.easy}
                      <span className="text-slate-500 text-[10px] ml-1">
                        / {profileData ? profileData.totalEasy : stats.easyTotal}
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-purple-950/40 border border-purple-900/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500 ease-out" 
                      style={{ 
                        width: `${((profileData ? profileData.easySolved : stats.easy) / (profileData ? profileData.totalEasy : stats.easyTotal || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                {/* Medium Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400 font-semibold uppercase">Medium</span>
                    <span className="text-slate-300 font-medium">
                      {profileData ? profileData.mediumSolved : stats.medium}
                      <span className="text-slate-500 text-[10px] ml-1">
                        / {profileData ? profileData.totalMedium : stats.mediumTotal}
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-purple-950/40 border border-purple-900/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out" 
                      style={{ 
                        width: `${((profileData ? profileData.mediumSolved : stats.medium) / (profileData ? profileData.totalMedium : stats.mediumTotal || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Hard Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-400 font-semibold uppercase">Hard</span>
                    <span className="text-slate-300 font-medium">
                      {profileData ? profileData.hardSolved : stats.hard}
                      <span className="text-slate-500 text-[10px] ml-1">
                        / {profileData ? profileData.totalHard : stats.hardTotal}
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-purple-950/40 border border-purple-900/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-400 rounded-full transition-all duration-500 ease-out" 
                      style={{ 
                        width: `${((profileData ? profileData.hardSolved : stats.hard) / (profileData ? profileData.totalHard : stats.hardTotal || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Earned / Upcoming Card */}
            <div className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between col-span-1">
              <div>
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-purple-950/30 pb-2.5">
                  <Award size={16} className="text-purple-400" />
                  Badges
                </h3>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {badgesData ? badgesData.badgesCount : 0}
                  </span>
                  <span className="text-xs text-slate-500">earned badges</span>
                </div>
                
                {badgesData && badgesData.badges && badgesData.badges.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2.5 mt-4">
                    {badgesData.badges.map((badge, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center group" title={badge.name}>
                        <img 
                          src={badge.icon.startsWith('/') ? 'https://leetcode.com' + badge.icon : badge.icon} 
                          alt={badge.name} 
                          className="w-10 h-10 object-contain hover:scale-110 transition-transform" 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-3 font-sans">
                    No badges unlocked yet. Keep solving daily challenges!
                  </p>
                )}
              </div>

              {badgesData && badgesData.upcomingBadges && badgesData.upcomingBadges.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-purple-950/20 flex items-center gap-3.5 bg-purple-950/10 p-3 rounded-xl border border-purple-900/10">
                  <div className="w-11 h-11 relative shrink-0">
                    <img 
                      src={badgesData.upcomingBadges[0].icon.startsWith('/') 
                        ? 'https://leetcode.com' + badgesData.upcomingBadges[0].icon 
                        : badgesData.upcomingBadges[0].icon} 
                      alt="Upcoming badge" 
                      className="w-full h-full object-contain opacity-45 blur-[0.3px]" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] bg-black/70 text-purple-300 font-mono px-1 rounded border border-purple-900/30 uppercase tracking-widest font-semibold scale-90">Locked</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-400 font-mono uppercase block tracking-wider leading-none">Upcoming Challenge</span>
                    <span className="text-xs font-semibold text-slate-200 block mt-1.5 leading-snug">{badgesData.upcomingBadges[0].name}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Heatmap Section */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-950/30 pb-3">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" />
                Submission Calendar
              </h3>
              
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <div>
                  Total active days: <span className="text-slate-200 font-semibold">{calendarData ? calendarData.totalActiveDays : 63}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-purple-900/40"></div>
                <div>
                  Max streak: <span className="text-slate-200 font-semibold">{calendarData ? calendarData.streak : 37}</span>
                </div>
              </div>
            </div>

            <div className="pt-10 pb-4 px-4 overflow-x-auto bg-[#07040e]/40 border border-purple-950/20 rounded-xl sidebar-scrollbar">
              <div className="min-w-[760px] select-none">
                <div className="flex gap-2">
                  
                  {/* Days of Week Labels */}
                  <div className="grid grid-rows-7 text-[9px] text-slate-500 font-mono font-medium justify-items-end pr-1 pt-[24px] leading-[10px] gap-1 shrink-0">
                    <span className="h-2.5">Sun</span>
                    <span className="h-2.5"></span>
                    <span className="h-2.5">Tue</span>
                    <span className="h-2.5"></span>
                    <span className="h-2.5">Thu</span>
                    <span className="h-2.5"></span>
                    <span className="h-2.5">Sat</span>
                  </div>

                  {/* Calendar Grid */}
                  <div className="flex-1 flex flex-col">
                    
                    {/* Month Labels at the top */}
                    <div className="relative h-4 mb-2 w-full text-[9px] text-slate-500 font-mono border-b border-purple-950/20 pb-1.5">
                      {monthLabels.map((lbl, idx) => (
                        <span
                          key={idx}
                          className="absolute transform -translate-x-1/2 leading-none"
                          style={{ left: `${(lbl.index / calendarGrid.length) * 100}%` }}
                        >
                          {lbl.text}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-flow-col grid-rows-7 gap-1">
                      {calendarGrid.map((week, wIdx) => 
                        week.map((day, dIdx) => {
                          if (!day) {
                            return <div key={`empty-${wIdx}-${dIdx}`} className="w-2.5 h-2.5 bg-transparent rounded-sm" />;
                          }
                          
                          let colorClass = "bg-[#140f26] border border-purple-950/15"; 
                          if (day.count > 0 && day.count <= 2) colorClass = "bg-emerald-950/60 border border-emerald-900/10 text-emerald-400";
                          else if (day.count > 2 && day.count <= 5) colorClass = "bg-emerald-800/60 border border-emerald-700/15 text-emerald-300";
                          else if (day.count > 5 && day.count <= 15) colorClass = "bg-emerald-600/70 border border-emerald-500/20 text-emerald-200";
                          else if (day.count > 15) colorClass = "bg-emerald-400 border border-emerald-300/30 text-emerald-950";

                          // Dynamic tooltip alignment to prevent side clipping on outer edges
                          let tooltipAlignClass = "left-1/2 -translate-x-1/2";
                          if (wIdx < 4) {
                            tooltipAlignClass = "left-0 translate-x-0";
                          } else if (wIdx > 48) {
                            tooltipAlignClass = "right-0 left-auto translate-x-0";
                          }

                          return (
                            <div 
                              key={day.dateStr}
                              className={`w-2.5 h-2.5 rounded-sm transition-all duration-200 hover:scale-125 hover:z-10 cursor-pointer relative group ${colorClass}`}
                            >
                              <div className={`absolute bottom-full mb-1.5 hidden group-hover:block bg-slate-900 border border-purple-900 text-slate-100 text-[9px] font-mono py-1.5 px-2.5 rounded-md whitespace-nowrap z-50 shadow-xl leading-none ${tooltipAlignClass}`}>
                                <span className="font-semibold text-purple-300">{day.count} submissions</span> on {new Date(day.dateStr).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-purple-950/30 pb-2.5">
              <Cpu size={16} className="text-purple-400" />
              User Skills Dashboard
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Advanced Skills */}
              <div className="bg-[#0b0713]/40 border border-purple-950/35 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-950/40 pb-2">
                  <span className="text-xs font-bold font-mono text-purple-400 uppercase tracking-wider">Advanced ({skillsData?.advanced?.length || 0})</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">Expert DSA</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsData?.advanced && skillsData.advanced.length > 0 ? (
                    skillsData.advanced.map((item, idx) => (
                      <button key={idx} onClick={() => handleSkillTagClick(item.tagSlug)}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-purple-900/10 border border-purple-950/50 text-slate-300 font-medium hover:border-purple-400/50 hover:bg-purple-950/20 transition-all flex items-center gap-1.5 cursor-pointer font-sans">
                        <span>{item.tagName}</span>
                        <span className="font-mono text-[10px] bg-purple-950/80 px-1.5 rounded border border-purple-900/40 text-purple-300 font-bold">{item.problemsSolved}</span>
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No advanced tags completed yet.</span>
                  )}
                </div>
              </div>

              {/* Intermediate Skills */}
              <div className="bg-[#0b0713]/40 border border-purple-950/35 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-950/40 pb-2">
                  <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">Intermediate ({skillsData?.intermediate?.length || 0})</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">Intermediate DSA</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsData?.intermediate && skillsData.intermediate.length > 0 ? (
                    skillsData.intermediate.map((item, idx) => (
                      <button key={idx} onClick={() => handleSkillTagClick(item.tagSlug)}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-cyan-950/10 border border-cyan-950/50 text-slate-300 font-medium hover:border-cyan-400/50 hover:bg-cyan-950/20 transition-all flex items-center gap-1.5 cursor-pointer font-sans">
                        <span>{item.tagName}</span>
                        <span className="font-mono text-[10px] bg-cyan-950/80 px-1.5 rounded border border-cyan-900/40 text-cyan-300 font-bold">{item.problemsSolved}</span>
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No intermediate tags completed yet.</span>
                  )}
                </div>
              </div>

              {/* Fundamental Skills */}
              <div className="bg-[#0b0713]/40 border border-purple-950/35 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-950/40 pb-2">
                  <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Fundamental ({skillsData?.fundamental?.length || 0})</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">Basic DSA</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsData?.fundamental && skillsData.fundamental.length > 0 ? (
                    skillsData.fundamental.map((item, idx) => (
                      <button key={idx} onClick={() => handleSkillTagClick(item.tagSlug)}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-950/10 border border-emerald-950/50 text-slate-300 font-medium hover:border-emerald-400/50 hover:bg-emerald-950/20 transition-all flex items-center gap-1.5 cursor-pointer font-sans">
                        <span>{item.tagName}</span>
                        <span className="font-mono text-[10px] bg-emerald-950/80 px-1.5 rounded border border-emerald-900/40 text-emerald-300 font-bold">{item.problemsSolved}</span>
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No fundamental tags completed yet.</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Recent Submissions Section */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-purple-950/30 pb-2.5">
              <Clock size={16} className="text-cyan-400 animate-pulse" />
              Live Recent Accepted Submissions
            </h3>
            
            {profileData?.recentSubmissions && profileData.recentSubmissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileData.recentSubmissions.map((sub, idx) => (
                  <a 
                    key={idx}
                    href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0b0713]/40 border border-purple-950/35 rounded-xl p-4.5 flex flex-col justify-between gap-3.5 hover:border-cyan-500/40 hover:bg-purple-950/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group duration-200"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors text-sm line-clamp-1">{sub.title}</span>
                      </div>
                      <ArrowUpRight size={13} className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-0.5" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Accepted
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase">
                        {sub.lang === 'cpp' ? 'C++' : sub.lang.toUpperCase()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic font-sans py-4 text-center">
                No recent submissions synced.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
