import authService from '../services/AuthService.js';

class AuthController {
  async signUp(req, res, next) {
    try { res.status(201).json(await authService.signUp(req.body)); }
    catch (error) { next(error); }
  }
  async signIn(req, res, next) {
    try { res.json(await authService.signIn(req.body)); }
    catch (error) { next(error); }
  }
}

export default new AuthController();
