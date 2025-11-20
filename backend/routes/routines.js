const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');
const routinesController = require('../controllers/routinesController');

// trainer creates routine
router.post('/', auth, permit('trainer'), routinesController.createRoutine);

// get routine details (trainer/client/admin)
router.get('/:id', auth, routinesController.getRoutine);

// list client routines
router.get('/client/:clientId', auth, routinesController.listClientRoutines);

// update & delete
router.put('/:id', auth, routinesController.updateRoutine);
router.delete('/:id', auth, routinesController.deleteRoutine);

module.exports = router;