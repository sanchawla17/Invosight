import request from "supertest";
import {
  setupTestApp,
  clearDatabase,
  teardownTestApp,
  buildUser,
  buildInvoicePayload,
  registerUser,
  getCookie,
  createInvoice,
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

describe("Stats API", () => {
  it("returns revenue series and status breakdown", async () => {
    const user = buildUser();
    const registerRes = await registerUser(user);
    const cookie = getCookie(registerRes);

    await createInvoice(cookie, buildInvoicePayload());

    const res = await request(app)
      .get("/api/stats?range=30&interval=day")
      .set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.revenueSeries)).toBe(true);
    expect(Array.isArray(res.body.statusBreakdown)).toBe(true);
    expect(res.body.statusBreakdown).toHaveLength(3);
  });
});
