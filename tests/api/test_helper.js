const Game = require("../../models/game")
const User = require("../../models/users")

const initialGames = [
  {
    name: "Halo2",
    year: "2009",
    date: new Date()
  },
  {
    name: "Halo4",
    year: "2014",
    date: new Date()
  }
]

const nonExistingId = async () => {
  const game = new Game({ name: "New Game", year: "2000", date: new Date() })
  await game.save()
  await game.remove()

  return game._id.toString()
}

const gamesInDb = async () => {
  const games = await Game.find({})
  return games.map(game => game.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialGames,
  nonExistingId,
  gamesInDb,
  usersInDb
}
