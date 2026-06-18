// Predefined general C++ templates for all DSA tags to ensure no tag is left without conceptual templates.
export const FALLBACK_TEMPLATES = {
  "math": [
    {
      name: "Greatest Common Divisor (GCD)",
      description: "Euclidean algorithm for calculating the greatest common divisor of two integers in O(log(min(a,b))) time.",
      code: `long long gcd(long long a, long long b) {
    while (b != 0) {
        long long temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}`
    },
    {
      name: "Primality Test (Trial Division)",
      description: "Checks if a number is prime by trial division up to sqrt(N) in O(sqrt(N)) time.",
      code: `bool isPrime(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}`
    }
  ],
  "sorting": [
    {
      name: "Quick Sort (Partitioning)",
      description: "Standard divide-and-conquer quick sort using Lomuto partition scheme.",
      code: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
    }
  ],
  "greedy": [
    {
      name: "Interval Scheduling Maximation",
      description: "Selects the maximum number of mutually compatible intervals by sorting by finish time (Greedy choice).",
      code: `struct Interval {
    int start, end;
};

int maxIntervals(vector<Interval>& intervals) {
    if (intervals.empty()) return 0;
    // Sort intervals by their end times
    sort(intervals.begin(), intervals.end(), [](const Interval& a, const Interval& b) {
        return a.end < b.end;
    });
    
    int count = 1;
    int lastEnd = intervals[0].end;
    for (size_t i = 1; i < intervals.size(); i++) {
        if (intervals[i].start >= lastEnd) {
            count++;
            lastEnd = intervals[i].end;
        }
    }
    return count;
}`
    }
  ],
  "depth-first-search": [
    {
      name: "DFS Graph Traversal (Recursive)",
      description: "Standard recursive Depth-First Search for exploring all vertices in a graph.",
      code: `void dfs(int node, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[node] = true;
    // Process current node
    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            dfs(neighbor, adj, visited);
        }
    }
}`
    }
  ],
  "binary-search": [
    {
      name: "Binary Search on Answer Space",
      description: "Search template where the solution range is monotonic, finding the minimum value satisfying a condition.",
      code: `bool isValid(vector<int>& nums, int mid, int k) {
    // Condition test logic
    return true; 
}

int binarySearchAnswer(vector<int>& nums, int k) {
    int low = 0; 
    int high = 1e9; // Define search space boundaries
    int ans = -1;
    
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (isValid(nums, mid, k)) {
            ans = mid;    // Record candidate solution
            high = mid - 1; // Try to find a smaller valid answer
        } else {
            low = mid + 1;  // Increase search search parameter
        }
    }
    return ans;
}`
    }
  ],
  "database": [
    {
      name: "SQL Relational Aggregation Template",
      description: "Common SQL framework for dynamic joins, grouping, and filtering.",
      code: `-- SQL Query template
SELECT 
    t1.id, 
    t1.name, 
    COUNT(t2.related_id) AS total_count,
    AVG(t2.score) AS average_score
FROM users t1
LEFT JOIN submissions t2 ON t1.id = t2.user_id
WHERE t2.status = 'Accepted'
GROUP BY t1.id, t1.name
HAVING total_count > 5
ORDER BY average_score DESC;`
    }
  ],
  "breadth-first-search": [
    {
      name: "BFS Shortest Path (Unweighted Graph)",
      description: "Computes the shortest distance from a start node to all other nodes in O(V + E) time.",
      code: `vector<int> bfsShortestPath(int start, int n, vector<vector<int>>& adj) {
    vector<int> dist(n, -1);
    queue<int> q;
    
    dist[start] = 0;
    q.push(start);
    
    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        
        for (int neighbor : adj[curr]) {
            if (dist[neighbor] == -1) {
                dist[neighbor] = dist[curr] + 1;
                q.push(neighbor);
            }
        }
    }
    return dist;
}`
    }
  ],
  "matrix": [
    {
      name: "2D Grid DFS Traversal",
      description: "Recursive search on a 2D matrix utilizing relative offsets for boundary-checked coordinate steps.",
      code: `int R, C;
int dr[4] = {-1, 0, 1, 0};
int dc[4] = {0, 1, 0, -1};

void dfsGrid(int r, int c, vector<vector<int>>& grid, vector<vector<bool>>& visited) {
    visited[r][c] = true;
    
    for (int i = 0; i < 4; i++) {
        int nr = r + dr[i];
        int nc = c + dc[i];
        
        // Check boundary limits and visited states
        if (nr >= 0 && nr < R && nc >= 0 && nc < C) {
            if (!visited[nr][nc] && grid[nr][nc] == 1) {
                dfsGrid(nr, nc, grid, visited);
            }
        }
    }
}`
    }
  ],
  "binary-tree": [
    {
      name: "Binary Tree Height Balancing Check",
      description: "Depth-first height checker to validate if a binary tree is height-balanced in O(N).",
      code: `int checkHeight(TreeNode* root) {
    if (root == nullptr) return 0;
    
    int leftH = checkHeight(root->left);
    if (leftH == -1) return -1;
    
    int rightH = checkHeight(root->right);
    if (rightH == -1) return -1;
    
    if (abs(leftH - rightH) > 1) return -1; // Unbalanced
    return max(leftH, rightH) + 1;
}

bool isBalanced(TreeNode* root) {
    return checkHeight(root) != -1;
}`
    }
  ],
  "bit-manipulation": [
    {
      name: "Common Bit Manipulation Tricks",
      description: "Quick bit operations: testing bit status, setting/clearing bits, and power-of-2 checks.",
      code: `class BitTricks {
public:
    bool isBitSet(int num, int i) {
        return (num & (1 << i)) != 0;
    }
    
    int setBit(int num, int i) {
        return num | (1 << i);
    }
    
    int clearBit(int num, int i) {
        return num & ~(1 << i);
    }
    
    bool isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
};`
    }
  ],
  "heap-priority-queue": [
    {
      name: "Top K Elements Tracker",
      description: "Uses a min-heap to dynamically track the K largest elements in O(N log K) time.",
      code: `vector<int> getTopK(vector<int>& nums, int k) {
    // Min-heap
    priority_queue<int, vector<int>, greater<int>> minHeap;
    for (int num : nums) {
        minHeap.push(num);
        if (minHeap.size() > k) {
            minHeap.pop();
        }
    }
    vector<int> result;
    while (!minHeap.empty()) {
        result.push_back(minHeap.top());
        minHeap.pop();
    }
    return result;
}`
    }
  ],
  "stack": [
    {
      name: "Monotonic Stack (Next Greater Element)",
      description: "Finds the next larger element for each position in an array in linear O(N) time.",
      code: `vector<int> nextGreaterElement(vector<int>& nums) {
    int n = nums.size();
    vector<int> result(n, -1);
    stack<int> st; // Stores indices
    
    for (int i = 0; i < n; i++) {
        while (!st.empty() && nums[i] > nums[st.top()]) {
            result[st.top()] = nums[i];
            st.pop();
        }
        st.push(i);
    }
    return result;
}`
    }
  ],
  "graph": [
    {
      name: "Dijkstra Shortest Path (Adjacency List)",
      description: "Computes the shortest path from a source to all nodes in a weighted graph in O((V + E) log V) time.",
      code: `vector<int> dijkstra(int src, int n, vector<vector<pair<int, int>>>& adj) {
    vector<int> dist(n, INT_MAX);
    // Min-priority queue: pair<distance, node>
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    
    dist[src] = 0;
    pq.push({0, src});
    
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        
        if (d > dist[u]) continue;
        
        for (auto& edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;
            
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`
    }
  ],
  "prefix-sum": [
    {
      name: "1D Prefix Sum Query Array",
      description: "Precomputes prefix sums to query range sum sums in O(1) time.",
      code: `class NumArray {
    vector<int> prefix;
public:
    NumArray(vector<int>& nums) {
        int n = nums.size();
        prefix.resize(n + 1, 0);
        for (int i = 0; i < n; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }
    }
    
    int sumRange(int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
};`
    }
  ],
  "sliding-window": [
    {
      name: "Fixed-size Sliding Window",
      description: "Process subarrays of a specific length K monotonically.",
      code: `int maxSubarraySum(vector<int>& nums, int k) {
    int n = nums.size();
    if (n < k) return -1;
    
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += nums[i];
    
    int maxSum = windowSum;
    for (int i = k; i < n; i++) {
        windowSum += nums[i] - nums[i - k]; // Slide right
        maxSum = max(maxSum, windowSum);
    }
    return maxSum;
}`
    }
  ],
  "backtracking": [
    {
      name: "Permutations Backtracking Framework",
      description: "Recursively explores state decision space to output all unique permutations.",
      code: `void backtrack(vector<int>& nums, vector<int>& curr, vector<bool>& used, vector<vector<int>>& result) {
    if (curr.size() == nums.size()) {
        result.push_back(curr);
        return;
    }
    for (size_t i = 0; i < nums.size(); i++) {
        if (used[i]) continue;
        
        curr.push_back(nums[i]);
        used[i] = true;
        
        backtrack(nums, curr, used, result); // Recurse
        
        used[i] = false;
        curr.pop_back(); // Backtrack
    }
}`
    }
  ],
  "union-find": [
    {
      name: "Disjoint Set Union (DSU)",
      description: "Optimized Union-Find structure with path compression and rank optimization.",
      code: `class DSU {
    vector<int> parent;
    vector<int> rank;
public:
    DSU(int n) {
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        rank.resize(n, 0);
    }
    
    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]); // Path compression
    }
    
    bool unite(int i, int j) {
        int rootI = find(i);
        int rootJ = find(j);
        if (rootI != rootJ) {
            // Union by rank
            if (rank[rootI] < rank[rootJ]) {
                parent[rootI] = rootJ;
            } else if (rank[rootI] > rank[rootJ]) {
                parent[rootJ] = rootI;
            } else {
                parent[rootJ] = rootI;
                rank[rootI]++;
            }
            return true;
        }
        return false; // Already in the same set
    }
};`
    }
  ],
  "monotonic-stack": [
    {
      name: "Monotonic Decreasing Stack",
      description: "Maintains indices of elements in decreasing order to locate the next greater element.",
      code: `vector<int> dailyTemperatures(vector<int>& temperatures) {
    int n = temperatures.size();
    vector<int> answer(n, 0);
    stack<int> st; // Monotonic stack of indices
    
    for (int i = 0; i < n; i++) {
        while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
            int idx = st.top();
            st.pop();
            answer[idx] = i - idx;
        }
        st.push(i);
    }
    return answer;
}`
    }
  ],
  "trie": [
    {
      name: "Trie (Prefix Tree) implementation",
      description: "Dynamic string dictionary tree supporting inserts, exact match search, and prefix check queries.",
      code: `class TrieNode {
public:
    TrieNode* children[26] = {nullptr};
    bool isEndOfWord = false;
};

class Trie {
    TrieNode* root = new TrieNode();
public:
    void insert(string word) {
        TrieNode* curr = root;
        for (char c : word) {
            if (!curr->children[c - 'a']) {
                curr->children[c - 'a'] = new TrieNode();
            }
            curr = curr->children[c - 'a'];
        }
        curr->isEndOfWord = true;
    }
    
    bool search(string word) {
        TrieNode* curr = root;
        for (char c : word) {
            if (!curr->children[c - 'a']) return false;
            curr = curr->children[c - 'a'];
        }
        return curr->isEndOfWord;
    }
};`
    }
  ],
  "binary-search-tree": [
    {
      name: "Binary Search Tree Validation",
      description: "Recursive check with lower and upper bounds to validate if a binary tree is a valid BST.",
      code: `bool validate(TreeNode* root, TreeNode* minNode, TreeNode* maxNode) {
    if (!root) return true;
    if (minNode && root->val <= minNode->val) return false;
    if (maxNode && root->val >= maxNode->val) return false;
    
    return validate(root->left, minNode, root) && 
           validate(root->right, root, maxNode);
}

bool isValidBST(TreeNode* root) {
    return validate(root, nullptr, nullptr);
}`
    }
  ],
  "divide-and-conquer": [
    {
      name: "Divide & Conquer Array Mid Merge",
      description: "Splits search task recursively and merges results at the middle index.",
      code: `int solveDivideConquer(vector<int>& nums, int low, int high) {
    if (low == high) return nums[low]; // Base case
    
    int mid = low + (high - low) / 2;
    int leftResult = solveDivideConquer(nums, low, mid);
    int rightResult = solveDivideConquer(nums, mid + 1, high);
    
    // Process and combine leftResult and rightResult
    return leftResult + rightResult; 
}`
    }
  ],
  "recursion": [
    {
      name: "Fibonacci Memoized Recursion",
      description: "Classic top-down dynamic programming recursion utilizing an explicit memoization cache.",
      code: `int fib(int n, vector<int>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n]; // Return cached result
    
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}`
    }
  ],
  "queue": [
    {
      name: "Queue FIFO Buffer",
      description: "Basic dynamic queue array for processing elements sequentially.",
      code: `class SimpleQueue {
    queue<int> q;
public:
    void enqueue(int val) {
        q.push(val);
    }
    int dequeue() {
        if (q.empty()) return -1;
        int val = q.front();
        q.pop();
        return val;
    }
    bool isEmpty() {
        return q.empty();
    }
};`
    }
  ],
  "topological-sort": [
    {
      name: "Topological Sort (Kahn's BFS Algorithm)",
      description: "Orders nodes in a Directed Acyclic Graph based on in-degrees in linear time.",
      code: `vector<int> topologicalSort(int n, vector<vector<int>>& adj) {
    vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++) {
        for (int v : adj[u]) inDegree[v]++;
    }
    
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) q.push(i);
    }
    
    vector<int> order;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        
        for (int v : adj[u]) {
            inDegree[v]--;
            if (inDegree[v] == 0) q.push(v);
        }
    }
    return order.size() == n ? order : vector<int>(); // returns empty if cycle exists
}`
    }
  ],
  "memoization": [
    {
      name: "Top-Down Dynamic Programming (Memoization)",
      description: "Pruning search state decisions by saving values in a state transition array.",
      code: `int memoizedSolve(int i, int w, vector<int>& wt, vector<int>& val, vector<vector<int>>& memo) {
    if (i == 0 || w == 0) return 0;
    if (memo[i][w] != -1) return memo[i][w]; // Cache hit
    
    if (wt[i - 1] <= w) {
        memo[i][w] = max(val[i - 1] + memoizedSolve(i - 1, w - wt[i - 1], wt, val, memo),
                         memoizedSolve(i - 1, w, wt, val, memo));
    } else {
        memo[i][w] = memoizedSolve(i - 1, w, wt, val, memo);
    }
    return memo[i][w];
}`
    }
  ],
  "ordered-set": [
    {
      name: "Binary search queries on std::set",
      description: "Quickly locate elements or find lower/upper bounds in sorted sets.",
      code: `void querySet() {
    set<int> orderedSet = {2, 5, 8, 12};
    // Check if element exists (O(log N))
    if (orderedSet.find(5) != orderedSet.end()) {
        // Element found
    }
    
    // Find first element >= target
    auto it = orderedSet.lower_bound(6); // Points to 8
}`
    }
  ],
  "geometry": [
    {
      name: "Line Segments Cross Product Check",
      description: "Uses cross product vectors check to analyze direction coordinates relationships.",
      code: `struct Point {
    double x, y;
};

// Returns positive for counter-clockwise, negative for clockwise, 0 if collinear
double crossProduct(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}`
    }
  ],
  "game-theory": [
    {
      name: "Minimax Game Tree Search",
      description: "Recursively scans game state transitions assuming optimal opposing plays.",
      code: `int minimax(int depth, int nodeIndex, bool isMax, vector<int>& scores, int h) {
    if (depth == h) return scores[nodeIndex]; // Leaf node
    
    if (isMax) {
        return max(minimax(depth + 1, nodeIndex * 2, false, scores, h),
                   minimax(depth + 1, nodeIndex * 2 + 1, false, scores, h));
    } else {
        return min(minimax(depth + 1, nodeIndex * 2, true, scores, h),
                   minimax(depth + 1, nodeIndex * 2 + 1, true, scores, h));
    }
}`
    }
  ],
  "segment-tree": [
    {
      name: "Segment Tree Range Queries",
      description: "Builds and queries array interval ranges recursively in O(log N).",
      code: `class SegmentTree {
    vector<int> tree;
    int n;
    
    void build(vector<int>& arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = start + (end - start) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
public:
    SegmentTree(vector<int>& arr) {
        n = arr.size();
        tree.resize(4 * n, 0);
        if (n > 0) build(arr, 1, 0, n - 1);
    }
};`
    }
  ],
  "doubly-linked-list": [
    {
      name: "Doubly Linked List Node Deletion",
      description: "Safely removes a referenced node from a doubly linked list in O(1) time.",
      code: `struct Node {
    int val;
    Node* prev = nullptr;
    Node* next = nullptr;
};

void deleteNode(Node*& head, Node* delNode) {
    if (head == nullptr || delNode == nullptr) return;
    
    if (head == delNode) {
        head = delNode->next;
    }
    if (delNode->next != nullptr) {
        delNode->next->prev = delNode->prev;
    }
    if (delNode->prev != nullptr) {
        delNode->prev->next = delNode->next;
    }
    delete delNode;
}`
    }
  ]
};
