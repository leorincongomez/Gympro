const Attendance = require('../models/Attendance');
const Client = require('../models/Client');
const Routine = require('../models/Routine');
const { calcAttendanceStats } = require('../utils/stats');

exports.markAttendance = async (req, res) => {
  try {
    // client marks attendance for a routine on a date
    const user = req.user;
    if (user.role !== 'client') return res.status(403).json({ message: 'Only clients can mark attendance' });

    const { routineId, date, status = 'done', notes } = req.body;
    if (!routineId || !date) return res.status(400).json({ message: 'routineId and date required' });

    const clientDoc = await Client.findOne({ userId: user._id });
    if (!clientDoc) return res.status(400).json({ message: 'Client profile not found' });

    const routine = await Routine.findById(routineId);
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    if (String(routine.clientId) !== String(clientDoc._id)) return res.status(403).json({ message: 'This routine is not for you' });

    const d = new Date(date);
    // upsert attendance for that day
    const att = await Attendance.findOneAndUpdate(
      { clientId: clientDoc._id, date: d },
      { clientId: clientDoc._id, routineId, date: d, status, notes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(att);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error marking attendance' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const to = req.query.to ? new Date(req.query.to) : new Date();

    // access control: client only for self, trainer only for client they manage, admin all
    const user = req.user;
    if (user.role === 'client') {
      const clientDoc = await Client.findOne({ userId: user._id });
      if (!clientDoc || String(clientDoc._id) !== clientId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (user.role === 'trainer') {
      const trainerDoc = await require('../models/Trainer').findOne({ userId: user._id });
      const clientDoc = await Client.findById(clientId);
      if (!clientDoc || String(clientDoc.trainerId) !== String(trainerDoc._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const records = await Attendance.find({
      clientId,
      date: { $gte: from, $lte: to }
    }).sort({ date: 1 });

    const stats = calcAttendanceStats(records, from, to);
    res.json({ records, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error getting attendance' });
  }
};