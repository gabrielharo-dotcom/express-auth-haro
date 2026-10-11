import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  process.env.JWT_SECRET = randomBytes(32).toString('hex');
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

test('El API responde al health check', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test('El perfil requiere un JWT', async () => {
  const response = await fetch(`${baseUrl}/api/users/me`);
  assert.equal(response.status, 401);
});

test('Un JWT alterado no permite acceder al perfil', async () => {
  const response = await fetch(`${baseUrl}/api/users/me`, {
    headers: { Authorization: 'Bearer token-invalido' }
  });
  assert.equal(response.status, 401);
});

test('El registro rechaza datos incompletos antes de acceder a MongoDB', async () => {
  const response = await fetch(`${baseUrl}/api/auth/signUp`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
  });
  assert.equal(response.status, 400);
});

test('La pagina de inicio de sesion se renderiza', async () => {
  const response = await fetch(`${baseUrl}/signIn`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /signInForm/);
});
