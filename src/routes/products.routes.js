import { Router } from "express";
import * as ProductController from "../controllers/product.controllers.js";
import { userApiBlock } from "../utils/utils.js";

const router = Router();
router.get("/", ProductController.getProductList);
router.get("/:id", ProductController.getProductById);
router.delete("/:id", ProductController.deleteProduct);
router.post("/", ProductController.createProduct);
router.put("/:pid", userApiBlock(), ProductController.updateProduct);

export default router;
