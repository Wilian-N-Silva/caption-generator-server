import fastify from "fastify"
import cors from '@fastify/cors'
import fastifyStatic from "@fastify/static"
import { appRoutes } from "./routes"

const app = fastify()
const path = require("path")

app.register(cors)
app.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: '/public',
  serve: true
})
app.register(appRoutes)

app
  .listen({
    host: "0.0.0.0",
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server running")
  })
