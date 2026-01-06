import Invoice from "../models/Invoice.js";
import { buildStats } from "../utils/stats.js";
import {
  aiClient,
  getModelName,
  extractResponseText,
  parseJsonFromResponse,
} from "../utils/aiClient.js";

export const parseInvoiceFromText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const prompt = `
      You are an expert invoice data extraction AI. Analyze the following text and extract the relevant information to create an invoice.
      The output MUST be a valid JSON object.

      The JSON object should have the following structure:
      {
        "clientName": "string",
        "email": "string (if available)",
        "address": "string (if available)",
        "items": [
          {
            "name": "string",
            "quantity": "number",
            "unitPrice": "number"
          }
        ]
      }

      Here is the text to parse:
      --- TEXT START ---
      ${text}
      --- TEXT END ---

      Extract the data and provide only the JSON object.
    `;

    const response = await aiClient.models.generateContent({
      model: getModelName(),
      contents: prompt,
    });

    const parsedData = await parseJsonFromResponse(response);
    if (!parsedData) {
      throw new Error("Could not parse invoice JSON from AI response.");
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Error parsing invoice with AI:", error);
    res.status(500).json({ message: "Failed to parse invoice data from text.", details: error.message });
  }
};

export const parseInvoiceFromImage = async (req, res) => {
  const { imageBase64, mimeType, contextText } = req.body;

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ message: "Image data and mime type are required" });
  }

  const cleanedBase64 = String(imageBase64)
    .replace(/^data:.*;base64,/, "")
    .trim();
  if (!cleanedBase64) {
    return res.status(400).json({ message: "Invalid image data" });
  }
  // Estimate size of base64 image
  const estimatedBytes = Math.ceil((cleanedBase64.length * 3) / 4);
  const maxBytes = 4 * 1024 * 1024;
  if (estimatedBytes > maxBytes) {
    return res.status(413).json({ message: "Image is too large (max 4MB)." });
  }

  try {
    const prompt = `
      You are an expert invoice data extraction AI. Analyze the provided image and extract the relevant information to create an invoice.
      The output MUST be a valid JSON object.

      The JSON object should have the following structure:
      {
        "clientName": "string",
        "email": "string (if available)",
        "address": "string (if available)",
        "items": [
          {
            "name": "string",
            "quantity": "number",
            "unitPrice": "number"
          }
        ]
      }

      ${contextText ? `Additional context: ${contextText}` : ""}

      Extract the data and provide only the JSON object.
    `;

    const response = await aiClient.models.generateContent({
      model: getModelName(),
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: cleanedBase64 } },
          ],
        },
      ],
    });

    const parsedData = await parseJsonFromResponse(response);
    if (!parsedData) {
      throw new Error("Could not parse invoice JSON from AI response.");
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Error parsing invoice image with AI:", error);
    res.status(500).json({
      message: "Failed to parse invoice data from image.",
      details: error.message,
    });
  }
};

export const generateReminderEmail = async (req, res) => {

    const { invoiceId, tone } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ message: "Invoice ID is required" });
  }

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const normalizedTone = typeof tone === "string" ? tone.toLowerCase() : "polite";
    const toneInstructions = {
      polite: "polite, friendly, and professional",
      firm: "firm and direct but still professional and respectful",
      final: "a final notice that is urgent yet professional and respectful",
    };
    const toneInstruction = toneInstructions[normalizedTone] || toneInstructions.polite;
    const senderName = (req.user?.name || "").trim();
    const senderOrganization =
      (req.user?.businessName || invoice.billFrom?.businessName || "").trim();
    const signatureLines = [senderName, senderOrganization].filter(Boolean);
    const signatureBlock =
      signatureLines.length > 0 ? signatureLines.join("\n") : "";

    const prompt = `
      You are a professional accounting assistant. Write a reminder email to a client about an overdue or upcoming invoice payment.
      The tone must be ${toneInstruction}.

      Use the following details to personalize the email:
      - Client Name: ${invoice.billTo.clientName}
      - Invoice Number: ${invoice.invoiceNumber}
      - Amount Due: ${invoice.total.toFixed(2)}
      - Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
      - Sender Name: ${senderName || "Not provided"}
      - Sender Organization: ${senderOrganization || "Not provided"}

      Keep it concise. Start the email with "Subject:".
      End the email with a closing signature that includes the sender name and organization when available.
      Use this signature exactly (omit if not provided):
      ${signatureBlock || "N/A"}
    `;

    const response = await aiClient.models.generateContent({
      model: getModelName(),
      contents: prompt,
    });

    const reminderText = await extractResponseText(response);
    if (!reminderText) {
      throw new Error("Could not extract reminder text from AI response.");
    }

    res.status(200).json({ reminderText });
  } catch (error) {
    console.error("Error generating remainder email with AI:", error);
    res.status(500).json({ message: "Failed to parse invoice data from text.", details: error.message });
  }
};

