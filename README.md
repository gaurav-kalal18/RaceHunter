# 🚀 RaceHunter
## 🌐 Live Demo

- **API Base URL:** https://racehunter.onrender.com

📖 See the **Live Deployment** section below for a complete walkthrough of creating a wallet, depositing funds, withdrawing funds, and benchmarking concurrency strategies.

> **RaceHunter was built to study real-world concurrency problems by reproducing race conditions and evaluating practical solutions using measurable benchmarks instead of theoretical comparisons.**

> RaceHunter is a concurrency benchmarking framework built with **TypeScript, Node.js, Express, Prisma, and PostgreSQL** to reproduce race conditions in wallet transactions and evaluate different concurrency control strategies under high concurrent load.

## 📖 Overview

Modern backend systems often handle hundreds of requests simultaneously. If concurrency is not managed correctly, race conditions can lead to incorrect balances, duplicate withdrawals, and inconsistent database states.

**RaceHunter** demonstrates these issues by intentionally reproducing race conditions using concurrent withdrawal requests and then compares multiple concurrency control strategies to evaluate their correctness and performance.

Instead of simply implementing a wallet API, this project focuses on understanding **how concurrent database operations behave under load** and how different approaches solve the same problem with different trade-offs.

---

## ✨ Features

- 💰 Wallet Deposit & Withdrawal APIs
- 📜 Transaction History Tracking
- ⚡ High-Concurrency Attack Simulator (100 Parallel Requests)
- 🧪 Race Condition Reproduction
- ✅ Atomic Conditional Update Strategy
- ✅ Optimistic Locking Strategy with Retry Mechanism
- 📊 Benchmark Reporting (Execution Time, Success Rate, Final Balance)
- 🏗 Strategy Pattern Architecture for Easy Algorithm Switching
- 🐳 Dockerized PostgreSQL Database
- 🔄 Prisma ORM Integration

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Containerization | Docker & Docker Compose |
| HTTP Client | Axios |
| Testing | Custom RaceHunter Attack Tool |
| Deployment | Render |
| Version Control | Git & GitHub |

## 🏗️ System Architecture

```text
                    RaceHunter

           Concurrent Attack Tool
                  (Axios)

                     │
                     ▼

             Express REST API

                     │
          Routes → Controllers

                     │
              Wallet Service

                     │
         Strategy Pattern (Withdraw)

      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼

 Vulnerable     Atomic Update   Optimistic Locking

                     │
                     ▼

                 Prisma ORM

                     │
                     ▼

               PostgreSQL Database
```

## ⚠️ Understanding the Race Condition

A race condition occurs when multiple requests access and modify shared data concurrently without proper synchronization.

Consider a wallet with a balance of **₹300**.

Two withdrawal requests of **₹10** arrive simultaneously.

### Vulnerable Workflow

```text
Request A                    Request B

Read Balance = 300           Read Balance = 300
       │                            │
       ▼                            ▼
Balance >= 10 ?              Balance >= 10 ?
       │                            │
       ▼                            ▼
Update Balance               Update Balance
       │                            │
       └────────────┬───────────────┘
                    ▼
         Incorrect Final Balance
```

Since both requests read the same balance before either update is committed, they both believe sufficient funds exist. Under heavy concurrency, this can lead to **over-withdrawal and negative balances**.

RaceHunter intentionally reproduces this problem using **100 concurrent withdrawal requests**.

## 🛡️ Concurrency Control Strategies

RaceHunter evaluates multiple approaches to prevent race conditions.

### ❌ Vulnerable Strategy

- Read → Check → Update
- No concurrency protection
- Fast but incorrect
- Can produce negative balances

---

### ✅ Atomic Conditional Update

Uses a single database operation to:

- Verify sufficient balance
- Deduct the amount
- Prevent concurrent over-withdrawals

This approach provided the **best balance of correctness, simplicity, and performance** for this wallet application.

---

### ✅ Optimistic Locking

Uses a version number to detect concurrent modifications.

Workflow:

1. Read wallet and version.
2. Attempt update only if the version is unchanged.
3. Retry on version conflicts.

This strategy successfully prevents race conditions but may reject requests under heavy contention if the retry limit is exceeded.

## 📊 Benchmark Results

RaceHunter benchmarks different concurrency control strategies by firing **100 concurrent withdrawal requests** against the same wallet and measuring correctness, throughput, and execution time.

