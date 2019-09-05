const supertest = require("supertest")
const app = require("../../app")
const api = supertest(app)
const mongoose = require("mongoose")

describe("JWT api call functionalities", () => {
  test("JWT returned after successful api call", async () => {
    const loginResponse = await api
      .post("/api/login")
      .send({ username: "rais", password: "testi" })
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const response = loginResponse.body
    expect(response).toHaveProperty("token")
    expect(response.token).not.toBeNull()
  })

  test("Return error with falsy credentials", async () => {
    const loginResponse = await api
      .post("/api/login")
      .send({ username: "raiss", password: "testi" })
      .expect(401)

    const response = loginResponse.body
    expect(response).toHaveProperty("error")
    expect(response.error).toBe("invalid username or password")
  })
})

afterAll(done => {
  // Avoids a bug that prevents Jest exiting
  setImmediate(done)
  mongoose.connection.close()
})
