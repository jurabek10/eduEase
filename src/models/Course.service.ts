import Errors from "../libs/Errors";
import {
  Course,
  CourseInput,
  CourseInquery,
  CourseUpdateInput,
} from "../libs/types/course";
import CourseModel from "../schema/Course.model";
import { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";
import { shapeIntoMongooseObject } from "../libs/config";
import { CourseStatus } from "../libs/enums/course.enum";
import { T } from "../libs/types/common";
import { ObjectId } from "mongoose";

class CourseService {
  private readonly courseModel;

  constructor() {
    this.courseModel = CourseModel;
  }

  /** SPA */
  public async getCourses(inquery: CourseInquery): Promise<Course[]> {
    console.log("inquiry:", inquery);
    const match: T = {
      courseStatus: { $in: [CourseStatus.PROCESS, CourseStatus.SALED] },
    };
    console.log("match:", match);
    if (inquery.courseCategory) {
      match.courseCategory = inquery.courseCategory;
    }
    if (inquery.search) {
      match.courseName = { $regex: new RegExp(inquery.search, "i") };
    }
    const sort: T =
      inquery.order === "coursePrice"
        ? { [inquery.order]: 1 }
        : { [inquery.order]: -1 };
    const result = await this.courseModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquery.page * 1 - 1) * inquery.limit },
        { $limit: inquery.limit * 1 },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    console.log("result:", result);
    return result;
  }

  public async getCourse(
    memberId: ObjectId | null,
    id: string
  ): Promise<Course> {
    const courseId = shapeIntoMongooseObject(id);
    let result = await this.courseModel
      .findOne({
        _id: courseId,
        courseStatus: { $in: [CourseStatus.SALED, CourseStatus.PROCESS] },
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    // TODO: If authenticated user=> first=> view log creation
    return result as unknown as Course;
  }

  public async addSoldPoint(course: Course, point: number): Promise<Course> {
    const courseId = shapeIntoMongooseObject(course._id);
    return (await this.courseModel
      .findByIdAndUpdate(
        {
          _id: courseId,
          courseStatus: { $in: [CourseStatus.PROCESS, CourseStatus.SALED] },
        },
        { $inc: { courseSold: point } },
        { new: true }
      )
      .exec()) as unknown as Course;
  }

  /** SSR */
  public async getAllCourses(): Promise<Course[] | any> {
    const result = await this.courseModel.find().exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async createNewCourse(input: CourseInput): Promise<Course> {
    try {
      const result = (await this.courseModel.create(
        input
      )) as unknown as Course;
      return result;
    } catch (err) {
      console.error("Error, model: createNewCourse:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
    }
  }

  public async updateChosenCourse(
    id: string,
    input: CourseUpdateInput
  ): Promise<Course> {
    id = shapeIntoMongooseObject(id);
    const result = await this.courseModel
      .findOneAndUpdate({ _id: id }, input, {
        new: true,
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    console.log("result:", result);

    return result as unknown as Course;
  }
}
export default CourseService;
