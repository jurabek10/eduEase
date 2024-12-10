import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";

const memberService = new MemberService();

const academiaController: T = {};

academiaController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (err) {
    console.log("Error, goHome", err);
  }
};

academiaController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.render("login");
  } catch (err) {
    console.log("Error, getLogin", err);
    res.redirect("/admin");
  }
};

academiaController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("getSignup");
    res.render("signup");
  } catch (err) {
    console.log("Error, getSignup", err);
  }
};

academiaController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processSignup");
    // console.log("body:", req.body);

    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    // console.log("req.file:", req.file);

    const newMember: MemberInput = req.body;
    newMember.memberImage = file?.path;
    newMember.memberType = MemberType.ACADEMIA;
    const result = await memberService.processSignup(newMember);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/admin/course/all");
    });
  } catch (err) {
    console.log("Error, processSignup", err);
    const message =
      err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/signup')</script> `
    );
  }
};

academiaController.processLogin = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processLogin");
    const input: LoginInput = req.body;
    const result = await memberService.processLogin(input);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/admin/course/all");
    });
  } catch (err) {
    console.log("Error, processLogin", err);
    const message =
      err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/login1')</script> `
    );
  }
};

academiaController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("logout");
    req.session.destroy(function () {
      res.redirect("/admin");
    });
  } catch (err) {
    console.log("Erro, processLogin", err);
    res.redirect("/admin");
  }
};

academiaController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers");
    const result = await memberService.getUsers();
    console.log("result:", result);

    res.render("users", { users: result });
  } catch (err) {
    console.log("Erro, getUsers", err);
    res.redirect("/admin/login");
  }
};

academiaController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUser");
    const result = await memberService.updateChosenUser(req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Erro, updateChosenUser", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

academiaController.checkAuthSession = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("checkAuthSession");
    if (req.session?.member)
      res.send(`<script>alert("${req.session.member.memberNick}")</script> `);
    else res.send(`<script>alert("${Message.NOT_AUTHENTICATED}")</script>`);
  } catch (err) {
    console.log("Erro, checkAuthSession", err);
    res.send(err);
  }
};

academiaController.verifyRestaurant = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.session?.member?.memberType === MemberType.ACADEMIA) {
    req.member = req.session.member;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/login')</script>`
    );
  }
};

export default academiaController;
