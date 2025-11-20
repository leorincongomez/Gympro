require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const Client = require('../models/Client');

const seed = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);

    // cleanup
    await User.deleteMany({});
    await Trainer.deleteMany({});
    await Client.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const trainerPass = await bcrypt.hash('trainer123', salt);
    const clientPass = await bcrypt.hash('client123', salt);

    const admin = new User({ email: 'admin@gympro.com', password: adminPass, role: 'admin' });
    const trainerUser = new User({ email: 'trainer@gympro.com', password: trainerPass, role: 'trainer' });
    const clientUser = new User({ email: 'client@gympro.com', password: clientPass, role: 'client' });

    await admin.save();
    await trainerUser.save();
    await clientUser.save();

    const trainer = new Trainer({ userId: trainerUser._id, name: 'Juan Entrenador', phone: '3001112222', specialties: ['Fuerza', 'Cardio'] });
    await trainer.save();

    const client = new Client({ userId: clientUser._id, name: 'Pedro Cliente', phone: '3003334444', trainerId: trainer._id, metrics: { weight: 80, height: 175 } });
    await client.save();

    trainer.clients.push(client._id);
    await trainer.save();

    console.log('Seed completed. Users: admin@gympro.com (admin/admin123), trainer@gympro.com (trainer/trainer123), client@gympro.com (client/client123)');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();