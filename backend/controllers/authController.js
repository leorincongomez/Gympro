const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const Client = require('../models/Client');

/**
 * Helper to sign token
 */
const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role = 'client', name, phone, trainerId } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashed, role });
    await user.save();

    if (role === 'trainer') {
      const trainer = new Trainer({ userId: user._id, name: name || '', phone: phone || '' });
      await trainer.save();
    }

    if (role === 'client') {
      const client = new Client({ userId: user._id, name: name || '', phone: phone || '', trainerId: trainerId || null });
      await client.save();

      // link client to trainer if trainerId provided
      if (trainerId) {
        const trainerDoc = await Trainer.findById(trainerId);
        if (trainerDoc) {
          trainerDoc.clients.push(client._id);
          await trainerDoc.save();
        }
      }
    }

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error logging in' });
  }
};