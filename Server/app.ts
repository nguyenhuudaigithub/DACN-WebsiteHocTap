require('dotenv').config();
import express, { NextFunction, Request, Response } from 'express';
export const app = express();
import cors from "cors";
import cookieParser from 'cookie-parser';
import {ErrorMiddleware} from "./middleware/error";
import userRoute from "./routes/user.route"

app.use(express.json({limit:"50mb"}));

app.use(cookieParser());

app.use(
    cors({
        origin: process.env.ORIGIN,
    })
);

app.use("/api/v1",userRoute);


app.get("/test",(req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

app.all("*",(req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} khong tim thay`) as any;
    err.statusCode = 404;
    next(err);
});

app.use(ErrorMiddleware)