import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

export { CatchAsyncError } from "./catchAsyncErrors";

export const isAutheticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return next(
        new ErrorHandler("Vui lòng đăng nhập để thực hiện yêu cầu !", 400)
      );
    }

    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("Mã truy cập không hợp lê !", 400));
    }

    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User không đúng", 400));
    }

    req.user = JSON.parse(user);

    next();
  }
);


export const authorizeRoles = (...roles:string[]) => {
  return (req:Request,res:Response,next:NextFunction)=>{
    if(!roles.includes(req.user?.role || '')){
      return next(new ErrorHandler(`Chức vụ ${req.user?.role}không được cấp quyền truy cập vào đây !`,403));
    }
    next();
  }
}