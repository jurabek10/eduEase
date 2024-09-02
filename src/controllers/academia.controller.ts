import { Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";

const academiaController: T = {};

academiaController.goHome = (req: Request, res: Response) => {
  res.send("Home page");
};

academiaController.getLogin = (req: Request, res: Response) => {
  res.send("getLogin page");
};

export default academiaController;
