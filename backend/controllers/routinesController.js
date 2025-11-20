const Routine = require('../models/Routine');
const Client = require('../models/Client');
const Trainer = require('../models/Trainer');

exports.createRoutine = async (req, res) => {
  try {
    const trainerUser = req.user;
    // only trainers allowed (we'll also enforce with middleware)
    if (trainerUser.role !== 'trainer') return res.status(403).json({ message: 'Only trainers can create routines' });

    const { clientId, title, description, exercises, schedule } = req.body;
    if (!clientId || !title) return res.status(400).json({ message: 'clientId and title required' });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // get trainer doc
    const trainerDoc = await Trainer.findOne({ userId: trainerUser._id });
    if (!trainerDoc) return res.status(400).json({ message: 'Trainer profile not found' });

    // ensure trainer manages this client (optional - if trainer should only manage own clients)
    if (String(client.trainerId) !== String(trainerDoc._id)) {
      return res.status(403).json({ message: 'You do not manage this client' });
    }

    const routine = new Routine({
      clientId,
      trainerId: trainerDoc._id,
      title,
      description,
      exercises,
      schedule
    });
    await routine.save();
    res.status(201).json(routine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating routine' });
  }
};

exports.getRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate('clientId', 'name').populate('trainerId', 'name phone');
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    // allow trainer/admin or owner client
    const user = req.user;
    if (user.role === 'client') {
      const clientDoc = await Client.findOne({ userId: user._id });
      if (!clientDoc || String(clientDoc._id) !== String(routine.clientId._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (user.role === 'trainer') {
      // ensure trainer owns it
      const trainerDoc = await Trainer.findOne({ userId: user._id });
      if (!trainerDoc || String(trainerDoc._id) !== String(routine.trainerId._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    res.json(routine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listClientRoutines = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    // ensure requester has access
    const user = req.user;
    if (user.role === 'client') {
      const clientDoc = await Client.findOne({ userId: user._id });
      if (!clientDoc || String(clientDoc._id) !== clientId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (user.role === 'trainer') {
      const trainerDoc = await Trainer.findOne({ userId: user._id });
      const clientDoc = await Client.findById(clientId);
      if (!clientDoc || String(clientDoc.trainerId) !== String(trainerDoc._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    const routines = await Routine.find({ clientId });
    res.json(routines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    // only trainer who created it or admin
    const user = req.user;
    if (user.role === 'trainer') {
      const trainerDoc = await Trainer.findOne({ userId: user._id });
      if (!trainerDoc || String(trainerDoc._id) !== String(routine.trainerId)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    Object.assign(routine, req.body);
    await routine.save();
    res.json(routine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating routine' });
  }
};

exports.deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    const user = req.user;
    if (user.role === 'trainer') {
      const trainerDoc = await Trainer.findOne({ userId: user._id });
      if (!trainerDoc || String(trainerDoc._id) !== String(routine.trainerId)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await routine.remove();
    res.json({ message: 'Routine deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting routine' });
  }
};