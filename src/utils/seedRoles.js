import roleRepository from '../repositories/RoleRepository.js';

export default async function seedRoles() {
  for (const name of ['user', 'admin']) {
    if (!(await roleRepository.findByName(name))) await roleRepository.create(name);
  }
}
