const config = require("./utils/config")
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors")
const gamesRouter = require("./controllers/games")
const usersRouter = require("./controllers/users")
const middleware = require("./utils/middleware")
const mongoose = require("mongoose")
const morgan = require("morgan")
const logger = require("./utils/logger")

logger.info("connecting to MongoDB")

mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    logger.info("connected to MongoDB")
  })
  .catch(error => {
    logger.info("error connection to MongoDB:", error.message)
  })

app.use(cors())
app.use(express.static("build"))
app.use(bodyParser.json())

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      JSON.stringify(req.body),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms"
    ].join(" ")
  })
)

app.use("/api/games", gamesRouter)
app.use("/api/users", usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
