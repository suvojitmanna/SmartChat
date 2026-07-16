import express from'express'
import { getPublishedImages, getUser, googleLogin, loginUser, registerUser } from '../controller/usercontroller.js';
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post("/google-login", googleLogin);
userRouter.get('/data',protect, getUser)
userRouter.get('/published-images',getPublishedImages)

export default userRouter;