import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import blogRouter from "./blog";
import enquiriesRouter from "./enquiries";
import mediaRouter from "./media";
import settingsRouter from "./settings";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(blogRouter);
router.use(enquiriesRouter);
router.use(mediaRouter);
router.use(settingsRouter);
router.use(statsRouter);

export default router;
