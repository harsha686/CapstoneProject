/**
 * levenshtein.js
 * Computes the edit distance between two strings.
 * Used by the voice assistant to fuzzy-match spoken candidate names.
 */

/**
 * @param {string} a
 * @param {string} b
 * @returns {number} edit distance
 */
export function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}

/**
 * Normalise a string for matching:
 *  - lowercase
 *  - remove punctuation
 *  - collapse whitespace
 */
export function normalise(str = '') {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Match a spoken transcript against a list of candidates.
 * Strategy:
 *   1. Exact substring  (greedy, no cost)
 *   2. Word-level Levenshtein ≤ 2 on each candidate name token
 * Returns the best matching candidate object or null.
 *
 * @param {string} transcript
 * @param {Array<{id, name}>} candidates
 * @returns {{candidate, score} | null}
 */
export function matchCandidate(transcript, candidates) {
    const t = normalise(transcript);
    let best = null;
    let bestScore = Infinity;

    for (const candidate of candidates) {
        const cName = normalise(candidate.name);

        // Strategy 1 – exact substring
        if (t.includes(cName) || cName.includes(t)) {
            return { candidate, score: 0 };
        }

        // Strategy 2 – word-level fuzzy
        const cTokens = cName.split(' ');
        const tTokens = t.split(' ');
        let minDist = Infinity;
        for (const ct of cTokens) {
            for (const tt of tTokens) {
                const d = levenshtein(ct, tt);
                if (d < minDist) minDist = d;
            }
        }
        if (minDist < bestScore) {
            bestScore = minDist;
            best = candidate;
        }
    }

    // Accept only if best word-level distance is ≤ 2
    return bestScore <= 2 ? { candidate: best, score: bestScore } : null;
}
