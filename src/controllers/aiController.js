const FAQ = require('../models/FAQ');
const { processAiQuery } = require('../utils/aiEngine');

// @desc    Ask AI FAQ Assistant
// @route   POST /api/ai/ask
// @access  Public
const askAI = async (req, res, next) => {
  try {
    const userQuery = req.body.question || req.body.query;

    if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid question for the AI FAQ Assistant'
      });
    }

    const question = userQuery.trim();

    // Retrieve all active FAQs with categories
    const faqs = await FAQ.find().populate('category', 'name description');

    // Run custom AI similarity matching algorithm
    const aiResult = processAiQuery(question.trim(), faqs);

    res.status(200).json({
      success: true,
      query: question.trim(),
      timestamp: new Date().toISOString(),
      ...aiResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askAI
};
