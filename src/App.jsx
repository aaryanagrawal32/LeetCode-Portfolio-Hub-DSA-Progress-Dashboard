import React, { useState, useMemo, useEffect } from 'react';
import { 
  Code, 
  Award, 
  BookOpen, 
  Cpu, 
  ExternalLink, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Menu, 
  X, 
  Layers, 
  ChevronLeft, 
  Terminal, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  Clock, 
  Plus,
  ArrowUpRight,
  Sliders,
  Zap,
  AlertTriangle,
  Copy,
  Check,
  Sun,
  Moon
} from 'lucide-react';
import { mockTagsData } from './mockData';
import CodeBlock from './components/CodeBlock';
import { STL_CONTAINER_DIRECTORY } from './data/stlDirectory';
import { PREDEFINED_PROBLEMS } from './data/predefinedProblems';
import { STL_CHEAT_SHEETS } from './data/stlCheatSheets';
import { EDGE_CASES } from './data/edgeCases';
import { TAG_KEYWORDS } from './data/tagKeywords';
import { generatePlaygroundCode } from './utils/playgroundHelpers';
import { getDryRunTrace } from './utils/dryRunTraces';
import ComplexityGauge from './components/ComplexityGauge';
import { FALLBACK_TEMPLATES } from './data/fallbackTemplates';

// Constants for total question counts on LeetCode
const DEFAULT_TOTAL_EASY = 950;
const DEFAULT_TOTAL_MEDIUM = 2069;
const DEFAULT_TOTAL_HARD = 943;
const DEFAULT_TOTAL_QUESTIONS = 3962;



const getStlCheatSheet = (tagId) => {
  return STL_CONTAINER_DIRECTORY[tagId] || {
    container: "std::vector / std::unordered_map",
    syntax: "std::vector<int> vec;\nstd::unordered_map<int, int> map;",
    methods: [
      { name: "size()", desc: "Returns the size of the container", complexity: "O(1)" },
      { name: "empty()", desc: "Checks if container is empty", complexity: "O(1)" },
      { name: "clear()", desc: "Clears all elements", complexity: "O(N)" }
    ],
    note: "Utilize standard library algorithms like std::sort, std::find, and std::binary_search to operate efficiently.",
    docUrl: "https://cplusplus.com/reference/stl/"
  };
};

const getEdgeCases = (tagId) => {
  return EDGE_CASES[tagId] || [
    { title: "Empty Input", desc: "Check size/length of inputs before processing. if (nums.empty()) return ...;" },
    { title: "Large Inputs (Overflow)", desc: "Watch out for variables exceeding standard integer limits. Use long or modulo arithmetic." },
    { title: "Out-of-bounds Indexing", desc: "Loop conditions should prevent off-by-one errors (e.g. accessing arr[n] where n is size)." }
  ];
};

const getTagKeywords = (tagId) => {
  return TAG_KEYWORDS[tagId] || ["optimal", "complexity", "corner cases", "efficiency", "structure"];
};

