
import { now } from "mongoose"
import NotificationModel from "../models/notificationModel";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
//dlete notification -- only admin
cron.schedule("0 0 0 * * *", async() => {
    const thirtyDaysAgo = new Date(Date.now()- 30*24*60*60*1000);
    await NotificationModel.deleteMany({status:"read",createdAt:{$lt: thirtyDaysAgo}})
    console.log("Delete rea botifications");
});
//  Nhận tất cả thông báo -- chỉ quản trị viên
export const getNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//Cập nhật trạng thái thông báo --- chỉ quản trị viên
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);

      if (!notification) {
        return next(new ErrorHandler("Không tìm thấy thông báo !", 400));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }

      await notification.save();

      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
