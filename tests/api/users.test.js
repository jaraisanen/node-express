const supertest = require("supertest")
const app = require("../../app")
const api = supertest(app)
const User = require("../../models/user")
const mongoose = require("mongoose")
const testHelper = require("../test_helper")

describe("when there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await testHelper.hashPassword("testi")

    const user = new User({
      username: "rais",
      name: "Tarmo Kauppias",
      passwordHash
    })
    await user.save()
  })

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await testHelper.usersInDb()
    const passwordHash = await testHelper.hashPassword("testi")

    const newUser = {
      username: "marko",
      name: "marko männikkö",
      password: passwordHash
    }

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test("creation fails with if username already taken", async () => {
    const usersAtStart = await testHelper.usersInDb()
    const passwordHash = await testHelper.hashPassword("testi")

    const newUser = {
      username: "rais",
      name: "Tarmo Kauppias",
      password: passwordHash
    }
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    expect(result.body.error).toContain("`username` to be unique")

    const usersAtEnd = await testHelper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