export const getDashboardSummary = async (req, res) => {

  try {
    const invoices = await Invoice.find({ user: req.user.id });

    if (invoices.length === 0) {
      return res.status(200).json({ insights: ["No invoice data available to generate insights."] });
    }

    // Process and summarize data
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid');
    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalOutstanding = unpaidInvoices.reduce((acc, inv) => acc + inv.total, 0);
    
    const dataSummary = `
      - Total number of invoices: ${totalInvoices}
      - Total paid invoices: ${paidInvoices.length}
      - Total unpaid/pending invoices: ${unpaidInvoices.length}
      - Total revenue from paid invoices: ${totalRevenue.toFixed(2)}
      - Total outstanding amount from unpaid/pending invoices: ${totalOutstanding.toFixed(2)}
      - Recent invoices (last 5): ${invoices.slice(0, 5).map(inv => `Invoice #${inv.invoiceNumber} for ${inv.total.toFixed(2)} with status ${inv.status}`).join(', ')}
    `;

    const prompt = `
      You are a friendly and insightful financial analyst for a small business owner.
      Based on the following summary of their invoice data, provide 2-3 concise and actionable insights.
      Each insight should be a short string in a JSON array.
      The insights should be encouraging and helpful. Do not just repeat the data.
      For example, if there is a high outstanding amount, suggest sending reminders. If revenue is high, be encouraging.

      Data Summary:
      ${dataSummary}

      Return your response as a valid JSON object with a single key "insights" which is an array of strings.
      Example format: { "insights": ["Your revenue is looking strong this month!", "You have 5 overdue invoices. Consider sending reminders to get paid faster."] }
    `;

    const response = await aiClient.models.generateContent({
      model: getModelName(),
      contents: prompt,
    });

    const parsedData = await parseJsonFromResponse(response);
    if (!parsedData || !Array.isArray(parsedData.insights)) {
      return res.status(200).json({
        insights: ["Not enough data to generate insights."],
      });
    }

    res.status(200).json(parsedData);
} catch (error) {
    console.error("Error dashboard summary with AI:", error);
    res.status(500).json({ message: "Failed to parse invoice data from text.", details: error.message });
  }
};

export const getStatsInsights = async (req, res) => {
  try {
    const { range, interval } = req.query;
    const stats = await buildStats({
      userId: req.user.id,
      rangeDays: range,
      interval,
    });

    const hasData =
      stats.revenueSeries.length > 0 ||
      stats.topClients.length > 0 ||
      stats.statusBreakdown.some((item) => item.count > 0);

    if (!hasData) {
      return res.status(200).json({
        summary: "Not enough data",
        insights: [],
        actions: [],
      });
    }

    const statsPayload = {
      rangeDays: stats.rangeDays,
      interval: stats.interval,
      totals: stats.totals,
      revenueSeries: stats.revenueSeries,
      statusBreakdown: stats.statusBreakdown,
      topClients: stats.topClients,
    };

    const prompt = `
      You are a data analyst for a small business.
      Use only the provided JSON. Do not invent numbers or facts.
      If the data is insufficient, respond with summary "Not enough data" and empty arrays.

      Return a valid JSON object with:
      - summary: a short executive summary paragraph
      - insights: 4-6 concise bullet insights
      - actions: 2-3 concise recommended actions

      Keep the total number of bullets (insights + actions) at or below 8.

      JSON data:
      ${JSON.stringify(statsPayload)}
    `;

    const response = await aiClient.models.generateContent({
      model: getModelName(),
      contents: prompt,
    });

    const parsedData = await parseJsonFromResponse(response);
    if (!parsedData) {
      return res.status(200).json({
        summary: "Not enough data",
        insights: [],
        actions: [],
      });
    }

    const insights = Array.isArray(parsedData.insights)
      ? parsedData.insights
      : [];
    const actions = Array.isArray(parsedData.actions)
      ? parsedData.actions
      : [];
    const totalBullets = insights.length + actions.length;
    const trimmedInsights = totalBullets > 8 ? insights.slice(0, 6) : insights;
    const remaining = 8 - trimmedInsights.length;
    const trimmedActions = actions.slice(0, Math.max(0, remaining));

    res.status(200).json({
      summary:
        typeof parsedData.summary === "string" && parsedData.summary.trim()
          ? parsedData.summary.trim()
          : "Not enough data",
      insights: trimmedInsights,
      actions: trimmedActions,
    });
  } catch (error) {
    console.error("Error generating stats insights with AI:", error);
    res
      .status(500)
      .json({ message: "Failed to generate stats insights.", details: error.message });
  }
};
