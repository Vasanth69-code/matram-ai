import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { connectMongoDB } from "./config/db.js"
import { issuesRouter } from "./routes/issues.js"
import { seedDatabase } from "./seed.js"

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 5000

// Middleware
app.use(cors({ origin: "*" }))
app.use(express.json({ limit: "25mb" }))
app.use(express.urlencoded({ extended: true, limit: "25mb" }))

// Lazy DB connection for serverless environments (e.g. Vercel)
let dbPromise: Promise<boolean> | null = null
function lazyConnectDB(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(true)
  if (!dbPromise) {
    dbPromise = connectMongoDB().finally(() => {
      dbPromise = null
    })
  }
  return dbPromise
}

app.use(async (_req, _res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await lazyConnectDB()
    } catch {
      // In-memory fallback available in router
    }
  }
  next()
})

// Routes: support both /api/... and /... in case Vercel rewrite strips prefix
app.use("/api/issues", issuesRouter)
app.use("/issues", issuesRouter)

// Health Check Endpoint: support both /api/health and /health
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: "ok",
    service: "Matram AI Civic Backend API",
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Fallback Store",
    timestamp: new Date().toISOString(),
  })
}
app.get("/api/health", healthHandler)
app.get("/health", healthHandler)
app.get("/", healthHandler)

// Only start standalone server and listener when NOT running in Vercel Serverless
async function startServer() {
  const dbConnected = await connectMongoDB()
  if (dbConnected) {
    try {
      await seedDatabase(false)
    } catch (err) {
      console.warn("⚠️ Auto-seed notice:", err)
    }
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Express Backend Server running on http://0.0.0.0:${PORT}`)
  })

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Please stop the running process or change PORT in .env`)
    } else {
      console.error("❌ Express Server Error:", err)
    }
  })
}

if (!process.env.VERCEL) {
  startServer()
}

export { app }
export default app
