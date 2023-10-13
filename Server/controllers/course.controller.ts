import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import ejs from "ejs";
import mongoose from "mongoose";
import path from "path";
import senMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";

// upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

        const courseId = req.params.id;

        const course = await CourseModel.findByIdAndUpdate(courseId, data, {
          $set: data,
          new: true,
        });

        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//Nhận khóa học duy nhất - mà không cần mua
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isCacheExist = await redis.get(courseId);

      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        console.log("");

        await redis.set(courseId, JSON.stringify(course));

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Nhận tất cả các khóa học - mà không cần mua          4 57
// export const getAllCourses = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const isCacheExist = await redis.get("allCourses");

//       if (isCacheExist) {
//         const course = JSON.parse(isCacheExist);
//         res.status(200).json({
//           success: true,
//           course,
//         });
//       } else {
//         const course = await CourseModel.find().select(
//           "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
//         );

//         await redis.set("allCourses", JSON.stringify(course));

//         res.status(200).json({
//           success: true,
//           course,
//         });
//       }
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

//Nhận nội dung khóa học - chỉ dành cho người dùng hợp lệ    5 15
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const courseExists = userCourseList?.find(
        (course: any) => course._id.toSting() === courseId
      );

      if (!courseExists) {
        return next(
          new ErrorHandler(
            "Bạn không đủ điều kiện truy cập khóa học này !",
            404
          )
        );
      }

      const course = await CourseModel.findById(courseId);

      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Thêm câu hỏi trong khóa học 5 26
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Content ID không hợp lệ", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("Content ID không hợp lệ", 400));
      }

      // Tạo một đối tượng câu hỏi mới
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      //Thêm câu hỏi này vào nội dung khóa học của chúng tôi
      courseContent.questions.push(newQuestion);

      await NotificationModel.create({
        user: req.user?._id,
        title: "Câu hỏi mới nhận được",
        message: `Bạn có một câu hỏi mới từ ${courseContent.title}`,
      });

      //Lưu khóa học cập nhật
      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Thêm câu trả lời trong câu hỏi khóa học 5 26
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnwser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Content ID không hợp lệ", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("Content ID không hợp lệ", 400));
      }

      const question = courseContent?.questions?.find((item: any) =>
        item._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler("Question Id không hợp lệ", 400));
      }

      // Tạo đối tượng trả lời mới
      const newAnswer: any = {
        user: req.user,
        answer,
      };

      //  Thêm câu trả lời này vào nội dung khóa học của chúng tôi
      question.questionReplies?.push(newAnswer);

      await course?.save();

      if (req.user?._id === question.user._id) {
        //Tạo thông báo
        await NotificationModel.create({
          user: req.user?._id,
          title: "Mới nhận được câu trả lời cho câu hỏi.",
          message: `Bạn có một câu trả lời trong ${courseContent.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question_reply.ejs"),
          data
        );

        try {
          await senMail({
            email: question.user.email,
            subject: "Trả lời câu hỏi",
            template: "question_reply.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// get all courses -- only for admin
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
//delete course - only for admin

export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      await course.deleteOne({ id });
      await redis.del(id);
      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// Thêm đánh giá trong khóa học 5 51
interface IAddAnswerData {
  review: string;
  courseId: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      // kiểm tra xem courseId đã tồn tại trong userCourseList chưa dựa trên _id
      const courseExists = userCourseList?.some(
        (course: any) => course._id.toSting() === courseId.toString()
      );
      if (!courseExists) {
        return next(
          new ErrorHandler(
            "Bạn không đủ điều kiện để truy cập khóa học này !",
            404
          )
        );
      }

      const course = await CourseModel.findById(courseId);

      const { review, rating } = req.body as IAddAnswerData;

      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };

      course?.reviews.push(reviewData);

      let avg = 0;

      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      if (course) {
        course.ratings = avg / course.reviews.length; // 2 bài đánh:1 bài giá 5 sao, 1 bài đánh giá 4 sao thì = 9/2 = 4.5 sao
      }

      await course?.save();

      const notification = {
        title: "Đã nhận được đánh giá.",
        message: `${req.user?.name} đưa ra đánh giá trong ${course?.name}`,
      };

      // Thông báo

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Thêm câu trả lời trong bài đánh giá
interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Không tìm thấy khóa học !", 404));
      }

      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Không tìm thấy đánh giá !", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);

      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
