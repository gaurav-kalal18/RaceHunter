import prisma from "../config/prisma";
import { TransactionType } from "@prisma/client";

export async function withdraw(userId: string, amount: number) {

    if (amount <= 0) {
        throw new Error("Amount must be greater than zero.");
    }

    return await prisma.$transaction(async (tx) => {

        const result = await tx.wallet.updateMany({
            where: {
                userId,
                balance: {
                    gte: amount,
                },
            },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });

        if (result.count === 0) {
            throw new Error("Insufficient balance.");
        }

        const wallet = await tx.wallet.findUnique({
            where: {
                userId,
            },
        });

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        await tx.transaction.create({
            data: {
                walletId: wallet.id,
                amount,
                type: TransactionType.WITHDRAW,
            },
        });

        return {
            message: "Withdrawal Successful",
            balance: wallet.balance,
        };
    });
}