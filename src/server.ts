import { config } from "dotenv"
import { Hono } from "hono"
import { bearerAuth } from "hono/bearer-auth"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { randomBytes } from "node:crypto"
import { writeFileSync } from "node:fs"

import { completionRoutes } from "./routes/chat-completions/route"
import { embeddingRoutes } from "./routes/embeddings/route"
import { modelRoutes } from "./routes/models/route"

export const server = new Hono()

const envFilePath = "/data/.env"
config()
const API_KEY = process.env.API_KEY || randomBytes(20).toString("hex")
if (!process.env.API_KEY) {
  writeFileSync(envFilePath, `API_KEY=${API_KEY}\n`)
}
console.log(`Current API_KEY: ${API_KEY}`)

server.use(logger())
server.use(cors())

server.get("/", (c) => c.text("Server running"))

server.use(bearerAuth({ token: API_KEY }))
server.route("/chat/completions", completionRoutes)
server.route("/models", modelRoutes)
server.route("/embeddings", embeddingRoutes)

// Compatibility with tools that expect v1/ prefix
server.route("/v1/chat/completions", completionRoutes)
server.route("/v1/models", modelRoutes)
server.route("/v1/embeddings", embeddingRoutes)
