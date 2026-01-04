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

describe("Invoice API", () => {
  it("creates invoice and lists it with correct totals", async () => {
    const user = buildUser();
    const registerRes = await registerUser(user);
    const cookie = getCookie(registerRes);

    const payload = buildInvoicePayload();
    const createRes = await createInvoice(cookie, payload);

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.subtotal).toBeCloseTo(200, 2);
    expect(createRes.body.taxTotal).toBeCloseTo(20, 2);
    expect(createRes.body.total).toBeCloseTo(220, 2);

    const listRes = await request(app)
      .get("/api/invoices")
      .set("Cookie", cookie);

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0]._id).toBe(createRes.body._id);
  });

  it("auto-derives due date from payment terms", async () => {
    const user = buildUser();
    const registerRes = await registerUser(user);
    const cookie = getCookie(registerRes);

    const invoiceDate = new Date("2024-01-01T00:00:00.000Z").toISOString();
    const payload = buildInvoicePayload({
      invoiceNumber: "INV-002",
      invoiceDate,
      paymentTerms: "Net 15",
      dueDate: undefined,
    });

    const res = await createInvoice(cookie, payload);

    expect(res.statusCode).toBe(201);
    const expected = new Date(invoiceDate);
    expected.setDate(expected.getDate() + 15);

    const received = new Date(res.body.dueDate);
    expect(received.toISOString().slice(0, 10)).toBe(
      expected.toISOString().slice(0, 10)
    );
  });

  it("prevents other users from fetching an invoice", async () => {
    const owner = buildUser();
    const otherUser = buildUser();

    const ownerRes = await registerUser(owner);
    const ownerCookie = getCookie(ownerRes);

    const invoiceRes = await createInvoice(ownerCookie, buildInvoicePayload());

    const otherRes = await registerUser(otherUser);
    const otherCookie = getCookie(otherRes);

    const res = await request(app)
      .get(`/api/invoices/${invoiceRes.body._id}`)
      .set("Cookie", otherCookie);

    expect([401, 403]).toContain(res.statusCode);
  });
});
