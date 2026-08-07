import prisma from "../config/prisma";
import { TransactionType } from "@prisma/client";

export async function withdraw(userId: string, amount: number) {

    if (amount <= 0) {
        throw new Error("Amount must be greater than zero.");
    }

    const wallet = await prisma.wallet.findUnique({
        where: {
            userId,
        },
    });

    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    if (wallet.balance.lessThan(amount)) {
        throw new Error("Insufficient balance.");
    }

    const updatedWallet = await prisma.wallet.update({
        where: {
            userId,
        },
        data: {
            balance: {
                decrement: amount,
            },
        },
    });

    await prisma.transaction.create({
        data: {
            walletId: updatedWallet.id,
            amount,
            type: TransactionType.WITHDRAW,
        },
    });

    return {
        message: "Withdrawal Successful",
        balance: updatedWallet.balance,
    };
}