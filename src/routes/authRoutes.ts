import { Router } from 'express';
import { signUp, singIn, logout, refresh,resetPassword, sendVerificationEmail, verifyEmail, forgotPassword } from '../controllers/authController';

const authRouter = Router();

authRouter.get('/logout', logout);
authRouter.get('/refresh', refresh)
authRouter.get('/request-email-verification', sendVerificationEmail);
authRouter.get('/verify', verifyEmail);

export default authRouter;