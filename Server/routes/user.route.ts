import express from 'express';
import {
  registrantionUser,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  socialAuth,
} from '../controllers/user.controller';
import { isAutheticated } from '../middleware/auth';
const userRoute = express.Router();

userRoute.post('/registration', registrantionUser);

userRoute.post('/activation-user', activateUser);

userRoute.post('/login', loginUser);

userRoute.get('/logout', isAutheticated, logoutUser);

userRoute.get('/refresh', updateAccessToken);

userRoute.get('/me', isAutheticated, getUserInfo);

userRoute.post('/social-auth', socialAuth);

export default userRoute;
