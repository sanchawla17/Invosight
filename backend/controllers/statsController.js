import { buildStats } from "../utils/stats.js";

// @desc    Get stats for dashboard charts
// @route   GET /api/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const { range, interval } = req.query;
    const stats = await buildStats({
      userId: req.user.id,
      rangeDays: range,
      interval,
    });
    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};
