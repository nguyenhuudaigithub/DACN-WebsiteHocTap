require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import { ErrorMiddleware } from "./middleware/error";
import userRoute from "./routes/user.route";
import courseRouter from "./routes/course.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import orderRouter from "./routes/order.route";
import notificationRoute from "./routes/notification.route";

app.use(compression());

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// routes

app.use(
  "/api/v1",
  userRoute,
  orderRouter,
  courseRouter,
  notificationRoute,
  analyticsRouter,
  layoutRouter
);
// app.use('/api/v1', courseRouter);

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} khong tim thay`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
