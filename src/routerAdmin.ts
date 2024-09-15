import express, { Router } from "express";
const routerAdmin = express.Router();
import academiaController from "./controllers/academia.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploader";

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

/** Product */
routerAdmin.get(
  "/product/all",
  academiaController.verifyRestaurant,
  productController.getAllProducts
);
routerAdmin.post(
  "/product/create",
  academiaController.verifyRestaurant,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct
);
routerAdmin.post(
  "/product/:id",
  academiaController.verifyRestaurant,
  productController.updateChosenProduct
);
export default routerAdmin;
