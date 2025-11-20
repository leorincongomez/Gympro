const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');
const { getMe, getTrainer, listUsers, changeRole } = require('../controllers/usersController');

router.get('/me', auth, getMe);
router.get('/trainer/:id', auth, getTrainer);

// admin routes
router.get('/', auth, permit('admin'), listUsers);
router.put('/:id/role', auth, permit('admin'), changeRole);

module.exports = router;