import express from "express";
import walletRoutes from "./routes/wallet.routes";

const app = express();

app.use(express.json());

app.use("/wallet", walletRoutes);

export default app;