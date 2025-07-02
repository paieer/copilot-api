import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import { completionRoutes } from "./routes/chat-completions/route"
import { embeddingRoutes } from "./routes/embeddings/route"
import { messageRoutes } from "./routes/messages/route"
import { modelRoutes } from "./routes/models/route"
import { tokenRoute } from "./routes/token/route"
import { usageRoute } from "./routes/usage/route"

import { config } from "dotenv"
import { randomBytes } from "node:crypto"
import { bearerAuth } from "hono/bearer-auth"
import { writeFileSync } from "node:fs"

export const server = new Hono()

const envFilePath = "/root/.env"
config({ path: [envFilePath] })
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
server.route("/usage", usageRoute)
server.route("/token", tokenRoute)

// Compatibility with tools that expect v1/ prefix
server.route("/v1/chat/completions", completionRoutes)
server.route("/v1/models", modelRoutes)
server.route("/v1/embeddings", embeddingRoutes)

// Anthropic compatible endpoints
server.route("/v1/messages", messageRoutes)
server.post("/v1/messages/count_tokens", (c) => c.json({ input_tokens: 1 }))
