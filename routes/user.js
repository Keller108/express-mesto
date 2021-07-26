const router = require('express').Router();
const {
  getUsers, getUserId, updateProfile, updateAvatar,
} = require('../controllers/user');

router.get('/users', getUsers);
router.get('/users/:userId', getUserId);
router.patch('/users/me', updateProfile);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;
