const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

router.post('/', auth, attendanceController.markAttendance);
router.get('/client/:clientId', auth, attendanceController.getAttendance);

module.exports = router;