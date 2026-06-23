import React, { useState, useMemo, useEffect } from 'react';
import { 
  Code, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  X, 
  ChevronLeft, 
  Sun, 
  Moon
} from 'lucide-react';
import { mockTagsData } from './mockData';
import { PREDEFINED_PROBLEMS } from './data/predefinedProblems';
import { EDGE_CASES } from './data/edgeCases';
import { TAG_KEYWORDS } from './data/tagKeywords';
import { getDryRunTrace } from './utils/dryRunTraces';
import { FALLBACK_TEMPLATES } from './data/fallbackTemplates';
import { STL_CONTAINER_DIRECTORY } from './data/stlDirectory';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProfileDashboard from './components/ProfileDashboard';
import CoreConcepts from './components/CoreConcepts';
import PersonalSubmissions from './components/PersonalSubmissions';


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

const safeLocalStorage = {
  getItem: (key, defaultValue = '') => {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (e) {
      console.warn("Storage access denied:", e);
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied:", e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove denied:", e);
    }
  }
};

export default function App() {
  // 1. State Management
  const [activeTagId, setActiveTagId] = useState('array');
  const [activeTab, setActiveTab] = useState('profile'); // Default tab is profile dashboard!
  const [theme, setTheme] = useState(() => safeLocalStorage.getItem('theme', 'dark'));
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

  // Rival Duel Mode States
  const [rivalInputName, setRivalInputName] = useState(() => safeLocalStorage.getItem('rivalUsername', ''));
  const [rivalProfileData, setRivalProfileData] = useState(() => {
    const stored = safeLocalStorage.getItem('rivalProfileData');
    return stored ? JSON.parse(stored) : null;
  });
  const [rivalSkillsData, setRivalSkillsData] = useState(() => {
    const stored = safeLocalStorage.getItem('rivalSkillsData');
    return stored ? JSON.parse(stored) : null;
  });
  const [rivalBadgesData, setRivalBadgesData] = useState(() => {
    const stored = safeLocalStorage.getItem('rivalBadgesData');
    return stored ? JSON.parse(stored) : null;
  });
  const [syncingRival, setSyncingRival] = useState(false);
  const [rivalSyncError, setRivalSyncError] = useState(null);
  const [isDuelActive, setIsDuelActive] = useState(() => safeLocalStorage.getItem('isDuelActive') === 'true');

  useEffect(() => {
    if (rivalProfileData) {
      safeLocalStorage.setItem('rivalProfileData', JSON.stringify(rivalProfileData));
    } else {
      safeLocalStorage.removeItem('rivalProfileData');
    }
  }, [rivalProfileData]);

  useEffect(() => {
    if (rivalSkillsData) {
      safeLocalStorage.setItem('rivalSkillsData', JSON.stringify(rivalSkillsData));
    } else {
      safeLocalStorage.removeItem('rivalSkillsData');
    }
  }, [rivalSkillsData]);

  useEffect(() => {
    if (rivalBadgesData) {
      safeLocalStorage.setItem('rivalBadgesData', JSON.stringify(rivalBadgesData));
    } else {
      safeLocalStorage.removeItem('rivalBadgesData');
    }
  }, [rivalBadgesData]);

  useEffect(() => {
    safeLocalStorage.setItem('isDuelActive', isDuelActive);
  }, [isDuelActive]);
  
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
      const [profileRes, skillRes, badgesRes, calendarRes, acSubRes] = await Promise.all([
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/profile`),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/skill`).catch(() => null),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/badges`).catch(() => null),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/calendar`).catch(() => null),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/acSubmission`).catch(() => null)
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

      let acSubInfo = { count: 0, submission: [] };
      if (acSubRes && acSubRes.ok) {
        try {
          acSubInfo = await acSubRes.json();
        } catch (e) {
          console.error("Error parsing accepted submissions JSON:", e);
        }
      }
      const subList = (acSubInfo && acSubInfo.submission) ? acSubInfo.submission : [];

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
        recentSubmissions: subList.map(s => ({
          title: s.title,
          titleSlug: s.titleSlug,
          status: s.statusDisplay || 'Accepted',
          lang: s.lang || 'cpp'
        })),
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

  // Mock Rival profile data for demonstration fallback
  const MOCK_RIVAL_DATA = {
    profile: {
      username: 'leetcode_challenger',
      name: 'ByteCrusher',
      ranking: '82,140',
      avatar: 'https://assets.leetcode.com/users/default_avatar.jpg',
      totalSolved: 615,
      easySolved: 220,
      totalEasy: 830,
      mediumSolved: 335,
      totalMedium: 1620,
      hardSolved: 60,
      totalHard: 700,
      totalQuestions: 3150,
      recentSubmissions: [
        { title: "Two Sum", titleSlug: "two-sum", status: "Accepted", difficulty: "Easy" },
        { title: "Longest Palindromic Substring", titleSlug: "longest-palindromic-substring", status: "Accepted", difficulty: "Medium" },
        { title: "Merge k Sorted Lists", titleSlug: "merge-k-sorted-lists", status: "Accepted", difficulty: "Hard" },
        { title: "Edit Distance", titleSlug: "edit-distance", status: "Accepted", difficulty: "Hard" },
        { title: "Binary Tree Maximum Path Sum", titleSlug: "binary-tree-maximum-path-sum", status: "Accepted", difficulty: "Hard" },
        { title: "Regular Expression Matching", titleSlug: "regular-expression-matching", status: "Accepted", difficulty: "Hard" },
        { title: "Valid Parentheses", titleSlug: "valid-parentheses", status: "Accepted", difficulty: "Easy" },
        { title: "Subarray Sum Equals K", titleSlug: "subarray-sum-equals-k", status: "Accepted", difficulty: "Medium" },
        { title: "Container With Most Water", titleSlug: "container-with-most-water", status: "Accepted", difficulty: "Medium" },
        { title: "Climbing Stairs", titleSlug: "climbing-stairs", status: "Accepted", difficulty: "Easy" }
      ]
    },
    skills: {
      fundamental: [
        { tagSlug: 'array', problemsSolved: 120 },
        { tagSlug: 'string', problemsSolved: 90 },
        { tagSlug: 'sorting', problemsSolved: 50 }
      ],
      intermediate: [
        { tagSlug: 'dynamic-programming', problemsSolved: 75 },
        { tagSlug: 'depth-first-search', problemsSolved: 65 },
        { tagSlug: 'binary-search', problemsSolved: 45 },
        { tagSlug: 'greedy', problemsSolved: 30 }
      ],
      advanced: [
        { tagSlug: 'graph', problemsSolved: 25 }
      ]
    },
    badges: {
      badgesCount: 12,
      badges: [],
      upcomingBadges: [],
      activeBadge: null
    }
  };

  // Sync rival profile function
  const handleSyncRival = async (usernameToSync) => {
    if (!usernameToSync.trim()) return;
    setSyncingRival(true);
    setRivalSyncError(null);
    try {
      const cleanUsername = usernameToSync.trim();
      safeLocalStorage.setItem('rivalUsername', cleanUsername);

      if (cleanUsername.toLowerCase() === 'rival_demo' || cleanUsername.toLowerCase() === 'demo') {
        // Simulate loading for 1s
        await new Promise(resolve => setTimeout(resolve, 800));
        setRivalProfileData(MOCK_RIVAL_DATA.profile);
        setRivalSkillsData(MOCK_RIVAL_DATA.skills);
        setRivalBadgesData(MOCK_RIVAL_DATA.badges);
        setIsDuelActive(true);
        return;
      }
      
      // Fetch rival profile, skills, badges, and accepted submissions in parallel
      const [profileRes, skillRes, badgesRes, acSubRes] = await Promise.all([
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/profile`),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/skill`).catch(() => null),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/badges`).catch(() => null),
        fetch(`https://alfa-leetcode-api.onrender.com/${cleanUsername}/acSubmission`).catch(() => null)
      ]);
      
      if (!profileRes || !profileRes.ok) {
        throw new Error("Could not find LeetCode profile for this rival.");
      }
      const profileInfo = await profileRes.json();
      
      let skillInfo = { fundamental: [], intermediate: [], advanced: [] };
      if (skillRes && skillRes.ok) {
        try {
          skillInfo = await skillRes.json();
        } catch (e) {
          console.error("Error parsing rival skill JSON:", e);
        }
      }
      
      let badgesInfo = { badgesCount: 0, badges: [], upcomingBadges: [], activeBadge: null };
      if (badgesRes && badgesRes.ok) {
        try {
          badgesInfo = await badgesRes.json();
        } catch (e) {
          console.error("Error parsing rival badges JSON:", e);
        }
      }

      let acSubInfo = { count: 0, submission: [] };
      if (acSubRes && acSubRes.ok) {
        try {
          acSubInfo = await acSubRes.json();
        } catch (e) {
          console.error("Error parsing rival accepted submissions JSON:", e);
        }
      }
      const subList = (acSubInfo && acSubInfo.submission) ? acSubInfo.submission : [];

      setRivalProfileData({
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
        recentSubmissions: subList.map(s => ({
          title: s.title,
          titleSlug: s.titleSlug,
          status: s.statusDisplay || 'Accepted',
          lang: s.lang || 'cpp'
        })),
        totalSubmissions: profileInfo.totalSubmissions || []
      });

      setRivalSkillsData(skillInfo);
      setRivalBadgesData(badgesInfo);
      setIsDuelActive(true);
    } catch (err) {
      setRivalSyncError(err.message || "Failed to sync rival. Please verify username.");
    } finally {
      setSyncingRival(false);
    }
  };

  // Trigger sync on mount for user Aaryan
  useEffect(() => {
    handleSyncProfile('68yxxnyWG8');
  }, []);

  // Sync theme with HTML root class
  useEffect(() => {
    document.documentElement.className = theme;
    safeLocalStorage.setItem('theme', theme);
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

  const rivalSkillsMap = useMemo(() => {
    const map = new Map();
    if (!rivalSkillsData) return map;
    
    const { fundamental = [], intermediate = [], advanced = [] } = rivalSkillsData;
    [...fundamental, ...intermediate, ...advanced].forEach(item => {
      if (item && item.tagSlug) {
        map.set(item.tagSlug.toLowerCase().trim(), item.problemsSolved);
      }
    });
    return map;
  }, [rivalSkillsData]);

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

  const userSolvedSet = useMemo(() => {
    const solvedSet = new Set();
    
    if (profileData && profileData.recentSubmissions) {
      profileData.recentSubmissions.forEach(sub => {
        if (sub.status === 'Accepted' || sub.status === 'accepted') {
          solvedSet.add(sub.titleSlug.toLowerCase().trim());
        }
      });
    }

    mockTagsData.forEach(tag => {
      // 1. Handcrafted solutions
      if (tag.mySolutions) {
        tag.mySolutions.forEach(sol => {
          const slug = sol.titleSlug || (sol.leetcodeUrl ? sol.leetcodeUrl.split('/problems/')[1]?.split('/')[0] : null) || (sol.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
          if (slug) {
            solvedSet.add(slug.toLowerCase().trim());
          }
        });
      }

      // 2. Synced solved count check
      if (useSyncedData && skillsData) {
        const { userSolvedCount } = getTagStats(tag);
        const handcraftedCount = tag.mySolutions ? tag.mySolutions.length : 0;
        if (handcraftedCount < userSolvedCount) {
          const needed = userSolvedCount - handcraftedCount;
          const tagLower = tag.tagId.toLowerCase();
          
          let predefined = PREDEFINED_PROBLEMS[tagLower] || [];
          if (tagLower === 'trees' || tagLower === 'tree') {
            predefined = [...(PREDEFINED_PROBLEMS['trees'] || []), ...(PREDEFINED_PROBLEMS['binary-tree'] || [])];
          } else if (tagLower === 'binary-tree') {
            predefined = [...(PREDEFINED_PROBLEMS['binary-tree'] || []), ...(PREDEFINED_PROBLEMS['trees'] || [])];
          } else if (tagLower === 'heap-priority-queue') {
            predefined = PREDEFINED_PROBLEMS['heap-priority-queue'] || [];
          }
          
          const existingIds = new Set(tag.mySolutions ? tag.mySolutions.map(s => s.problemId) : []);
          let predefinedIndex = 0;
          let added = 0;
          
          while (added < needed && predefinedIndex < predefined.length) {
            const candidate = predefined[predefinedIndex++];
            if (!existingIds.has(candidate.problemId)) {
              if (candidate.titleSlug) {
                solvedSet.add(candidate.titleSlug.toLowerCase().trim());
              }
              existingIds.add(candidate.problemId);
              added++;
            }
          }
        }
      }
    });

    return solvedSet;
  }, [profileData, useSyncedData, skillsData, getTagStats]);

  const targetProblems = useMemo(() => {
    if (!rivalProfileData || !rivalProfileData.recentSubmissions) return [];
    
    const gaps = [];
    const seen = new Set();

    rivalProfileData.recentSubmissions.forEach(sub => {
      const isAccepted = sub.status === 'Accepted' || sub.status === 'accepted' || sub.status === 'Normal' || !sub.status;
      if (!isAccepted) return;

      const slug = sub.titleSlug.toLowerCase().trim();
      if (!userSolvedSet.has(slug) && !seen.has(slug)) {
        seen.add(slug);
        
        let resolvedTag = 'Practice';
        for (const [tagKey, problems] of Object.entries(PREDEFINED_PROBLEMS)) {
          if (problems.some(p => p.titleSlug === sub.titleSlug)) {
            resolvedTag = tagKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            break;
          }
        }

        gaps.push({
          title: sub.title,
          titleSlug: sub.titleSlug,
          difficulty: sub.difficulty || 'Medium',
          tag: resolvedTag,
          leetcodeUrl: `https://leetcode.com/problems/${sub.titleSlug}/`
        });
      }
    });

    return gaps;
  }, [rivalProfileData, userSolvedSet]);

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

    const getGridCoordinates = (lvl, maxR = 95) => {
      return angles.map(angle => {
        const x = 150 + (lvl * maxR) * Math.cos(angle);
        const y = 150 + (lvl * maxR) * Math.sin(angle);
        return { x, y };
      });
    };

    return { userPoints, rivalPoints, maxValue, getGridCoordinates };
  }, [topics, angles, userSkillsMap, rivalSkillsMap]);

  const userCoords = radarData.userPoints;
  const rivalCoords = radarData.rivalPoints;
  const maxValue = radarData.maxValue;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0713] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">

      {/* 1. Header Navigation Bar */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        theme={theme}
        setTheme={setTheme}
        useSyncedData={useSyncedData}
        setUseSyncedData={setUseSyncedData}
        profileData={profileData}
        setProfileData={setProfileData}
        setSkillsData={setSkillsData}
        setBadgesData={setBadgesData}
        setCalendarData={setCalendarData}
        inputUsername={inputUsername}
        setInputUsername={setInputUsername}
        handleSyncProfile={handleSyncProfile}
        syncing={syncing}
        setSyncError={setSyncError}
        stats={stats}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          />
        )}

        {/* Left Sidebar Pane */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeTagId={activeTagId}
          setActiveTagId={setActiveTagId}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredTags={filteredTags}
          getTagStats={getTagStats}
          setExpandedSolutionId={setExpandedSolutionId}
        />

        {/* Main Content Workspace Panel */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

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
                    ✨ {activeTag.mySolutions.length} Curated Demos
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

              {/* Tag statistics metrics */}
              <div className="flex items-center gap-4 bg-purple-950/20 border border-purple-900/20 rounded-2xl p-4 self-start md:self-auto min-w-[200px]">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-cyan-500/25 bg-cyan-950/20 text-cyan-400">
                  💻
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
              <ProfileDashboard
                profileData={profileData}
                stats={stats}
                attemptingCount={attemptingCount}
                skillsData={skillsData}
                badgesData={badgesData}
                calendarData={calendarData}
                monthLabels={monthLabels}
                calendarGrid={calendarGrid}
                isDuelActive={isDuelActive}
                setIsDuelActive={setIsDuelActive}
                rivalProfileData={rivalProfileData}
                setRivalProfileData={setRivalProfileData}
                rivalSkillsData={rivalSkillsData}
                setRivalSkillsData={setRivalSkillsData}
                rivalBadgesData={rivalBadgesData}
                setRivalBadgesData={setRivalBadgesData}
                rivalInputName={rivalInputName}
                setRivalInputName={setRivalInputName}
                handleSyncRival={handleSyncRival}
                syncingRival={syncingRival}
                rivalSyncError={rivalSyncError}
                userSkillsMap={userSkillsMap}
                rivalSkillsMap={rivalSkillsMap}
                targetProblems={targetProblems}
                handleSkillTagClick={handleSkillTagClick}
              />
            )}

            {/* Tab 1: Core Concepts */}
            {activeTab === 'concepts' && activeTag && (
              <CoreConcepts
                activeTag={activeTag}
                activeTemplateIndex={activeTemplateIndex}
                setActiveTemplateIndex={setActiveTemplateIndex}
                selectedStlContainer={selectedStlContainer}
                setSelectedStlContainer={setSelectedStlContainer}
                stlSearchQuery={stlSearchQuery}
                setStlSearchQuery={setStlSearchQuery}
                copiedMethodName={copiedMethodName}
                handleCopyMethod={handleCopyMethod}
                getTagKeywords={getTagKeywords}
                getEdgeCases={getEdgeCases}
                getStlCheatSheet={getStlCheatSheet}
              />
            )}

            {/* Tab 2: Personal Submissions */}
            {activeTab === 'submissions' && activeTag && (
              <PersonalSubmissions
                activeTag={activeTag}
                submissionSearchQuery={submissionSearchQuery}
                setSubmissionSearchQuery={setSubmissionSearchQuery}
                difficultyFilter={difficultyFilter}
                setDifficultyFilter={setDifficultyFilter}
                setVisibleQuestionsCount={setVisibleQuestionsCount}
                activeTagDifficultyStats={activeTagDifficultyStats}
                filteredSolvedQuestions={filteredSolvedQuestions}
                visibleQuestionsCount={visibleQuestionsCount}
                expandedSolutionId={expandedSolutionId}
                handleToggleSolution={handleToggleSolution}
                expandedSubTabs={expandedSubTabs}
                setExpandedSubTabs={setExpandedSubTabs}
                problemDetailsCache={problemDetailsCache}
                dryRunState={dryRunState}
                setDryRunState={setDryRunState}
                getDifficultyStyles={getDifficultyStyles}
                getTagStats={getTagStats}
                getDryRunTrace={getDryRunTrace}
                getSlugFromUrl={getSlugFromUrl}
              />
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
