import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";

let app;
let mongoServer;
let generateContentMock;

const setupTestApp = async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.SHARE_TOKEN_SECRET = "test-share-secret";
  process.env.GEMINI_API_KEY = "test-api-key";
  process.env.GEMINI_MODEL = "models/gemini-test";
  process.env.UPSTASH_REDIS_REST_URL = "";
  process.env.UPSTASH_REDIS_REST_TOKEN = "";

  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  process.env.MONGO_URI = mongoServer.getUri();

  jest.unstable_mockModule("@google/genai", () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => {
      generateContentMock = jest.fn();
      return { models: { generateContent: generateContentMock } };
    }),
  }));

  const module = await import("../server.js");
  app = module.default;

  return app;
};

const clearDatabase = async () => {
  if (mongoose.connection?.readyState) {
    await mongoose.connection.db.dropDatabase();
  }
};

const teardownTestApp = async () => {
  if (mongoose.connection?.readyState) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

const getGenerateContentMock = () => generateContentMock;

const buildUser = (overrides = {}) => ({
  name: "Test User",
  email: `user_${Math.random().toString(16).slice(2)}@example.com`,
  password: "Password123",
  ...overrides,
});

const withItemTotals = (items) =>
  items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const taxPercent = Number(item.taxPercent || 0);
    const total =
      item.total ?? quantity * unitPrice * (1 + taxPercent / 100);
    return { ...item, total };
  });

const buildInvoicePayload = (overrides = {}) => {
  const invoiceDate = overrides.invoiceDate || new Date().toISOString();
  const items = withItemTotals(
    overrides.items || [
      { name: "Design", quantity: 2, unitPrice: 100, taxPercent: 10 },
    ]
  );

  return {
    invoiceNumber: overrides.invoiceNumber || "INV-001",
    invoiceDate,
    dueDate: overrides.dueDate,
    billFrom: overrides.billFrom || { businessName: "Studio" },
    billTo: overrides.billTo || { clientName: "ClientCo" },
    items,
    notes: overrides.notes || "Thanks",
    paymentTerms: overrides.paymentTerms || "Net 15",
  };
};

const registerUser = async (user) =>
  request(app).post("/api/auth/register").send(user);

const loginUser = async (user) =>
  request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });

const getCookie = (res) => res.headers["set-cookie"]?.[0];

const createInvoice = async (cookie, payload) =>
  request(app)
    .post("/api/invoices")
    .set("Cookie", cookie)
    .send(payload);

export {
  setupTestApp,
  clearDatabase,
  teardownTestApp,
  getGenerateContentMock,
  buildUser,
  buildInvoicePayload,
  registerUser,
  loginUser,
  getCookie,
  createInvoice,
};
