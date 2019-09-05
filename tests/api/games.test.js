const supertest = require("supertest")
const app = require("../../app")
const api = supertest(app)
const Game = require("../../models/game")
const mongoose = require("mongoose")
const testHelper = require("../test_helper")

let token = ""

beforeEach(async () => {
  await Game.deleteMany({})
  console.log("cleared")

  for (let game of testHelper.initialGames) {
    let gameObject = new Game(game)
    await gameObject.save()
  }
  const loginResponse = await api
    .post("/api/login")
    .send(testHelper.newUserCredentials)

  token = loginResponse.body.token
})

describe("Tests GET requests", () => {
  test("games are returned as json", async () => {
    await api
      .get("/api/games")
      .expect(200)
      .expect("Content-Type", /application\/json/)
  })

  test("response 404 with non-existing id", async () => {
    const validNonexistingId = await testHelper.nonExistingId()
    await api.get(`/api/games/${validNonexistingId}`).expect(404)
  })

  test("all games are returned", async () => {
    const response = await api.get("/api/games")
    expect(response.body.length).toBe(testHelper.initialGames.length)
  })

  test("certain game name is within the games", async () => {
    const response = await api.get("/api/games")

    const gameNames = response.body.map(r => r.name)
    expect(gameNames).toContain("Halo2")
  })
})

describe("test POST requests", () => {
  test("If no auth header, returns 401", async () => {
    await api.post("/api/games").expect(401)
  })

  test("adding a new game returns all games + new game", async () => {
    const newGame = {
      name: "Super Smash Bros. Melee",
      year: "2012"
    }

    await api
      .post("/api/games")
      .set("Authorization", "Bearer " + token)
      .send(newGame)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const totalGames = await testHelper.gamesInDb()
    expect(totalGames.length).toBe(testHelper.initialGames.length + 1)
    const gameNames = totalGames.map(n => n.name)
    expect(gameNames).toContain("Super Smash Bros. Melee")
  })

  test("game without name and year is ignored", async () => {
    const newGame = {
      date: new Date()
    }

    await api
      .post("/api/games")
      .set("Authorization", "Bearer " + token)
      .send(newGame)
      .expect(400)

    const totalGames = await testHelper.gamesInDb()

    expect(totalGames.length).toBe(testHelper.initialGames.length)
  })
})

describe("Test DELETE requests", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const initialGames = await testHelper.gamesInDb()
    const targetGame = initialGames[0]

    await api.delete(`/api/games/${targetGame.id}`).expect(204)

    const gamesAfterDeletion = await testHelper.gamesInDb()

    expect(gamesAfterDeletion.length).toBe(testHelper.initialGames.length - 1)

    const gameNames = gamesAfterDeletion.map(r => r.name)

    expect(gameNames).not.toContain(targetGame.name)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
