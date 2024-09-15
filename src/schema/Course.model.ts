import mongoose, { Schema } from "mongoose";
import { CourseCategory, CourseStatus } from "../libs/enums/course.enum";

// Schema first & Code first
const courseSchema = new Schema(
  {
    courseStatus: {
      type: String,
      enum: CourseStatus,
      default: CourseStatus.PAUSE,
    },

    courseCategory: {
      type: String,
      enum: CourseCategory,
      required: true,
    },

    courseName: {
      type: String,
      required: true,
    },

    courseMentor: {
      type: String,
      required: true,
    },

    coursePrice: {
      type: Number,
      required: true,
    },

    courseSold: {
      type: Number,
      required: true,
    },

    courseDuration: {
      type: Number,
      required: true,
    },

    courseDesc: {
      type: String,
      required: true,
    },

    courseImages: {
      type: [Array],
      default: [],
    },

    courseView: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // updatedAt, createdAt
);

courseSchema.index({ courseName: 1 }, { unique: true });
export default mongoose.model("Course", courseSchema);