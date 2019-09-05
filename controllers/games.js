const gameRouter = require("express").Router()
const jwt = require("jsonwebtoken")
const Game = require("../models/game")
const User = require("../models/user")

const getTokenFrom = request => {
  const authorization = request.get("authorization")
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7)
  }
  return null
}

gameRouter.get("/", async (request, response) => {
  const games = await Game.find({}).populate("user", { username: 1, name: 1 })
  response.json(games.map(game => game.toJSON()))
})

gameRouter.get("/:id", (request, response, next) => {
  Game.findById(request.params.id)
    .then(game => {
      if (game) {
        response.json(game.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

gameRouter.post("/", async (request, response, next) => {
  const body = request.body

  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: "token missing or invalid" })
    }

    const user = await User.findById(decodedToken.id)

    const game = new Game({
      name: body.name,
      year: body.year,
      date: new Date(),
      user: user._id
    })

    const savedGame = await game.save()
    user.games = user.games.concat(savedGame._id)
    await user.save()
    response.json(savedGame.toJSON())
  } catch (exception) {
    next(exception)
  }
})

gameRouter.delete("/:id", async (request, response, next) => {
  try {
    await Game.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

gameRouter.put("/:id", (request, response, next) => {
  const body = request.body

  const game = {
    name: body.name,
    year: body.year
  }

  Game.findByIdAndUpdate(request.params.id, game, { new: true })
    .then(updatedGame => {
      response.json(updatedGame.toJSON())
    })
    .catch(error => next(error))
})

module.exports = gameRouter
