// @desc    Convert currency using a public FX API (reference only)
// @route   GET /api/tools/convert?amount=100&from=USD&to=INR
// @access  Private
export const convertCurrency = async (req, res) => {
  try {
    const amount = Number.parseFloat(req.query.amount);
    const from = String(req.query.from || "").trim().toUpperCase();
    const to = String(req.query.to || "").trim().toUpperCase();

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!from || !to) {
      return res.status(400).json({ message: "Invalid currency code" });
    }

    const response = await fetch(
      `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`
    );
    if (!response.ok) {
      return res.status(502).json({ message: "FX service unavailable" });
    }
    const data = await response.json();
    if (data?.result !== "success" || !data?.rates) {
      return res.status(502).json({ message: "FX service error" });
    }

    const rate = data.rates[to];
    if (!rate) {
      return res.status(400).json({ message: "Unsupported currency" });
    }

    const converted = amount * Number(rate);

    return res.json({
      amount,
      from,
      to,
      rate,
      converted,
      timestamp: data.time_last_update_utc || new Date().toUTCString(),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error converting currency", error: error.message });
  }
};
