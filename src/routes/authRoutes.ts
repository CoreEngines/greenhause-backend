import { Router } from 'express';
import { signUp,logIn} from '../controllers/authController';
const authRouter = Router();

authRouter.post('/signup', signUp);   

authRouter.post('/login', logIn);

export default authRouter;