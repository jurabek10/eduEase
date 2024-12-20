import { ObjectId } from "mongoose";

import { CourseCategory, CourseStatus } from "../enums/course.enum";

export interface CourseInquery {
  order: string;
  page: number;
  limit: number;
  courseCategory?: CourseCategory;
  search?: string;
}

export interface CourseInput {
  courseStatus?: CourseStatus;
  courseCategory: CourseCategory;
  courseName: string;
  courseMentor: string;
  coursePrice: number;
  courseSaledPrice: number;
  courseSold: number;
  courseDuration: number;
  courseDesc: string;
  courseImages?: string[];
  courseView?: number;
}

export interface Course {
  _id: ObjectId;
  courseStatus: CourseStatus;
  courseCategory: CourseCategory;
  courseName: string;
  courseMentor: string;
  coursePrice: number;
  courseSaledPrice: number;
  courseSold: number;
  courseDuration: number;
  courseDesc: string;
  courseImages: string[];
  courseView: number;
}

export interface CourseUpdateInput {
  _id: ObjectId;
  courseStatus?: CourseStatus;
  courseCategory?: CourseCategory;
  courseName?: string;
  courseMentor?: string;
  coursePrice?: number;
  courseSaledPrice?: number;
  courseSold?: number;
  courseDuration?: number;
  courseDesc?: string;
  courseImages?: string[];
  courseView?: number;
}

// export interface ExtendedRequestCourse extends Request {
//   course: Course;
//   file: Express.Multer.File;
//   files: Express.Multer.File[];
// }
