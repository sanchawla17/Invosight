import { ArrowRightLeft, BadgePercent, Clock, Receipt } from "lucide-react";

const TOOL_CARDS = [
  {
    id: "currency",
    title: "Currency Converter",
    description: "Live rate conversion for quick reference.",
    icon: ArrowRightLeft,
  },
  {
    id: "discount",
    title: "Discount Calculator",
    description: "Flat or percent discount in seconds.",
    icon: BadgePercent,
  },
  {
    id: "tax",
    title: "Tax Calculator",
    description: "Estimate tax and totals quickly.",
    icon: Receipt,
  },
  {
    id: "late-fee",
    title: "Late Fee Estimator",
    description: "Estimate fees for overdue payments.",
    icon: Clock,
  },
];

export { TOOL_CARDS };
