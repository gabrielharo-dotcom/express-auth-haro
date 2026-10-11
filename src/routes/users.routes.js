import { Router } from 'express';
import controller from '../controllers/UserController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();
router.use(authenticate);
router.get('/me', controller.getMe);
router.patch('/me', controller.updateMe);
router.get('/', authorize(['admin']), controller.getAll);
router.get('/:id', authorize(['admin']), controller.getById);
export default router;