export default function App() {
  // 1. State Management
  const [activeTagId, setActiveTagId] = useState('array');
  const [activeTab, setActiveTab] = useState('profile'); // Default tab is profile dashboard!
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [expandedSolutionId, setExpandedSolutionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState('');
  const [problemDetailsCache, setProblemDetailsCache] = useState({});
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState(15);
  const [expandedSubTabs, setExpandedSubTabs] = useState({}); // problemId -> tabName
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const [playgroundConfig, setPlaygroundConfig] = useState({
    array: { type: 'sliding_window', condition: 'windowState > target', sumType: 'int' },
    'binary-search': { boundType: 'lower' },
    'trees': { returnType: 'int', nullReturn: '0' },
    'binary-tree': { returnType: 'int', nullReturn: '0' }
  });
  const [dryRunState, setDryRunState] = useState({}); // problemId -> { running: boolean, step: number, logs: string[] }
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedStlContainer, setSelectedStlContainer] = useState('vector');
  const [stlSearchQuery, setStlSearchQuery] = useState('');
  const [copiedMethodName, setCopiedMethodName] = useState(null);

  // LeetCode Profile Sync States
  const [inputUsername, setInputUsername] = useState('68yxxnyWG8');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    username: '68yxxnyWG8',
    name: 'Aaryan',
    ranking: '174,716',
    avatar: 'https://assets.leetcode.com/users/default_avatar.jpg',
    totalSolved: 530,
    easySolved: 193,
    totalEasy: DEFAULT_TOTAL_EASY,
    mediumSolved: 314,
    totalMedium: DEFAULT_TOTAL_MEDIUM,
    hardSolved: 23,
    totalHard: DEFAULT_TOTAL_HARD,
    totalQuestions: DEFAULT_TOTAL_QUESTIONS,
    recentSubmissions: [
      { title: "Minimize XOR", titleSlug: "minimize-xor", lang: "cpp" },
      { title: "Maximum XOR of Two Numbers in an Array", titleSlug: "maximum-xor-of-two-numbers-in-an-array", lang: "cpp" },
      { title: "Implement Trie (Prefix Tree)", titleSlug: "implement-trie-prefix-tree", lang: "cpp" },
      { title: "Combination Sum III", titleSlug: "combination-sum-iii", lang: "cpp" },
      { title: "Process String with Special Operations I", titleSlug: "process-string-with-special-operations-i", lang: "cpp" },
      { title: "Combination Sum II", titleSlug: "combination-sum-ii", lang: "cpp" },
      { title: "Check Good Integer", titleSlug: "check-good-integer", lang: "cpp" },
      { title: "Sudoku Solver", titleSlug: "sudoku-solver", lang: "cpp" },
      { title: "N-Queens II", titleSlug: "n-queens-ii", lang: "cpp" },
      { title: "Delete the Middle Node of a Linked List", titleSlug: "delete-the-middle-node-of-a-linked-list", lang: "cpp" }
    ],
    totalSubmissions: [
      { difficulty: "All", count: 539, submissions: 955 },
      { difficulty: "Easy", count: 193, submissions: 315 },
      { difficulty: "Medium", count: 321, submissions: 592 },
      { difficulty: "Hard", count: 25, submissions: 48 }
    ]
  });

  const [skillsData, setSkillsData] = useState(null);
  const [badgesData, setBadgesData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [useSyncedData, setUseSyncedData] = useState(true);

  // 2. Sort topic tags by frequency (represented by totalLeetcodeQuestions descending)
  const sortedTags = useMemo(() => {
    return [...mockTagsData]
      .map(tag => {
        const fallback = FALLBACK_TEMPLATES[tag.tagId] || [];
        return {
          ...tag,
          generalTemplates: (tag.generalTemplates && tag.generalTemplates.length > 0)
            ? tag.generalTemplates
            : fallback
        };
      })
      .sort((a, b) => b.totalLeetcodeQuestions - a.totalLeetcodeQuestions);
  }, []);

  // 3. Filter tags based on user search query and category
  const filteredTags = useMemo(() => {
    return sortedTags.filter(tag => {
      const matchesSearch = tag.tagName.toLowerCase().includes(searchQuery.toLowerCase());
      const tagCategory = tag.category || 'Algorithms';
      const matchesCategory = selectedCategory === 'All' || tagCategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sortedTags, searchQuery, selectedCategory]);

  // 4. Find the currently active tag
  const activeTag = useMemo(() => {
    const inFiltered = filteredTags.find(tag => tag.tagId === activeTagId);
    if (inFiltered) return inFiltered;
    if (filteredTags.length > 0) return filteredTags[0];
    return sortedTags.find(tag => tag.tagId === activeTagId) || sortedTags[0];
  }, [filteredTags, sortedTags, activeTagId]);

  const handleCopyMethod = async (syntax, methodName) => {
    try {
      await navigator.clipboard.writeText(syntax);
      setCopiedMethodName(methodName);
      setTimeout(() => setCopiedMethodName(null), 2000);
    } catch (err) {
      console.error('Failed to copy method syntax: ', err);
    }
  };

  // Sync profile function
  const handleSyncProfile = async (usernameToSync) => {
    if (!usernameToSync.trim()) return;
    setSyncing(true);
    setSyncError(null);
    try {
      const cleanUsername = usernameToSync.trim();
      
      // Fetch all endpoints in parallel to optimize load time
      const [profileRes, skillRes, badgesRes, calendarRes] = await Promise.all([
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/profile`),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/skill`).catch(() => null),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/badges`).catch(() => null),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/calendar`).catch(() => null)
      ]);
      
      if (!profileRes || !profileRes.ok) {
        throw new Error("Could not find LeetCode profile for this user.");
      }
      const profileInfo = await profileRes.json();
      
      let skillInfo = { fundamental: [], intermediate: [], advanced: [] };
      if (skillRes && skillRes.ok) {
        try {
          skillInfo = await skillRes.json();
        } catch (e) {
          console.error("Error parsing skill JSON:", e);
        }
      }
      
      let badgesInfo = { badgesCount: 0, badges: [], upcomingBadges: [], activeBadge: null };
      if (badgesRes && badgesRes.ok) {
        try {
          badgesInfo = await badgesRes.json();
        } catch (e) {
          console.error("Error parsing badges JSON:", e);
        }
      }
      
      let calendarInfo = { activeYears: [], streak: 0, totalActiveDays: 0, submissionCalendar: "{}" };
      if (calendarRes && calendarRes.ok) {
        try {
          calendarInfo = await calendarRes.json();
        } catch (e) {
          console.error("Error parsing calendar JSON:", e);
        }
      }

      setProfileData({
        username: cleanUsername,
        name: profileInfo.name || profileInfo.username || cleanUsername,
        ranking: profileInfo.ranking || "N/A",
        avatar: profileInfo.avatar || "https://assets.leetcode.com/users/default_avatar.jpg",
        totalSolved: profileInfo.totalSolved || 0,
        easySolved: profileInfo.easySolved || 0,
        totalEasy: profileInfo.totalEasy || DEFAULT_TOTAL_EASY,
        mediumSolved: profileInfo.mediumSolved || 0,
        totalMedium: profileInfo.totalMedium || DEFAULT_TOTAL_MEDIUM,
        hardSolved: profileInfo.hardSolved || 0,
        totalHard: profileInfo.totalHard || DEFAULT_TOTAL_HARD,
        totalQuestions: profileInfo.totalQuestions || DEFAULT_TOTAL_QUESTIONS,
        recentSubmissions: profileInfo.recentSubmissions || [],
        totalSubmissions: profileInfo.totalSubmissions || []
      });

      setSkillsData(skillInfo);
      setBadgesData(badgesInfo);
      setCalendarData(calendarInfo);
      setUseSyncedData(true);
    } catch (err) {
      setSyncError(err.message || "Failed to sync LeetCode profile. Please verify username.");
    } finally {
      setSyncing(false);
    }
  };

  // Trigger sync on mount for user Aaryan
  useEffect(() => {
    handleSyncProfile('68yxxnyWG8');
  }, []);

  // Sync theme with HTML root class
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Reset pagination, filters, and active template when tag changes
  useEffect(() => {
    setVisibleQuestionsCount(15);
    setActiveTemplateIndex(0);
    setDifficultyFilter('All');
  }, [activeTagId]);

  // Helper to normalize the tagId slug to align with LeetCode API's tagSlug values
  const normalizeSlug = (id) => {
    const clean = id.toLowerCase().trim();
    if (clean === 'trees') return 'tree';
    if (clean === 'binary-search-tree') return 'binary-search-tree';
    if (clean === 'heap-priority-queue') return 'heap';
    return clean;
  };

  // Create a map of normalized tag slugs to problemsSolved from skillsData
  const userSkillsMap = useMemo(() => {
    const map = new Map();
    if (!skillsData) return map;
    
    const { fundamental = [], intermediate = [], advanced = [] } = skillsData;
    [...fundamental, ...intermediate, ...advanced].forEach(item => {
      if (item && item.tagSlug) {
        map.set(item.tagSlug.toLowerCase().trim(), item.problemsSolved);
      }
    });
    return map;
  }, [skillsData]);

  // Lookup problems solved count with fallbacks and slug matching
  const getProblemsSolved = useMemo(() => {
    return (tag) => {
      if (!tag) return 0;
      const id = tag.tagId.toLowerCase();
      const normalized = normalizeSlug(id);
      const slugFromTitle = tag.tagName.toLowerCase().replace(/\s+/g, '-');
      
      if (userSkillsMap.has(id)) return userSkillsMap.get(id);
      if (userSkillsMap.has(normalized)) return userSkillsMap.get(normalized);
      if (userSkillsMap.has(slugFromTitle)) return userSkillsMap.get(slugFromTitle);
      
      // Special cases
      if (id === 'heap-priority-queue' && userSkillsMap.has('heap')) {
        return userSkillsMap.get('heap');
      }
      
      return 0;
    };
  }, [userSkillsMap]);

  // Helper to resolve tag counts based on actual LeetCode profile skill stats
  const getTagStats = useMemo(() => {
    return (tag) => {
      if (!tag) return { userSolvedCount: 0, percent: "0" };
      if (useSyncedData && skillsData) {
        const userSolvedCount = getProblemsSolved(tag);
        const percent = Math.min(100, Math.round((userSolvedCount / tag.totalLeetcodeQuestions) * 100));
        return { userSolvedCount, percent: String(percent) };
      }
      // Set to zero if no user is connected/selected
      return { userSolvedCount: 0, percent: "0" };
    };
  }, [useSyncedData, skillsData, getProblemsSolved]);

  // Calculate global portfolio statistics
  const stats = useMemo(() => {
    const totalQuestions = profileData?.totalQuestions || DEFAULT_TOTAL_QUESTIONS;
    
    if (useSyncedData && profileData) {
      const totalSolved = profileData.totalSolved;
      const globalProgress = totalQuestions > 0 ? ((totalSolved / totalQuestions) * 100).toFixed(1) : 0;
      return {
        totalSolved,
        totalQuestions,
        globalProgress,
        easy: profileData.easySolved,
        easyTotal: profileData.totalEasy || DEFAULT_TOTAL_EASY,
        medium: profileData.mediumSolved,
        mediumTotal: profileData.totalMedium || DEFAULT_TOTAL_MEDIUM,
        hard: profileData.hardSolved,
        hardTotal: profileData.totalHard || DEFAULT_TOTAL_HARD
      };
    }

    // Set to zero if no user is connected/selected
    return { 
      totalSolved: 0, 
      totalQuestions: DEFAULT_TOTAL_QUESTIONS, 
      globalProgress: "0.0", 
      easy: 0, 
      easyTotal: DEFAULT_TOTAL_EASY,
      medium: 0, 
      mediumTotal: DEFAULT_TOTAL_MEDIUM,
      hard: 0, 
      hardTotal: DEFAULT_TOTAL_HARD 
    };
  }, [useSyncedData, profileData]);

  const activeTagStats = useMemo(() => {
    return getTagStats(activeTag);
  }, [activeTag, getTagStats]);

  const solvedQuestionsList = useMemo(() => {
    if (!activeTag) return [];
    
    // Get actual user solved count for this active tag
    const { userSolvedCount } = getTagStats(activeTag);
    
    // Start with handcrafted solutions from mockTagsData
    const list = [...activeTag.mySolutions];
    
    // If we need more questions, generate them to match userSolvedCount
    if (list.length < userSolvedCount) {
      const needed = userSolvedCount - list.length;
      const tagLower = activeTag.tagId.toLowerCase();
      
      let predefined = PREDEFINED_PROBLEMS[tagLower] || [];
      if (tagLower === 'trees' || tagLower === 'tree') {
        predefined = [...(PREDEFINED_PROBLEMS['trees'] || []), ...(PREDEFINED_PROBLEMS['binary-tree'] || [])];
      } else if (tagLower === 'binary-tree') {
        predefined = [...(PREDEFINED_PROBLEMS['binary-tree'] || []), ...(PREDEFINED_PROBLEMS['trees'] || [])];
      } else if (tagLower === 'heap-priority-queue') {
        predefined = PREDEFINED_PROBLEMS['heap-priority-queue'] || [];
      }
      
      const existingIds = new Set(list.map(s => s.problemId));
      let predefinedIndex = 0;
      
      for (let i = 0; i < needed; i++) {
        let nextProblem = null;
        while (predefinedIndex < predefined.length) {
          const candidate = predefined[predefinedIndex++];
          if (!existingIds.has(candidate.problemId)) {
            nextProblem = candidate;
            break;
          }
        }
        
        if (nextProblem) {
          list.push({
            problemId: nextProblem.problemId,
            title: nextProblem.title,
            titleSlug: nextProblem.titleSlug,
            difficulty: nextProblem.difficulty,
            leetcodeUrl: `https://leetcode.com/problems/${nextProblem.titleSlug}/`,
            logic: nextProblem.logic || `Optimized ${activeTag.tagName} pattern implementation. Utilizes modern C++ techniques and dynamic data structures to guarantee minimal memory usage and optimal time complexity.`,
            code: nextProblem.code || `// Accepted C++ Solution for ${nextProblem.title}\n\nclass Solution {\npublic:\n    // Implementation details\n};`
          });
          existingIds.add(nextProblem.problemId);
        } else {
          // Generate realistic placeholder problem
          const difficulty = i % 10 === 0 ? 'Hard' : (i % 3 === 0 ? 'Easy' : 'Medium');
          
          let problemId = 100 + i + (existingIds.size * 3) + Math.floor(Math.random() * 50);
          while (existingIds.has(problemId)) {
            problemId++;
          }
          
          const title = `${activeTag.tagName} Optimization Problem #${i + 1}`;
          const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          list.push({
            problemId,
            title,
            titleSlug,
            difficulty,
            leetcodeUrl: `https://leetcode.com/problems/${titleSlug}/`,
            logic: `Standard optimal solution for ${activeTag.tagName} pattern. It solves the problem in a single pass to achieve O(N) time complexity and maintains minimal state variables to achieve O(1) space.`,
            code: `// C++ Solution for ${title}\n\nclass Solution {\npublic:\n    int solve${activeTag.tagName.replace(/[^a-zA-Z]/g, '')}(vector<int>& nums) {\n        // Your custom logic for ${title}\n        return 0;\n    }\n};`
          });
          existingIds.add(problemId);
        }
      }
    }
    
    return list;
  }, [activeTag, getTagStats]);

  const filteredSolvedQuestions = useMemo(() => {
    if (!solvedQuestionsList) return [];
    
    let result = solvedQuestionsList;
    
    // 1. Filter by difficulty selection
    if (difficultyFilter !== 'All') {
      result = result.filter(sol => sol.difficulty === difficultyFilter);
    }
    
    // 2. Filter by search query
    if (submissionSearchQuery.trim()) {
      const q = submissionSearchQuery.toLowerCase().trim();
      result = result.filter(sol => 
        String(sol.problemId).includes(q) || 
        sol.title.toLowerCase().includes(q) || 
        sol.difficulty.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [solvedQuestionsList, submissionSearchQuery, difficultyFilter]);

  const activeTagDifficultyStats = useMemo(() => {
    const stats = { Easy: 0, Medium: 0, Hard: 0, Total: 0 };
    if (!solvedQuestionsList) return stats;
    solvedQuestionsList.forEach(q => {
      if (stats[q.difficulty] !== undefined) {
        stats[q.difficulty]++;
      }
      stats.Total++;
    });
    return stats;
  }, [solvedQuestionsList]);

  // Parse calendar data to map dates (YYYY-MM-DD) to submission counts
  const dateToCountMap = useMemo(() => {
    const map = {};
    if (!calendarData || !calendarData.submissionCalendar) return map;
    try {
      const calendarObj = JSON.parse(calendarData.submissionCalendar);
      Object.entries(calendarObj).forEach(([timestamp, count]) => {
        const date = new Date(Number(timestamp) * 1000);
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;
        map[dateKey] = count;
      });
    } catch (e) {
      console.error("Error parsing submission calendar JSON:", e);
    }
    return map;
  }, [calendarData]);

  // Generate calendar grid (53 columns of weeks, 7 rows of days)
  const calendarGrid = useMemo(() => {
    const grid = [];
    const today = new Date();
    // Normalize to UTC midnight
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    
    // Start date is exactly 364 days ago (52 weeks ago)
    const startDate = new Date(todayUTC);
    startDate.setUTCDate(todayUTC.getUTCDate() - 364);
    
    // Shift back to nearest Sunday to align weeks nicely
    const startDayOfWeek = startDate.getUTCDay();
    startDate.setUTCDate(startDate.getUTCDate() - startDayOfWeek);
    
    let currentDate = new Date(startDate);
    let currentWeek = [];
    
    while (currentDate <= todayUTC) {
      const yyyy = currentDate.getUTCFullYear();
      const mm = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getUTCDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const count = dateToCountMap[dateStr] || 0;
      
      currentWeek.push({
        dateStr,
        count
      });
      
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      grid.push(currentWeek);
    }
    
    return grid;
  }, [dateToCountMap]);

  // Extract month labels based on the week columns
  const monthLabels = useMemo(() => {
    const labels = [];
    let currentMonth = '';
    
    calendarGrid.forEach((week, index) => {
      const firstDay = week.find(d => d !== null);
      if (firstDay) {
        const parts = firstDay.dateStr.split('-');
        const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        const monthName = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
        if (monthName !== currentMonth) {
          labels.push({ text: monthName, index });
          currentMonth = monthName;
        }
      }
    });
    
    return labels;
  }, [calendarGrid]);

  // Calculate user attempting problems count
  const attemptingCount = useMemo(() => {
    if (!profileData) return 9; // default for Aaryan
    const allStats = profileData.totalSubmissions?.find(s => s.difficulty === 'All');
    if (allStats) {
      return Math.max(0, allStats.count - profileData.totalSolved);
    }
    return 0;
  }, [profileData]);

  // Handle clicking on skill tags inside Profile Dashboard to redirect to DSA patterns
  const handleSkillTagClick = (tagSlug) => {
    if (!tagSlug) return;
    const slug = tagSlug.toLowerCase().trim();
    const foundTag = sortedTags.find(t => {
      const tid = t.tagId.toLowerCase().trim();
      const nSlug = normalizeSlug(tid);
      const titleSlug = t.tagName.toLowerCase().replace(/\s+/g, '-');
      return tid === slug || nSlug === slug || titleSlug === slug;
    });

    if (foundTag) {
      setActiveTagId(foundTag.tagId);
      setActiveTab('concepts');
      setExpandedSolutionId(null);
    }
  };

  // Helper to extract slug from leetcodeUrl
  const getSlugFromUrl = (url) => {
    if (!url) return "";
    const matches = url.match(/problems\/([^\/]+)/);
    return matches ? matches[1] : "";
  };

  const fetchProblemDetails = async (problemId, titleSlug) => {
    if (!titleSlug) return;
    // If already loading or loaded, don't refetch
    if (problemDetailsCache[problemId]) return;
    
    // Set loading state
    setProblemDetailsCache(prev => ({
      ...prev,
      [problemId]: { loading: true }
    }));
    
    try {
      const cleanSlug = titleSlug.trim();
      
      // Fetch details and C++ solution in parallel
      const [apiRes, codeRes] = await Promise.all([
        fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${cleanSlug}`).catch(() => null),
        fetch(`https://raw.githubusercontent.com/kamyu104/LeetCode-Solutions/master/C%2B%2B/${cleanSlug}.cpp`).catch(() => null)
      ]);
      
      let questionHtml = '';
      let difficulty = '';
      let similarQuestions = [];
      if (apiRes && apiRes.ok) {
        try {
          const apiData = await apiRes.json();
          questionHtml = apiData.question || '';
          difficulty = apiData.difficulty || '';
          if (apiData.similarQuestions) {
            similarQuestions = typeof apiData.similarQuestions === 'string'
              ? JSON.parse(apiData.similarQuestions)
              : apiData.similarQuestions;
          }
        } catch (e) {
          console.error("Error parsing problem detail JSON:", e);
        }
      }
      
      let code = '';
      let logic = '';
      if (codeRes && codeRes.ok) {
        try {
          const rawCode = await codeRes.text();
          code = rawCode;
          
          // Try to extract Time and Space complexity from top of code
          const timeMatch = rawCode.match(/\/\/\s*Time:\s*([^\n]+)/i);
          const spaceMatch = rawCode.match(/\/\/\s*Space:\s*([^\n]+)/i);
          
          const timeComplexity = timeMatch ? timeMatch[1].trim() : 'O(N)';
          const spaceComplexity = spaceMatch ? spaceMatch[1].trim() : 'O(1)';
          
          logic = `Time Complexity: ${timeComplexity}\nSpace Complexity: ${spaceComplexity}\n\nOptimal community accepted C++ solution. This implementation is optimized to run efficiently with minimal overhead.`;
        } catch (e) {
          console.error("Error reading code text:", e);
        }
      }
      
      // Fallback code and logic if github fails
      if (!code) {
        code = `// C++ starter template for ${cleanSlug}\nclass Solution {\npublic:\n    // Solution code template\n};`;
        logic = "Time Complexity: O(N)\nSpace Complexity: O(1)\n\nCould not fetch full solution from repository. Displaying standard template.";
      }
      
      setProblemDetailsCache(prev => ({
        ...prev,
        [problemId]: {
          loading: false,
          questionHtml,
          difficulty,
          code,
          logic,
          similarQuestions,
          error: null
        }
      }));
    } catch (err) {
      setProblemDetailsCache(prev => ({
        ...prev,
        [problemId]: {
          loading: false,
          error: "Failed to load problem details.",
          code: `// Error loading solution\n// Please check your network connection.`,
          logic: "Time Complexity: N/A\nSpace Complexity: N/A"
        }
      }));
    }
  };

  // Toggle problem accordion card and fetch details
  const handleToggleSolution = (solutionId, titleSlug) => {
    const nextVal = expandedSolutionId === solutionId ? null : solutionId;
    setExpandedSolutionId(nextVal);
    if (nextVal && titleSlug) {
      fetchProblemDetails(solutionId, titleSlug);
    }
  };

  // Helper to get difficulty styles
  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0713] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-purple-950/40 bg-[#0e0a1b]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
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
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent m-0 p-0 font-sans">
              LeetCode <span className="text-purple-400">Portfolio Hub</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Developer Dashboard</p>
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
                className="bg-purple-950/30 border border-purple-900/50 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all w-28 sm:w-36 md:w-44 font-sans"
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

      {/* Sync Error Alert Banner */}
      {syncError && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 text-rose-300 px-6 py-2.5 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Error: {syncError}</span>
          </div>
          <button onClick={() => setSyncError(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Main Dashboard Layout Container */}
      <div className="flex-1 flex relative">
        
        {/* Backdrop for mobile drawer */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          />
        )}

        {/* Left Sidebar Pane */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-72 lg:w-80 border-r border-purple-950/30 bg-[#0c0818]/95 lg:bg-[#0c0818]/65
          flex flex-col transform transition-all duration-300 ease-in-out lg:relative lg:transform-none lg:z-auto
          ${mobileSidebarOpen ? 'translate-x-0 top-[73px]' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:hidden lg:w-0 lg:border-r-0' : 'lg:flex lg:w-80'}
        `}>
          {/* Sticky wrapper inside sidebar to support independent scrollbar while page scrolls */}
          <div className="flex flex-col w-full h-full lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] overflow-hidden">
            
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

        {/* Main Content Workspace Panel */}
        <main className="flex-1 p-6 lg:p-8 flex flex-col gap-6">
          
          {/* Topic Tag Banner Panel */}
          {activeTab !== 'profile' && activeTag && (
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Background gradient sphere */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl -z-10"></div>
              
              <div className="space-y-2.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                    ACTIVE PATTERN
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
                    <Sparkles size={11} className="animate-pulse" />
                    {activeTag.mySolutions.length} Curated Demos
                    {activeTagStats.userSolvedCount > 0 && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span>{activeTagStats.userSolvedCount} Solved on LeetCode</span>
                      </>
                    )}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight m-0 font-sans">
                  {activeTag.tagName}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed font-sans">
                  Comprehensive insights, optimization structures, standard templates, and my fully solved portfolio repository for {activeTag.tagName} questions.
                </p>
              </div>

              {/* Tag statistics circular chart/metrics */}
              <div className="flex items-center gap-4 bg-purple-950/20 border border-purple-900/20 rounded-2xl p-4 self-start md:self-auto min-w-[200px]">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-cyan-500/25 bg-cyan-950/20 text-cyan-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Tag Completion</span>
                  <span className="text-xl font-bold text-slate-200 font-mono">{activeTagStats.userSolvedCount} <span className="text-slate-500 text-xs">/ {activeTag.totalLeetcodeQuestions}</span></span>
                  <div className="text-xs text-purple-400 font-mono mt-0.5">{activeTagStats.percent}% Solved</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Panel Tab Switcher Header */}
          {activeTab !== 'profile' && (
            <div className="flex border-b border-purple-950/30 overflow-x-auto sidebar-scrollbar">
              <button
                onClick={() => setActiveTab('concepts')}
                className={`px-6 py-3 font-semibold text-sm tracking-wide transition-all duration-300 relative cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'concepts' 
                    ? 'text-purple-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen size={16} />
                Core Concepts
                {activeTab === 'concepts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-t-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-3 font-semibold text-sm tracking-wide transition-all duration-300 relative cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'submissions' 
                    ? 'text-purple-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code size={16} />
                My Personal Submissions
                {activeTab === 'submissions' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-t-full"></div>
                )}
              </button>
            </div>
          )}

          {/* 4. Tab Contents Viewport */}
          <div className="flex-1">
            
            {/* Tab 0: Profile Dashboard */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in text-slate-100">
                
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
                            <button
                              key={idx}
                              onClick={() => handleSkillTagClick(item.tagSlug)}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-purple-900/10 border border-purple-950/50 text-slate-300 font-medium hover:border-purple-400/50 hover:bg-purple-950/20 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                            >
                              <span>{item.tagName}</span>
                              <span className="font-mono text-[10px] bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-900/40 text-purple-300 font-bold">{item.problemsSolved}</span>
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
                            <button
                              key={idx}
                              onClick={() => handleSkillTagClick(item.tagSlug)}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-cyan-950/10 border border-cyan-950/50 text-slate-300 font-medium hover:border-cyan-400/50 hover:bg-cyan-950/20 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                            >
                              <span>{item.tagName}</span>
                              <span className="font-mono text-[10px] bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-900/40 text-cyan-300 font-bold">{item.problemsSolved}</span>
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
                            <button
                              key={idx}
                              onClick={() => handleSkillTagClick(item.tagSlug)}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-950/10 border border-emerald-950/50 text-slate-300 font-medium hover:border-emerald-400/50 hover:bg-emerald-950/20 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                            >
                              <span>{item.tagName}</span>
                              <span className="font-mono text-[10px] bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-900/40 text-emerald-300 font-bold">{item.problemsSolved}</span>
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
                  
                  {useSyncedData && profileData?.recentSubmissions && profileData.recentSubmissions.length > 0 ? (
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

              </div>
            )}
            
            {/* Tab 1: Core Concepts */}
            {activeTab === 'concepts' && activeTag && (
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
                        // Highlight keywords in the rule text dynamically
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

                {/* 2. Generalized C++ Templates Switcher & Playground */}
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
                      <div className="grid grid-cols-2 gap-3 mt-2">
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

                      {/* Selected Container Overview & Header Include */}
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
                  {(() => {
                    const stlInfo = getStlCheatSheet(activeTag.tagId);
                    return (
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
                    );
                  })()}

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
            )}

            {activeTab === 'submissions' && activeTag && (
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
                              <div className={`p-1 text-slate-400 hover:text-slate-200 transition-transform duration-300 ${
                                isExpanded ? 'rotate-180 text-purple-400' : ''
                              }`}>
                                <ChevronDown size={18} />
                              </div>
                            </div>
                          </div>

                          {/* Expanded Content Block — IDE Sub-Tabs */}
                          {isExpanded && (() => {
                            const cache = problemDetailsCache[solution.problemId];
                            const defaultSlug = solution.titleSlug || getSlugFromUrl(solution.leetcodeUrl);
                            
                            if (isExpanded && !cache && defaultSlug) {
                              fetchProblemDetails(solution.problemId, defaultSlug);
                            }

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
                                <div className="flex border-b border-purple-950/30 px-3 bg-[#0c0818]/80">
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
            )}

          </div>

        </main>
      </div>

      {/* Footer copyright */}
      <footer className="border-t border-purple-950/40 py-4.5 text-center text-xs text-slate-500 font-mono bg-[#090510]">
        LeetCode Portfolio Hub © 2026. All Rights Reserved.
      </footer>

    </div>
  );
}
