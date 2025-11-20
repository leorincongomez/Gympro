const User = require('../models/User');
const Trainer = require('../models/Trainer');
const Client = require('../models/Client');

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'trainer') {
      profile = await Trainer.findOne({ userId: user._id }).populate('clients', 'name phone');
    } else if (user.role === 'client') {
      profile = await Client.findOne({ userId: user._id }).populate({
        path: 'trainerId',
        populate: { path: 'userId', model: 'User', select: 'email' }
      });
    }
    res.json({ user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate('clients', 'name phone');
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: list users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: change role
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};