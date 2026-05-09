import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import reportsRouter from "./reports";
import imageRouter from "./image";
import dietRouter from "./diet";
import historyRouter from "./history";
import summaryRouter from "./summary";
import chatRouter from "./chat";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(reportsRouter);
router.use(imageRouter);
router.use(dietRouter);
router.use(historyRouter);
router.use(summaryRouter);
router.use(chatRouter);
router.use(notificationsRouter);

export default router;
