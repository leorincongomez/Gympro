const path = require('path');

// Cargar variables desde .env.local en la raíz del proyecto
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const routineRoutes = require('./routes/routines');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5001;

// Verificar que las variables se cargan
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Cargada' : '❌ No encontrada');
console.log('PORT:', process.env.PORT);

connectDB(process.env.MONGODB_URI);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => res.send('GymPro Backend running'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});