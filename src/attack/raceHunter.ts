import axios from "axios";
import { performance } from "perf_hooks";

const BASE_URL = "http://localhost:3000";

const CONFIG = {
    strategy: "Atomic Update",
    userId: "cmsj8oj400000u72gu6wup7ch",
    withdrawAmount: 10,
    concurrentRequests: 100,
};

async function getBalance() {
    const response = await axios.get(
        `${BASE_URL}/wallet/${CONFIG.userId}`
    );

    return response.data;
}

async function attack() {

    const before = await getBalance();

    const start = performance.now();

    const requests = [];

    for (let i = 0; i < CONFIG.concurrentRequests; i++) {
        requests.push(
            axios.post(`${BASE_URL}/wallet/withdraw`, {
                userId: CONFIG.userId,
                amount: CONFIG.withdrawAmount,
            })
        );
    }

    const results = await Promise.allSettled(requests);

    const end = performance.now();

    const after = await getBalance();

    let success = 0;

    let insufficientBalance = 0;
    let versionConflict = 0;
    let otherErrors = 0;

    for (const result of results) {

        if (result.status === "fulfilled") {
            success++;
        } else {
            const message =
                result.reason?.response?.data?.error ??
                result.reason?.message ??
                "";

            if (message.includes("Insufficient")) {
                insufficientBalance++;
            }
            else if (
                message.includes("Version") ||
                message.includes("Concurrent") ||
                message.includes("Too many concurrent")
            ) {
                versionConflict++;
            }
            else {
                otherErrors++;
            }
        }
    }

    const failed =
        insufficientBalance +
        versionConflict +
        otherErrors;

    console.log("\n======================================================");
    console.log("               RaceHunter Benchmark");
    console.log("======================================================\n");

    console.log(`Strategy             : ${CONFIG.strategy}\n`);

    console.log(`Initial Balance      : ${before.balance}`);
    console.log(`Final Balance        : ${after.balance}`);
    console.log(`Initial Version      : ${before.version}`);
    console.log(`Final Version        : ${after.version}\n`);

    console.log(`Withdraw Amount      : ${CONFIG.withdrawAmount}`);
    console.log(`Concurrent Requests  : ${CONFIG.concurrentRequests}\n`);

    console.log(`Successful           : ${success}`);
    console.log(`Failed               : ${failed}\n`);

    console.log("Failure Breakdown");
    console.log("----------------------------");
    console.log(`Insufficient Balance : ${insufficientBalance}`);
    console.log(`Version Conflict     : ${versionConflict}`);
    console.log(`Other Errors         : ${otherErrors}\n`);

    console.log(`Execution Time       : ${(end - start).toFixed(2)} ms`);

    if (Number(after.balance) < 0) {
        console.log("\n❌ Race Condition DETECTED");
    } else {
        console.log("\n✅ Race Condition NOT DETECTED");
    }

    console.log("\n======================================================");
}

attack().catch(console.error);