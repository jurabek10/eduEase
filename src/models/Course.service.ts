import CourseModel from "../schema/Course.model";

class CourseService {
  private readonly courseModel;

  constructor() {
    this.courseModel = CourseModel;
  }
}
export default CourseService;
