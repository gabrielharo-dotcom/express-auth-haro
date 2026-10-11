import userService from '../services/UserService.js';

class UserController {
  async getAll(req, res, next) {
    try { res.json(await userService.getAll()); }
    catch (error) { next(error); }
  }
  async getMe(req, res, next) {
    try { res.json(await userService.getById(req.userId)); }
    catch (error) { next(error); }
  }
  async getById(req, res, next) {
    try { res.json(await userService.getById(req.params.id)); }
    catch (error) { next(error); }
  }
  async updateMe(req, res, next) {
    try { res.json(await userService.updateMe(req.userId, req.body)); }
    catch (error) { next(error); }
  }
}

export default new UserController();
