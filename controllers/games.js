const gameRouter = require("express").Router()
const Game = require("../models/game")
const User = require("../models/user")

gameRouter.get("/", async (request, response) => {
  const games = await Game.find({})
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

  const user = await User.findById(body.userId)

  const game = new Game({
    name: body.name,
    year: body.year,
    date: new Date(),
    user: user._id
  })
  try {
    const savedGame = await game.save()
    user.games = user.games.concat(savedGame._id)
    await user.save()
    response.json(savedGame.toJSON())
  } catch (error) {
    next(error)
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
