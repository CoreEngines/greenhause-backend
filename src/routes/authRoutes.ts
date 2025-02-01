import { Router } from 'express';
import { signUp, singIn, logout, refresh, sendVerificationEmail, verifyEmail, forgotPassword } from '../controllers/authController';

const authRouter = Router();

authRouter.post('/sign-up', signUp);   
authRouter.post('/sign-in', singIn);
authRouter.post('/logout', logout);
authRouter.get('/refresh', refresh)
authRouter.get('/request-email-verification', sendVerificationEmail);
authRouter.get('/verify', verifyEmail);
authRouter.get('/forgot-password', forgotPassword);

export default authRouter;