import { BarChart2, Calculator, FileText, LayoutDashboard, Mail, Plus, Sparkles, UserRound, Users } from "lucide-react";

export const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Invoice Builder",
    description:
      "Paste text or upload a receipt photo and let AI prefill an invoice in seconds.",
  },
  {
    icon: Users,
    title: "Client and Invoice Hub",
    description:
      "Track clients, invoice history, and outstanding balances all in one place.",
  },
  {
    icon: Mail,
    title: "Shareable Links and Reminders",
    description:
      "Send read-only invoice links and generate payment reminders when you need them.",
  },
  {
    icon: BarChart2,
    title: "Insights and Tools",
    description:
      "See revenue trends, status breakdowns, top clients, and use quick calculators.",
  },
];

// sample testimonials data
export const TESTIMONIALS = [
  {
    quote:
      "Invosight makes invoicing fast. I paste project details or a receipt, review the fields, and send in minutes.",
    author: "Aisha Khan",
    title: "Freelance Designer",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=AK",
  },
  {
    quote:
      "Share links and reminder tones keep my follow-ups professional. Clients pay faster without awkward emails.",
    author: "Rohan Mehta",
    title: "Agency Owner",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=RM",
  },
  {
    quote:
      "The clients view and stats show who owes what, and the tools help with quick tax and discount checks.",
    author: "Neha Patel",
    title: "Consultant",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=NP",
  },
];

// sample FAQs data
export const FAQS = [
  {
    question: "Can I create an invoice from text or a receipt photo?",
    answer: "Yes. Paste text or upload a receipt image, then review and edit the fields before saving."
  },
  {
    question: "Can I share invoices with clients?",
    answer: "Yes. Generate a read-only share link and disable it anytime from the invoice view."
  },
  {
    question: "Do you manage clients separately?",
    answer: "Yes. The Clients page groups invoices by client and shows totals, outstanding amounts, and recent activity."
  },
  {
    question: "What analytics does Invosight provide?",
    answer: "View revenue over time, status breakdowns, and top clients. AI insights are generated on demand."
  },
  {
    question: "What tools are included?",
    answer: "Currency conversion, discount, tax, and late fee estimators for quick calculations."
  },
  {
    question: "How do payment reminders work?",
    answer: "Generate a reminder email with tone options (polite, firm, final) when needed."
  },
  {
    question: "Is Invosight free to use?",
    answer: "Yes. Invosight is free with no subscriptions or hidden fees."
  }
];

// Navigation items configuration
export const NAVIGATION_MENU = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "invoices", name: "Invoices", icon: FileText },
  { id: "invoices/new", name: "Create Invoice", icon: Plus },
  { id: "clients", name: "Clients", icon: Users },
  { id: "stats", name: "Stats", icon: BarChart2 },
  { id: "tools", name: "Tools", icon: Calculator },
  { id: "profile", name: "Profile", icon: UserRound },
];

