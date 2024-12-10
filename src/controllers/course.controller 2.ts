import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Request, Response } from "express";
import CourseService from "../models/Course.service";
import { CourseInput, CourseInquery } from "../libs/types/course";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { CourseCategory } from "../libs/enums/course.enum";
import { ObjectId } from "mongoose";

const courseService = new CourseService();

const courseController: T = {};
// SPA
courseController.getCourses = async (req: Request, res: Response) => {
  try {
    // const query = req.query;
    // console.log("req.query:", query);
    // const param = req.params;
    // console.log("req.params:", param);
    console.log("getCourses");
    const { page, limit, order, courseCategory, search } = req.query;
    // console.log(req.query);
    const inquery: CourseInquery = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };
    if (courseCategory)
      inquery.courseCategory = courseCategory as CourseCategory;
    if (search) inquery.search = String(search);
    const result = await courseService.getCourses(inquery);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getCourses:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

courseController.getCourse = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getCourse");
    const { id } = req.params;
    console.log("req.member:", req.member);
    const memberId = req.member?._id ?? null;
    const result = await courseService.getCourse(
      memberId as unknown as ObjectId,
      id
    );
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

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
