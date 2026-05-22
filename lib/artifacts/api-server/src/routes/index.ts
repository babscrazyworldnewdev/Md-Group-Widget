import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiConversationsRouter from "./openai/conversations";
import leadsRouter from "./leads";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiConversationsRouter);
router.use(leadsRouter);

export default router;
