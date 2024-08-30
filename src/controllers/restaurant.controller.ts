import { Request, Response } from "express";
import { T } from "../libs/types/common";

const restaurantController: T = {};

restaurantController.goHome = (req: Request, res: Response) => {
  res.send("Home page");
};

restaurantController.getLogin = (req: Request, res: Response) => {
  res.send("getLogin page");
};

export default restaurantController;
