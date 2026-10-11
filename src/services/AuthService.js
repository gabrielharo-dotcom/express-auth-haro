import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';
import { httpError, publicUser, validEmail, validPassword, validateProfile } from '../utils/validation.js';

class AuthService {
  async signUp(data) {
    const email = String(data.email || '').trim().toLowerCase();
    if (!validEmail(email)) throw httpError(400, 'Email no válido');
    if (!validPassword(data.password)) throw httpError(400, 'La contraseña requiere 8 caracteres, una mayúscula, un dígito y uno de # $ % & * @');
    const birthdate = validateProfile(data);
    if (await userRepository.findByEmail(email)) throw httpError(409, 'El email ya está en uso');
    const role = await roleRepository.findByName('user');
    const password = await bcrypt.hash(data.password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));
    const user = await userRepository.create({
      name: data.name.trim(), lastName: data.lastName.trim(), email, password,
      phoneNumber: data.phoneNumber.trim(), birthdate,
      url_profile: data.url_profile || '', address: data.address || '', roles: [role._id]
    });
    user.roles = [role];
    return publicUser(user);
  }

  async signIn({ email, password }) {
    if (!email || !password) throw httpError(400, 'Email y contraseña son requeridos');
    const user = await userRepository.findByEmail(String(email).trim().toLowerCase(), true);
    if (!user || !(await bcrypt.compare(password, user.password))) throw httpError(401, 'Credenciales inválidas');
    const roles = user.roles.map(role => role.name);
    return {
      token: jwt.sign({ sub: String(user._id), roles }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }),
      roles
    };
  }
}

export default new AuthService();
