import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import userRepository from '../repositories/UserRepository.js';
import { httpError, publicUser, validEmail, validPassword, validateProfile } from '../utils/validation.js';

class UserService {
  async getAll() { return (await userRepository.getAll()).map(publicUser); }
  async getById(id) {
    if (!mongoose.isValidObjectId(id)) throw httpError(404, 'Usuario no encontrado');
    const user = await userRepository.findById(id);
    if (!user) throw httpError(404, 'Usuario no encontrado');
    return publicUser(user);
  }
  async updateMe(id, data) {
    const birthdate = validateProfile(data);
    if (!validEmail(data.email)) throw httpError(400, 'Email no válido');
    const update = {
      name: data.name.trim(), lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phoneNumber: data.phoneNumber.trim(), birthdate,
      url_profile: data.url_profile || '', address: data.address || ''
    };
    if (data.password) {
      if (!validPassword(data.password)) throw httpError(400, 'La contraseña requiere 8 caracteres, una mayúscula, un dígito y uno de # $ % & * @');
      update.password = await bcrypt.hash(data.password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));
    }
    const user = await userRepository.update(id, update);
    if (!user) throw httpError(404, 'Usuario no encontrado');
    return publicUser(user);
  }
}

export default new UserService();
