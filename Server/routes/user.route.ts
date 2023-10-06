import express from "express";
import {
  registrantionUser,
  activateUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller";
import {isAutheticated, authorizeRoles} from "../middleware/auth"
const userRoute = express.Router();

userRoute.post("/registration", registrantionUser);

userRoute.post("/activation-user", activateUser);

userRoute.post("/login", loginUser);

userRoute.post("/logout",isAutheticated,authorizeRoles("admin") , logoutUser);

export default userRoute;
