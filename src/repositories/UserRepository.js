import User from '../models/User.js';

class UserRepository {
  create(data) { return User.create(data); }
  findByEmail(email, withPassword = false) {
    const query = User.findOne({ email }).populate('roles');
    if (withPassword) query.select('+password');
    return query.exec();
  }
  findById(id) { return User.findById(id).populate('roles').exec(); }
  getAll() { return User.find().populate('roles').sort({ createdAt: -1 }).exec(); }
  update(id, data) { return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('roles').exec(); }
}

export default new UserRepository();
