import request from "supertest";
import jwt from "jsonwebtoken";
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

describe("Invoice share links", () => {
  it("returns shared invoice and rejects expired share token", async () => {
    const user = buildUser();
    const registerRes = await registerUser(user);
    const cookie = getCookie(registerRes);

    const invoiceRes = await createInvoice(cookie, buildInvoicePayload());

    const shareRes = await request(app)
      .post(`/api/invoices/${invoiceRes.body._id}/share`)
      .set("Cookie", cookie);

    expect(shareRes.statusCode).toBe(200);
    expect(shareRes.body.shareToken).toBeTruthy();

    const sharedRes = await request(app).get(
      `/api/invoices/share/${shareRes.body.shareToken}`
    );

    expect(sharedRes.statusCode).toBe(200);
    expect(sharedRes.body.invoiceNumber).toBe(invoiceRes.body.invoiceNumber);

    const expiredToken = jwt.sign(
      {
        invoiceId: invoiceRes.body._id,
        type: "invoice_share",
        exp: Math.floor(Date.now() / 1000) - 10,
      },
      process.env.SHARE_TOKEN_SECRET
    );

    const expiredRes = await request(app).get(
      `/api/invoices/share/${expiredToken}`
    );

    expect([401, 404]).toContain(expiredRes.statusCode);
  });
});
