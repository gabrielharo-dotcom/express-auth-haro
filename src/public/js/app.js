const page = document.body.dataset.page;
const tokenKey = 'authlab_token';
const token = () => sessionStorage.getItem(tokenKey);

function tokenPayload() {
  try {
    const raw = token()?.split('.')[1];
    if (!raw) return null;
    return JSON.parse(atob(raw.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

function signedIn() {
  const payload = tokenPayload();
  return Boolean(payload && payload.exp * 1000 > Date.now());
}

function logout() {
  sessionStorage.removeItem(tokenKey);
  location.replace('/signIn');
}

function message(text, type = 'error') {
  const target = document.getElementById('message');
  if (target) {
    target.textContent = text;
    target.className = `message ${type}`;
  }
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  let response;
  try { response = await fetch(path, { ...options, headers }); }
  catch { throw new Error('No se pudo conectar con el servidor'); }
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 && !['signIn', 'signUp'].includes(page)) logout();
  if (response.status === 403) location.replace('/403');
  if (!response.ok) throw new Error(data.message || 'Ocurrió un error');
  return data;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('es-PE', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
}

function details(target, user) {
  const fields = [
    ['Nombre', `${user.name} ${user.lastName}`], ['Correo', user.email],
    ['Teléfono', user.phoneNumber], ['Nacimiento', formatDate(user.birthdate)],
    ['Edad', `${user.age} años`], ['Roles', user.roles.join(', ')],
    ['URL de perfil', user.url_profile || '—'], ['Dirección', user.address || '—'],
    ['Registro', formatDate(user.createdAt)]
  ];
  target.replaceChildren();
  for (const [label, value] of fields) {
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value;
    target.append(dt, dd);
  }
}

function initNavigation() {
  const active = signedIn();
  const roles = tokenPayload()?.roles || [];
  document.querySelectorAll('.private-link').forEach(el => { el.style.display = active ? 'list-item' : 'none'; });
  document.querySelectorAll('.admin-link').forEach(el => { el.style.display = active && roles.includes('admin') ? 'list-item' : 'none'; });
  document.getElementById('logout')?.addEventListener('click', event => { event.preventDefault(); logout(); });
  if (active) {
    const ms = tokenPayload().exp * 1000 - Date.now();
    setTimeout(logout, Math.min(ms + 100, 2147483647));
  }
}

async function loadPage() {
  initNavigation();
  const protectedPages = ['dashboard', 'admin', 'profile', 'userDetail'];
  if (protectedPages.includes(page) && !signedIn()) return logout();
  if (['admin', 'userDetail'].includes(page) && !tokenPayload().roles?.includes('admin')) {
    return location.replace('/403');
  }

  if (page === 'signIn') {
    document.getElementById('signInForm').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const result = await api('/api/auth/signIn', { method: 'POST', body: JSON.stringify(formData(event.target)) });
        sessionStorage.setItem(tokenKey, result.token);
        location.replace(result.roles.includes('admin') ? '/admin' : '/dashboard');
      } catch (error) { message(error.message); }
    });
  }

  if (page === 'signUp') {
    document.getElementById('signUpForm').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await api('/api/auth/signUp', { method: 'POST', body: JSON.stringify(formData(event.target)) });
        location.replace('/signIn?registered=1');
      } catch (error) { message(error.message); }
    });
  }

  if (page === 'signIn' && new URLSearchParams(location.search).has('registered')) {
    message('Cuenta creada. Ahora inicia sesión.', 'success');
  }

  try {
    if (page === 'dashboard') {
      const user = await api('/api/users/me');
      document.getElementById('welcomeName').textContent = user.name;
      details(document.getElementById('userSummary'), user);
    }
    if (page === 'admin') {
      const users = await api('/api/users');
      const body = document.getElementById('usersTable');
      if (!users.length) {
        const row = body.insertRow(); const cell = row.insertCell(); cell.colSpan = 5; cell.textContent = 'No hay usuarios registrados.';
      }
      for (const user of users) {
        const row = body.insertRow();
        for (const value of [`${user.name} ${user.lastName}`, user.email, user.roles.join(', '), formatDate(user.createdAt)]) {
          row.insertCell().textContent = value;
        }
        const link = document.createElement('a');
        link.href = `/users/${encodeURIComponent(user.id)}`; link.textContent = 'Ver detalle';
        row.insertCell().append(link);
      }
    }
    if (page === 'userDetail') {
      const target = document.getElementById('userDetail');
      details(target, await api(`/api/users/${encodeURIComponent(target.dataset.userId)}`));
    }
    if (page === 'profile') {
      const user = await api('/api/users/me');
      const form = document.getElementById('profileForm');
      for (const field of ['name', 'lastName', 'phoneNumber', 'birthdate', 'email', 'url_profile', 'address']) {
        form.elements[field].value = user[field] || '';
        if (user[field]) form.elements[field].parentElement.querySelector('label')?.classList.add('active');
      }
      document.getElementById('profileMeta').textContent = `Edad: ${user.age} años · Rol: ${user.roles.join(', ')} · Registro: ${formatDate(user.createdAt)}`;
      if (window.M) M.updateTextFields();
      form.addEventListener('submit', async event => {
        event.preventDefault();
        try {
          const updated = await api('/api/users/me', { method: 'PATCH', body: JSON.stringify(formData(form)) });
          form.elements.password.value = '';
          document.getElementById('profileMeta').textContent = `Edad: ${updated.age} años · Rol: ${updated.roles.join(', ')} · Registro: ${formatDate(updated.createdAt)}`;
          message('Perfil actualizado correctamente.', 'success');
        } catch (error) { message(error.message); }
      });
    }
  } catch (error) { message(error.message); }
}

loadPage();
