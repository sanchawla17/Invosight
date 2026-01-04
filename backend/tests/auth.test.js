import {
  setupTestApp,
  clearDatabase,
  teardownTestApp,
  buildUser,
  registerUser,
  loginUser,
  getCookie,
} from "./testUtils.js";

let app;

beforeAll(async () => {
  app = await setupTestApp();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestApp();
});

describe("Auth API", () => {
  it("returns 400 or 401 if missing email or password", async () => {
    const res = await loginUser({ email: "", password: "" });
    expect([400, 401]).toContain(res.statusCode);
  });

  it("register + login set auth cookie", async () => {
    const user = buildUser();

    const registerRes = await registerUser(user);
    expect(registerRes.statusCode).toBe(201);
    expect(getCookie(registerRes)).toMatch(/token=/);

    const loginRes = await loginUser(user);
    expect(loginRes.statusCode).toBe(200);
    expect(getCookie(loginRes)).toMatch(/token=/);
  });

  it("returns 401 for wrong password", async () => {
    const user = buildUser();
    await registerUser(user);

    const res = await loginUser({
      email: user.email,
      password: "WrongPass123",
    });

    expect(res.statusCode).toBe(401);
  });
});
