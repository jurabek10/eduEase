import express, { Router } from "express";
const routerAdmin = express.Router();
import academiaController from "./controllers/academia.controller";

routerAdmin.get("/", academiaController.goHome);
routerAdmin
  .get("/login", academiaController.getLogin)
  .post("/login", academiaController.processLogin);

routerAdmin
  .get("/signup", academiaController.getSignup)
  .post("/signup", academiaController.processSignup);

export default routerAdmin;
