import prisma from "../config/prisma";
import { TransactionType } from "@prisma/client";

export async function withdraw(userId: string, amount: number) {

    if (amount <= 0) {
        throw new Error("Amount must be greater than zero.");
    }

    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            return await prisma.$transaction(async (tx) => {

                const wallet = await tx.wallet.findUnique({
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

                const result = await tx.wallet.updateMany({
                    where: {
                        userId,
                        version: wallet.version,
                        balance: {
                            gte: amount,
                        },
                    },
                    data: {
                        balance: {
                            decrement: amount,
                        },
                        version: {
                            increment: 1,
                        },
                    },
                });

                if (result.count === 0) {
                    throw new Error("Version conflict");
                }

                const updatedWallet = await tx.wallet.findUnique({
                    where: {
                        userId,
                    },
                });

                if (!updatedWallet) {
                    throw new Error("Wallet not found.");
                }

                await tx.transaction.create({
                    data: {
                        walletId: updatedWallet.id,
                        amount,
                        type: TransactionType.WITHDRAW,
                    },
                });

                return {
                    message: "Withdrawal Successful",
                    balance: updatedWallet.balance,
                    version: updatedWallet.version,
                };

            });

        } catch (error) {

            if (
                error instanceof Error &&
                error.message === "Version conflict"
            ) {
                continue;
            }

            throw error;
        }
    }

    throw new Error("Too many concurrent modifications. Please try again.");
}