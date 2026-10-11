import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/', (_req, res) => res.redirect('/signIn'));
for (const page of ['signIn', 'signUp', 'dashboard', 'admin', 'profile', '403']) {
  app.get(`/${page}`, (_req, res) => res.render(page));
}
app.get('/users/:id', (req, res) => res.render('user-detail', { id: req.params.id }));

app.use('/api', (_req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use((_req, res) => res.status(404).render('404'));
app.use((error, _req, res, _next) => {
  const status = error.code === 11000 ? 409 : error.status || 500;
  if (status >= 500) console.error('Request error:', error.name);
  const message = error.code === 11000 ? 'El email ya está en uso' :
    status === 500 ? 'Error interno del servidor' : error.message;
  res.status(status).json({ message });
});

export default app;
