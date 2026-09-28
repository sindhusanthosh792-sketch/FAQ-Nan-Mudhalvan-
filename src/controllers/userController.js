const User = require('../models/User');
const FAQ = require('../models/FAQ');
const Category = require('../models/Category');

// @desc    Get all registered users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system dashboard statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFaqs = await FAQ.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Fetch recent 5 FAQs
    const recentFaqs = await FAQ.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Category distribution
    const categories = await Category.find();
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await FAQ.countDocuments({ category: cat._id });
        return {
          name: cat.name,
          faqCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFaqs,
        totalCategories,
        recentFaqs,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (user or admin)'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getStats,
  deleteUser,
  updateUserRole
};
