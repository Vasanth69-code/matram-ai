import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectMongoDB } from "./config/db.js"
import { issuesRouter } from "./routes/issues.js"
import { seedDatabase } from "./seed.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: "*" }))
app.use(express.json({ limit: "25mb" }))
app.use(express.urlencoded({ extended: true, limit: "25mb" }))

// Routes
app.use("/api/issues", issuesRouter)

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Matram AI Civic Backend API",
    mongodb: "Connected",
    timestamp: new Date().toISOString(),
  })
})

// Start Server and Connect DB
async function startServer() {
  const dbConnected = await connectMongoDB()
  if (dbConnected) {
    try {
      await seedDatabase(false)
    } catch (err) {
      console.warn("⚠️ Auto-seed notice:", err)
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Express Backend Server running on http://localhost:${PORT}`)
  })

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Please stop the running process or change PORT in .env`)
    } else {
      console.error("❌ Express Server Error:", err)
    }
  })
}

startServer()

