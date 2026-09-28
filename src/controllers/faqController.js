const FAQ = require('../models/FAQ');
const Category = require('../models/Category');

// @desc    Get all FAQs (with optional category & search filter)
// @route   GET /api/faqs
// @access  Public
const getFAQs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { question: searchRegex },
        { answer: searchRegex },
        { keywords: searchRegex }
      ];
    }

    const faqs = await FAQ.find(query)
      .populate('category', 'name description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single FAQ by ID
// @route   GET /api/faqs/:id
// @access  Public
const getFAQById = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id).populate('category', 'name description');
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Increment view count
    faq.views = (faq.views || 0) + 1;
    await faq.save();

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create FAQ
// @route   POST /api/faqs
// @access  Private/Admin
const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, keywords } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({
        success: false,
        message: 'Question, Answer, and Category are required'
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected Category does not exist'
      });
    }

    // Parse keywords array
    let keywordArray = [];
    if (Array.isArray(keywords)) {
      keywordArray = keywords.map(k => k.trim()).filter(Boolean);
    } else if (typeof keywords === 'string') {
      keywordArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category,
      keywords: keywordArray
    });

    const populatedFaq = await FAQ.findById(faq._id).populate('category', 'name description');

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: populatedFaq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
const updateFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, keywords } = req.body;

    let faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Selected Category does not exist'
        });
      }
      faq.category = category;
    }

    if (question !== undefined) faq.question = question.trim();
    if (answer !== undefined) faq.answer = answer.trim();

    if (keywords !== undefined) {
      if (Array.isArray(keywords)) {
        faq.keywords = keywords.map(k => k.trim()).filter(Boolean);
      } else if (typeof keywords === 'string') {
        faq.keywords = keywords.split(',').map(k => k.trim()).filter(Boolean);
      }
    }

    faq.updatedAt = Date.now();
    await faq.save();

    const updatedFaq = await FAQ.findById(faq._id).populate('category', 'name description');

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: updatedFaq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await faq.deleteOne();

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ
};
