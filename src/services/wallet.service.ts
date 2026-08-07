import prisma from "../config/prisma";
import { TransactionType } from "@prisma/client";
import { withdraw } from "../strategies/atomic";
//import { withdraw } from "../strategies/vulnerable";
//import { withdraw } from "../strategies/optimistic";
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

    async createWallet(name: string, email: string, password: string) {

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            throw new Error("Email already exists.");
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                wallet: {
                    create: {
                        balance: 0,
                    },
                },
            },
            include: {
                wallet: true,
            },
        });

        return {
            message: "Wallet created successfully",
            userId: user.id,
            balance: user.wallet?.balance,
        };
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
        return withdraw(userId, amount);
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