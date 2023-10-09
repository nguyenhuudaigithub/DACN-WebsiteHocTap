import express from 'express';
import {
  registrantionUser,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  socialAuth,
  updateUserInfo,
  updatePassword,
  updateProfilePicture,
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

userRoute.put('/update-user-info', isAutheticated, updateUserInfo);

userRoute.put('/update-user-password', isAutheticated, updatePassword);

userRoute.put('/update-user-avatar', isAutheticated, updateProfilePicture);

export default userRoute;
