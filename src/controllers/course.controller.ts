import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Request, Response } from "express";
import CourseService from "../models/Course.service";
import { CourseInput } from "../libs/types/course";
import { AdminRequest } from "../libs/types/member";

const courseService = new CourseService();

const courseController: T = {};

/** SSR */
courseController.getAllCourses = async (req: Request, res: Response) => {
  try {
    // console.log("getAllProducts");
    const data = await courseService.getAllCourses();
    // console.log("data:", data);
    res.render("courses", { courses: data });
  } catch (err) {
    console.log("Error, getAllCourses:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

courseController.createNewCourse = async (req: AdminRequest, res: Response) => {
  try {
    console.log("createNewProduct");
    // res.send("DONE");
    console.log("req.files:", req.files);

    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATED_FAILED);

    // TODO: QUESTION ABOUT REQUEST.BODY

    console.log("req.body:", req.body);
    const data: CourseInput = req.body;
    data.courseImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });
    console.log("data:", data);

    await courseService.createNewCourse(data);

    res.send(
      `<script>alert("Successfull creation!"); window.location.replace('/admin/course/all')</script> `
    );
  } catch (err) {
    console.log("Error, createNewProduct:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/course/all')</script> `
    );
  }
};

courseController.updateChosenCourse = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    const id = req.params.id;
    console.log("id:", id);
    const result = await courseService.updateChosenCourse(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

export default courseController;
