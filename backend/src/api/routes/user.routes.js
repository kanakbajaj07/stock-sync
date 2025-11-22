const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

/**
 * @route   GET /api/users
 * @desc    Get all users with optional filters
 * @access  Private/Admin
 */
router.get('/', userController.getUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user (Admin can assign any role)
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'MANAGER', 'STAFF'])
      .withMessage('Role must be ADMIN, MANAGER, or STAFF'),
  ],
  validate,
  userController.createUser
);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private/Admin
 */
router.get('/:id', userController.getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Private/Admin
 */
router.put(
  '/:id',
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'MANAGER', 'STAFF'])
      .withMessage('Role must be ADMIN, MANAGER, or STAFF'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  validate,
  userController.updateUser
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Private/Admin
 */
router.patch(
  '/:id/role',
  [
    body('role')
      .isIn(['ADMIN', 'MANAGER', 'STAFF'])
      .withMessage('Role must be ADMIN, MANAGER, or STAFF'),
  ],
  validate,
  userController.updateUserRole
);

/**
 * @route   PATCH /api/users/:id/toggle-active
 * @desc    Activate or deactivate a user
 * @access  Private/Admin
 */
router.patch('/:id/toggle-active', userController.toggleUserActive);

/**
 * @route   PATCH /api/users/:id/reset-password
 * @desc    Reset user password (Admin only)
 * @access  Private/Admin
 */
router.patch(
  '/:id/reset-password',
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  userController.resetUserPassword
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private/Admin
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;

