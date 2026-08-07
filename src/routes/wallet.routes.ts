import { Router } from "express";
import walletController from "../controllers/wallet.controller";

const router = Router();

router.post("/deposit", walletController.deposit);
router.post("/withdraw", walletController.withdraw);
router.get("/:userId", walletController.getBalance);

export default router;