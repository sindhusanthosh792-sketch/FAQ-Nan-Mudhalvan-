const express = require('express');
const router = express.Router();
const {
  getUsers,
  getStats,
  deleteUser,
  updateUserRole
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.get('/stats', protect, admin, getStats);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
