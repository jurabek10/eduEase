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
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/views";
import { ViewGroup } from "../libs/enums/views.enum";

class CourseService {
  private readonly courseModel;
  viewService: ViewService;

  constructor() {
    this.courseModel = CourseModel;
    this.viewService = new ViewService();
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
    if (memberId) {
      // Cchek existence
      const input: ViewInput = {
        memberId: memberId,
        viewrefId: courseId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const existView = await this.viewService.checkViewExistence(input);

      console.log("exist:", !!existView);

      if (!existView) {
        // Insert View
        console.log("PLANNING TO INSERT NEW VIEW");
        await this.viewService.insertMemberView(input);

        // Increase Counts
        result = await this.courseModel
          .findByIdAndUpdate(
            courseId,
            { $inc: { courseView: +1 } },
            { new: true }
          )
          .exec();
      }
    }
    return result as unknown as Course;
  }

  // public async addSoldPoint(course: Course, point: number): Promise<Course> {
  //   const courseId = shapeIntoMongooseObject(course._id);
  //   return (await this.courseModel
  //     .findByIdAndUpdate(
  //       {
  //         _id: courseId,
  //         courseStatus: { $in: [CourseStatus.PROCESS, CourseStatus.SALED] },
  //       },
  //       { $inc: { courseSold: point } },
  //       { new: true }
  //     )
  //     .exec()) as unknown as Course;
  // }

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

  // public async updateChosenCourse(
  //   id: string,
  //   input: CourseUpdateInput
  // ): Promise<Course> {
  //   id = shapeIntoMongooseObject(id);
  //   const existingCourse = await this.courseModel.findById(id).exec();

  //   console.log("Input before update:", input);

  //   if (input.courseStatus === CourseStatus.SALED && input.coursePrice) {
  //     input.courseSaledPrice = 0.8 * input.coursePrice; // 80% of the coursePrice
  //     console.log("Calculated courseSaledPrice:", input.courseSaledPrice);
  //   } else {
  //     console.log("Course is not marked as 'Saled' or coursePrice is missing.");
  //   }

  //   const result = await this.courseModel
  //     .findOneAndUpdate(
  //       { _id: id },
  //       { $set: input }, // Ensure fields are explicitly updated
  //       { new: true } // Return the updated document
  //     )
  //     .exec();

  //   if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
  //   console.log("result:", result);

  //   return result as unknown as Course;
  // }
  public async updateChosenCourse(
    id: string,
    input: CourseUpdateInput
  ): Promise<Course> {
    id = shapeIntoMongooseObject(id);

    // Fetch the current course from the database to get coursePrice
    const existingCourse = await this.courseModel.findById(id).exec();

    // Check if the course exists
    if (!existingCourse) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    console.log("Existing course data:", existingCourse);
    console.log("Existing course Price:", existingCourse.coursePrice);
    const salePercent = existingCourse.coursePrice <= 80 ? 0.3 : 0.2;

    // Check if courseStatus is being updated to "Saled" and if coursePrice exists
    if (
      input.courseStatus === CourseStatus.SALED &&
      existingCourse.coursePrice
    ) {
      // Calculate 80% of coursePrice for courseSaledPrice
      input.courseSaledPrice = parseFloat(
        (existingCourse.coursePrice * salePercent).toFixed(2)
      );

      console.log("Calculated courseSaledPrice:", input.courseSaledPrice);
    } else {
      input.courseSaledPrice = 0;
    }

    // Apply the update using $set
    const result = await this.courseModel
      .findOneAndUpdate(
        { _id: id },
        { $set: input }, // Update courseStatus and courseSaledPrice
        { new: true } // Return the updated document
      )
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    }

    console.log("Updated course:", result);

    return result as unknown as Course;
  }
}
export default CourseService;
