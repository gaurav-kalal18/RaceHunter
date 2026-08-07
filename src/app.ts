import express from "express";
import walletRoutes from "./routes/wallet.routes";

const app = express();

app.use(express.json());

// Health Check / API Info
app.get("/", (req, res) => {
    res.status(200).json({
        project: "RaceHunter",
        status: "Running",
        version: "1.0.0",
        database: "Neon PostgreSQL",
        deployment: "Render",
    });
});

// Wallet Routes
app.use("/wallet", walletRoutes);

export default app;