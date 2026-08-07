import prisma from "../config/prisma";
import { TransactionType } from "@prisma/client";

class WalletService {

    // Helper
    private async getWallet(userId: string) {
        const wallet = await prisma.wallet.findUnique({
            where: {
                userId,
            },
        });

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        return wallet;
    }

    // Deposit
    async deposit(userId: string, amount: number) {

        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }

        await this.getWallet(userId);

        const updatedWallet = await prisma.$transaction(async (tx) => {

            const wallet = await tx.wallet.update({
                where: {
                    userId,
                },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type: TransactionType.DEPOSIT,
                },
            });

            return wallet;
        });

        return {
            message: "Deposit Successful",
            balance: updatedWallet.balance,
        };
    }

    // Withdraw (Optimistic Locking + Retry)
    async withdraw(userId: string, amount: number) {

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

    // Get Balance
    async getBalance(userId: string) {

        const wallet = await this.getWallet(userId);

        return {
            balance: wallet.balance,
            version: wallet.version,
        };
    }
}

export default new WalletService();