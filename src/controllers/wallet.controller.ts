import { Request, Response } from "express";
import walletService from "../services/wallet.service";

class WalletController {
    async deposit(req: Request, res: Response) {
        try {
            const { userId, amount } = req.body;

            const result = await walletService.deposit(userId, amount);

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async withdraw(req: Request, res: Response) {
        try {
            const { userId, amount } = req.body;

            const result = await walletService.withdraw(userId, amount);

            res.status(200).json(result);

        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async getBalance(
        req: Request<{ userId: string }>,
        res: Response
    ) {
        try {
            const { userId } = req.params;

            const result = await walletService.getBalance(userId);

            res.status(200).json(result);

        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : "Unknown Error",
            });
        }
    }
}



export default new WalletController();