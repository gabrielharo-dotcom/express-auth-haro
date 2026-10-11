import bcrypt from 'bcrypt';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';
import { validPassword } from './validation.js';

export default async function seedUsers() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  if (!validPassword(password)) throw new Error('ADMIN_PASSWORD no cumple la política de contraseñas');
  if (await userRepository.findByEmail(email)) return;
  const role = await roleRepository.findByName('admin');
  await userRepository.create({
    email, password: await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10)),
    name: process.env.ADMIN_NAME || 'Admin',
    lastName: process.env.ADMIN_LAST_NAME || 'Principal',
    phoneNumber: process.env.ADMIN_PHONE_NUMBER || '999999999',
    birthdate: new Date(`${process.env.ADMIN_BIRTHDATE || '1990-01-01'}T00:00:00Z`),
    roles: [role._id]
  });
  console.log(`Administrador inicial creado: ${email}`);
}