| Strategy | Initial Balance | Successful Withdrawals | Final Balance | Execution Time | Race Condition |
|----------|----------------:|-----------------------:|--------------:|---------------:|:--------------:|
| ❌ Vulnerable | 500 | 100 | **-500** | 247.60 ms | Yes |
| ✅ Atomic Update | 500 | 50 | **0** | 419.03 ms | No |
| ✅ Optimistic Locking | 500 | 39 | **110** | 544.93 ms | No |

### Key Observations

- The **Vulnerable** implementation completed every request but allowed over-withdrawal, producing a negative balance.
- **Atomic Update** successfully processed every valid withdrawal while maintaining data consistency.
- **Optimistic Locking** also prevented race conditions, but some requests failed after exhausting the retry limit under heavy contention.
-  Atomic Update completed faster than Optimistic Locking in this benchmark, since optimistic locking incurs retry overhead under contention.
> **Note:** Benchmark results were collected on a local development environment. Execution times may vary across different hardware and deployment environments.

## 📁 Project Structure

```text
RaceHunter
│
├── src
│   ├── attack
│   │   └── raceHunter.ts
│   ├── config
│   ├── controllers
│   ├── routes
│   ├── seed
│   ├── services
│   │   └── wallet.service.ts
│   ├── strategies
│   │   ├── vulnerable.ts
│   │   ├── atomic.ts
│   │   └── optimistic.ts
│   └── generated
│
├── prisma
│
├── docker
│
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API Health Check |
| POST | `/wallet/create` | Create a new user and wallet |
| POST | `/wallet/deposit` | Deposit money into a wallet |
| POST | `/wallet/withdraw` | Withdraw money from a wallet |
| GET | `/wallet/:userId` | Retrieve wallet balance and version |

## ⚙️ Getting Started

### Clone the repository

```bash
git clone https://github.com/<your-username>/RaceHunter.git
cd RaceHunter
```

### Install dependencies

```bash
npm install
```

### Start PostgreSQL using Docker

```bash
docker compose -f docker/docker-compose.yml up -d
```

### Run Prisma migrations

```bash
npx prisma migrate dev
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Seed the database

```bash
npm run seed
```

### Start the backend

```bash
npm run dev
```

### Run the benchmark

```bash
npm run attack
```

````md
## 🌐 Live Deployment

**Base URL**

```
https://racehunter.onrender.com
```

### Try the API

#### 1. Create a User & Wallet

```http
POST /wallet/create
```

Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Example Response

```json
{
  "message": "Wallet created successfully",
  "userId": "YOUR_USER_ID",
  "balance": "0"
}
```

> Save the returned **userId**. It is required for all subsequent wallet operations.

---

#### 2. Deposit Funds

```http
POST /wallet/deposit
```

Request Body

```json
{
  "userId": "YOUR_USER_ID",
  "amount": 500
}
```

---

#### 3. Withdraw Funds

```http
POST /wallet/withdraw
```

Request Body

```json
{
  "userId": "YOUR_USER_ID",
  "amount": 200
}
```

---

#### 4. Check Wallet Balance

```http
GET /wallet/YOUR_USER_ID
```

Example Response

```json
{
  "balance": "300",
  "version": 70
}
```

---

#### 5. Benchmark Different Strategies

RaceHunter supports three withdrawal strategies:

- ❌ Vulnerable
- ✅ Atomic Update
- ✅ Optimistic Locking

Switch the strategy implementation in `wallet.service.ts` and run:

```bash
npm run attack
```

The benchmark fires **100 concurrent withdrawal requests** and compares correctness, execution time, and race-condition behavior across all three strategies.

## 📚 Lessons Learned

Building RaceHunter provided practical experience with:

- Understanding and reproducing race conditions.
- Designing concurrent-safe backend systems.
- Using database-level atomic updates for consistency.
- Implementing optimistic locking with retry mechanisms.
- Measuring the trade-offs between correctness and throughput.
- Applying the Strategy Pattern to compare multiple algorithms without changing the API.
- Benchmarking concurrent workloads instead of relying on theoretical assumptions.

## 🚀 Future Improvements

- Add authentication and authorization using JWT.
- Expose benchmark results through a web dashboard.
- Support configurable concurrency levels.
- Add stress testing with thousands of concurrent requests.
- Compare additional concurrency control strategies.
- Integrate CI/CD for automated testing and deployment.

## 👨‍💻 Author

**Gaurav Kalal**

- GitHub: https://github.com/gaurav-kalal18
- LinkedIn: https://www.linkedin.com/in/gaurav-kalal-86a117338/