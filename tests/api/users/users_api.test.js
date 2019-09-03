const User = require("../../models/user")
const testHelper = require("../test_helper")

describe("when there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: "root", password: "sekret" })
    await user.save()
  })

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await testHelper.usersInDb()

    const newUser = {
      username: "rais",
      name: "Tarmo Kauppias",
      password: "superSecret"
    }

    // eslint-disable-next-line no-undef
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
})
