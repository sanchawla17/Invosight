import { Link } from "react-router-dom";

const About = () => {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">About Invosight</h1>
        <p className="text-slate-600 leading-relaxed mb-6">
          Invosight was built by <strong>Sanyam Chawla</strong> to make invoice management simple and smart using modern AI.
          It helps users quickly create, edit and manage invoices, generate payment reminders, and get AI-powered insights — all in one easy-to-use web app.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 bg-gradient-to-tr from-emerald-50 to-white rounded-lg border">
            <h4 className="font-semibold text-slate-900">Why Invosight?</h4>
            <p className="text-sm text-slate-600 mt-2">
              Save time creating invoices, reduce errors with AI parsing, and get reminders & summaries that help you get paid faster.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-tr from-emerald-50 to-white rounded-lg border">
            <h4 className="font-semibold text-slate-900">Who is it for?</h4>
            <p className="text-sm text-slate-600 mt-2">
              Freelancers, small business owners, and anyone who needs clean, professional invoices without the hassle.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link to="/dashboard" className="px-6 py-3 bg-gradient-to-r from-emerald-900 to-emerald-700 text-white rounded-xl font-semibold shadow hover:scale-[1.01] transition transform">
            Try Dashboard
          </Link>

          <a href="https://github.com/sanchawla17/Invosight" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-slate-200 rounded-xl text-slate-900 hover:bg-slate-50 transition">
            View Code on GitHub
          </a>

          <Link to="/contact" className="ml-auto text-sm text-slate-500 hover:underline">Contact the creator →</Link>
        </div>

        {/* Go Back Button */}
        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-lg font-medium hover:scale-105 shadow transition-all"
          >
            ← Go Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
