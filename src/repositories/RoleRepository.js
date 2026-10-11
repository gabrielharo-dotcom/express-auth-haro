import Role from '../models/Role.js';

class RoleRepository {
  findByName(name) { return Role.findOne({ name }).exec(); }
  create(name) { return Role.create({ name }); }
  getAll() { return Role.find().exec(); }
}

export default new RoleRepository();
