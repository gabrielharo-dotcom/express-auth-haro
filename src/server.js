import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import seedRoles from './utils/seedRoles.js';
import seedUsers from './utils/seedUsers.js';

dotenv.config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Define JWT_SECRET con al menos 32 caracteres en .env');
}
if (!process.env.MONGODB_URI) {
  throw new Error('Define MONGODB_URI con la conexion a MongoDB Atlas');
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to MongoDB Atlas');
  await seedRoles();
  await seedUsers();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));
} catch (error) {
  console.error('No se pudo iniciar:', error.name);
  process.exitCode = 1;
  await mongoose.disconnect();
}
