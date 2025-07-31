import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {connectDB, sequelize } from './config/db.js';

// Load environment variables
dotenv.config();

// Resolve directory path (karena kita pakai ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global error handlers
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Validate DB ENV
if (!process.env.DATABASE_URL && (
  !process.env.DB_NAME || 
  !process.env.DB_USER || 
  !process.env.DB_PASSWORD || 
  !process.env.DB_HOST
)) {
  throw new Error('Database environment variables are not set properly.');
}

// Middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

connectDB();

syncDatabaseAndCreateAdmin(); // <-- Tambahkan ini


import routes from './routes/dataRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import commodityRoutes from './routes/commodityRoutes.js';

import authRoutes from './routes/authRoutes.js';
import uptRoutes from './routes/uptRoutes.js';
import newsRoutes from './routes/newsRoutes.js';

import Admin from './models/admin.js';
// eslint-disable-next-line no-unused-vars
import Upt from './models/maps.js';
// eslint-disable-next-line no-unused-vars
import News from './models/news.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connectDB();

//route dasar
app.get('/', (req, res) => {
  res.send('Backend SILINDA API running (with UPT, News & Auth)');
});

app.use('/api', routes);
app.use('/api', graphRoutes);
app.use('/api', reportRoutes);
app.use('/api/commodity', commodityRoutes);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/upt', uptRoutes);
app.use('/api/news', newsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Backend berjalan di port ${PORT}`);
  await syncDatabaseAndCreateAdmin(); // <-- Panggil di sini dengan 'await'
});

async function syncDatabaseAndCreateAdmin() {
  try {
    await sequelize.sync();
    // eslint-disable-next-line no-console
    console.log ('All models synchronized successfully');

    const existingAdmin = await Admin.findOne({ where: {username: 'Admin'} });
    if (!existingAdmin) {
      await Admin.create({
        username: 'Admin',
        password: 'Password4dmin123',
        role: 'admin', 
      });
      // eslint-disable-next-line no-console
      console.log('Admin default dibuat');
    }
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error synchronizing database models:', error);
  }
}