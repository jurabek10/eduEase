import Errors from "../libs/Errors";
import { Course, CourseInput, CourseUpdateInput } from "../libs/types/course";
import CourseModel from "../schema/Course.model";
import { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";
import { shapeIntoMongooseObject } from "../libs/config";

class CourseService {
  private readonly courseModel;

  constructor() {
    this.courseModel = CourseModel;
  }

  /** SPA */

  /** SSR */
  public async createNewCourse(input: CourseInput): Promise<Course> {
    try {
      return (await this.courseModel.create(input)) as unknown as Course;
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
