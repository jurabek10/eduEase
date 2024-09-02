import express from "express";
const routerAdmin = express.Router();
import academiaController from "./controllers/academia.controller";

routerAdmin.get("/", academiaController.goHome);
routerAdmin.get("/login", academiaController.getLogin);

export default routerAdmin;
