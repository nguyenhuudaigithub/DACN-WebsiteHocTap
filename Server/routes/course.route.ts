import express from 'express';
import { deleteCourse, editCourse, getAllCourses, uploadCourse } from '../controllers/course.controller';
import { authorizeRoles, isAutheticated } from '../middleware/auth';
const courseRouter = express.Router();

courseRouter.post(
  '/create-course',
  isAutheticated,
  authorizeRoles('admin'),
  uploadCourse
);

courseRouter.put(
  '/edit-course/:id',
  isAutheticated,
  authorizeRoles('admin'),
  editCourse
);
courseRouter.put(
  '/get-courses',
  isAutheticated,
  authorizeRoles('admin'),
  getAllCourses
);
courseRouter.delete(
  '/delete-course/:id',
  isAutheticated,
  authorizeRoles('admin'),
  deleteCourse
);
export default courseRouter;
