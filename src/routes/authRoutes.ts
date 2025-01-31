import { Router } from 'express';
import { signUp, singIn, logout, refresh} from '../controllers/authController';

const authRouter = Router();

authRouter.post('/sign-up', signUp);   
authRouter.post('/sign-in', singIn);
authRouter.post('/logout', logout);
authRouter.get('/refresh', refresh)

export default authRouter;