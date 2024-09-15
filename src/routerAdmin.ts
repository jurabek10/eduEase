import express, { Router } from "express";
const routerAdmin = express.Router();
import academiaController from "./controllers/academia.controller";
import makeUploader from "./libs/utils/uploader";
import courseController from "./controllers/course.controller";

routerAdmin.get("/", academiaController.goHome);
routerAdmin
  .get("/login", academiaController.getLogin)
  .post("/login", academiaController.processLogin);

routerAdmin
  .get("/signup", academiaController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    academiaController.processSignup
  );
routerAdmin.get("/logout", academiaController.logout);
routerAdmin.get("/check-me", academiaController.checkAuthSession);

/** Course */
routerAdmin.get(
  "/course/all",
  academiaController.verifyRestaurant,
  courseController.getAllProducts
);
routerAdmin.post(
  "/course/create",
  academiaController.verifyRestaurant,
  makeUploader("products").array("productImages", 5),
  courseController.createNewProduct
);
routerAdmin.post(
  "/course/:id",
  academiaController.verifyRestaurant,
  courseController.updateChosenProduct
);
export default routerAdmin;
