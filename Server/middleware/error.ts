import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Server noi bo loi !!!";

  // Sai id mongodb
  if (err.name == "CastError") {
    const message = `Khong tim thay tai nguyen. ${err.path} khong hop le !!!`;
    err = new ErrorHandler(message, 400);
  }

  // Lỗi key trùng lặp
  if (err.code === 1100) {
    const message = `Da trung lap ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Lỗi JWT sai
  if (err.code == "JsonWebTokenError") {
    const message = `Json web token khong hop le, hay thu lai !!!`;
    err = new ErrorHandler(message, 400);
  }

  // Lỗi JWT hết hạn
  if (err.name === "TokenEpiredError") {
    const message = `Json web token het han, hay thu lai !!!`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
