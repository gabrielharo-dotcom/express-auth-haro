export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export function validPassword(value) {
  return typeof value === 'string' && value.length >= 8 && /[A-Z]/.test(value)
    && /\d/.test(value) && /[#$%&*@]/.test(value);
}

export function validEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validateProfile(data) {
  for (const field of ['name', 'lastName', 'phoneNumber', 'birthdate']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      throw httpError(400, `${field} es requerido`);
    }
  }
  const date = new Date(`${data.birthdate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthdate) || Number.isNaN(date.getTime())
      || date.toISOString().slice(0, 10) !== data.birthdate || date > new Date()) {
    throw httpError(400, 'La fecha de nacimiento no es válida');
  }
  if (data.url_profile && !/^https?:\/\//i.test(data.url_profile)) {
    throw httpError(400, 'La URL del perfil debe comenzar con http:// o https://');
  }
  return date;
}

export function publicUser(user) {
  const birthday = new Date(user.birthdate);
  const now = new Date();
  let age = now.getUTCFullYear() - birthday.getUTCFullYear();
  if (now.getUTCMonth() < birthday.getUTCMonth() ||
      (now.getUTCMonth() === birthday.getUTCMonth() && now.getUTCDate() < birthday.getUTCDate())) age--;
  return {
    id: String(user._id), name: user.name, lastName: user.lastName,
    email: user.email, phoneNumber: user.phoneNumber,
    birthdate: birthday.toISOString().slice(0, 10), age,
    url_profile: user.url_profile || '', address: user.address || '',
    roles: user.roles.map(role => role.name), createdAt: user.createdAt
  };
}
