require("dotenv").config();
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import senMail from "../utils/sendMail";
import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";

// Đăng ký tài khoản
interface IRegistrantionBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrantionUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email đã tồn tại", 400));
      }

      const user: IRegistrantionBody = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);

      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await senMail({
          email: user.email,
          subject: "Kích hoạt tài khoản của bạn.",
          template: "activation-mail.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `Vui lòng kiểm tra email ${user.email} để kích hoạt tài khoản.`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(100 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

//  Kích hoạt người dùng
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode != activation_code) {
        return next(new ErrorHandler("Mã kích hoạt không hợp lệ !", 400));
      }

      const { name, email, password } = newUser.user;

      const existUser = await userModel.findOne({ email });

      if (existUser) {
        return next(new ErrorHandler("Email đã tồn tại !", 400));
      }

      const user = await userModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Vui lòng nhập email và mật khẩu !", 400));
      }

      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(
          new ErrorHandler("Email hoặc mật khẩu không hợp lệ !", 400)
        );
      }

      const isPasswordMatch = await user.comparePassword(password); // so sánh mật khẩu
      if (!isPasswordMatch) {
        return next(
          new ErrorHandler("Email hoặc mật khẩu không hợp lệ !", 400)
        );
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// đăng xuất
export const logoutUser = CatchAsyncError(
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      const userId = req.user?._id || "";
      redis.del(userId);

      res.status(200).json({
        success: true,
        message: "Đăng xuất thành công.",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
