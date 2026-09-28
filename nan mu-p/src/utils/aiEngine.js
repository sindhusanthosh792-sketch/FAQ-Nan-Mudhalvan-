const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't",
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', "can't", 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few',
  'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

function computeSimilarity(userQuery, faq) {
  const queryTokens = tokenize(userQuery);
  if (queryTokens.length === 0) return { score: 0, faq };

  const rawQuery = userQuery.toLowerCase().trim();
  const rawQuestion = faq.question.toLowerCase().trim();
  const rawAnswer = faq.answer.toLowerCase().trim();
  const rawKeywords = Array.isArray(faq.keywords)
    ? faq.keywords.map(k => k.toLowerCase().trim())
    : (faq.keywords || '').toLowerCase().split(',').map(k => k.trim());

  let score = 0;

  // 1. Exact or near-exact question match
  if (rawQuestion === rawQuery) {
    score += 150;
  } else if (rawQuestion.includes(rawQuery) || rawQuery.includes(rawQuestion)) {
    score += 90;
  }

  // 2. Keyword exact / token matches
  rawKeywords.forEach(kw => {
    if (!kw) return;
    if (rawQuery.includes(kw)) {
      score += 40;
    }
    const kwTokens = tokenize(kw);
    kwTokens.forEach(token => {
      if (queryTokens.includes(token)) {
        score += 25;
      }
    });
  });

  // 3. Question Token Match
  const questionTokens = tokenize(faq.question);
  let matchedTokensCount = 0;
  queryTokens.forEach(token => {
    if (questionTokens.includes(token)) {
      matchedTokensCount++;
      score += 25;
    }
  });

  // 4. Answer Token Match
  const answerTokens = tokenize(faq.answer);
  queryTokens.forEach(token => {
    if (answerTokens.includes(token)) {
      score += 8;
    }
  });

  // Coverage bonus: ratio of query tokens matched in question
  const coverageRatio = matchedTokensCount / queryTokens.length;
  score += Math.round(coverageRatio * 30);

  return { score, faq };
}

function processAiQuery(userQuery, faqs) {
  if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) {
    return {
      found: false,
      message: "Please enter a valid question or query."
    };
  }

  if (!faqs || faqs.length === 0) {
    return {
      found: false,
      message: "No FAQ data is currently available in the knowledge base."
    };
  }

  const scoredFaqs = faqs.map(faq => computeSimilarity(userQuery, faq));

  // Sort descending by score
  scoredFaqs.sort((a, b) => b.score - a.score);

  const topMatch = scoredFaqs[0];
  const threshold = 18; // Minimum threshold required for high-confidence match

  if (topMatch && topMatch.score >= threshold) {
    // Get related suggestions (top 2 next matches if score > 10)
    const related = scoredFaqs
      .slice(1, 4)
      .filter(item => item.score >= 12)
      .map(item => ({
        id: item.faq._id,
        question: item.faq.question,
        category: item.faq.category
      }));

    // Confidence calculation (capped at 98%)
    const confidence = Math.min(98, Math.max(60, Math.round(topMatch.score * 0.8)));

    return {
      found: true,
      faq: topMatch.faq,
      confidence: `${confidence}%`,
      related: related,
      matchScore: topMatch.score
    };
  }

  return {
    found: false,
    message: "Sorry, I couldn't find an exact or relevant FAQ answer matching your question in the system database. Please rephrase your query or select a category to browse related topics.",
    suggestedCategories: Array.from(new Set(faqs.map(f => f.category?.name).filter(Boolean))).slice(0, 5)
  };
}

module.exports = {
  tokenize,
  computeSimilarity,
  processAiQuery
};
