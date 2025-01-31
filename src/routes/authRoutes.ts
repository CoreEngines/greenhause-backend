import { Router } from 'express';
import { signUp } from '../controllers/authController';

const authRouter = Router();

authRouter.post('/signup', signUp);   

export default authRouter;