import { Router } from 'express';
import { signUp,logIn, logOut} from '../controllers/authController';
const authRouter = Router();

authRouter.post('/signup', signUp);   

authRouter.post('/login', logIn);

authRouter.post('/logout', logOut);

export default authRouter;