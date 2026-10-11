import { Router } from 'express';
import controller from '../controllers/AuthController.js';

const router = Router();
router.post('/signUp', controller.signUp);
router.post('/signIn', controller.signIn);
export default router;
