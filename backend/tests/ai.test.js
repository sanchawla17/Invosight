import {
  setupTestApp,
  clearDatabase,
  teardownTestApp,
  getGenerateContentMock,
  buildUser,
  buildInvoicePayload,
  registerUser,
  getCookie,
  createInvoice,
} from "./testUtils.js";
import request from "supertest";

let app;
let generateContentMock;

beforeAll(async () => {
  app = await setupTestApp();
  generateContentMock = getGenerateContentMock();
});

afterEach(async () => {
  if (generateContentMock) {
    generateContentMock.mockReset();
  }
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestApp();
});

describe("AI endpoints", () => {
  it("parses invoice text with mocked Gemini", async () => {
    const user = buildUser();
    const registerRes = await registerUser(user);
    const cookie = getCookie(registerRes);

    const mockJson = JSON.stringify({
      clientName: "Acme",
      email: "billing@acme.com",
      address: "123 Road",
      items: [{ name: "Design", quantity: 1, unitPrice: 99 }],
    });

    generateContentMock.mockResolvedValue({ text: mockJson });

    const res = await request(app)
      .post("/api/ai/parse-text")
      .set("Cookie", cookie)
      .send({ text: "Invoice for Acme" });

    expect(res.statusCode).toBe(200);
    expect(res.body.clientName).toBe("Acme");
    expect(res.body.items).toHaveLength(1);
  });

  it("parses invoice image with mocked Gemini", async () => {
    const user = buildUser();
    const registerRes = await registerUser(user);
    const cookie = getCookie(registerRes);

    const mockJson = JSON.stringify({
      clientName: "ImageCo",
      email: "pay@imageco.com",
      address: "456 Lane",
      items: [{ name: "Logo", quantity: 2, unitPrice: 150 }],
    });

    generateContentMock.mockResolvedValue({ text: () => mockJson });

    const res = await request(app)
      .post("/api/ai/parse-image")
      .set("Cookie", cookie)
      .send({
        imageBase64: "data:image/png;base64,aGVsbG8=",
        mimeType: "image/png",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.clientName).toBe("ImageCo");
    expect(res.body.items).toHaveLength(1);
  });

  it("returns 400 when AI parse-text is missing text", async () => {
    const user = buildUser();
    const registerRes = await registerUser(user);
    const cookie = getCookie(registerRes);

    const res = await request(app)
      .post("/api/ai/parse-text")
      .set("Cookie", cookie)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it("generates reminder text with selected tone", async () => {
    const user = buildUser({ businessName: "Studio One" });
    const registerRes = await registerUser(user);
    const cookie = getCookie(registerRes);

    const invoiceRes = await createInvoice(
      cookie,
      buildInvoicePayload({ dueDate: new Date().toISOString() })
    );

    generateContentMock.mockResolvedValue({
      text: "Subject: Payment reminder, Please pay soon.",
    });

    const res = await request(app)
      .post("/api/ai/generate-reminder")
      .set("Cookie", cookie)
      .send({ invoiceId: invoiceRes.body._id, tone: "firm" });

    expect(res.statusCode).toBe(200);
    expect(res.body.reminderText).toMatch(/Subject:/i);
    expect(generateContentMock).toHaveBeenCalledTimes(1);

    const prompt = generateContentMock.mock.calls[0][0].contents;
    expect(prompt).toMatch(/firm/i);
  });
});
