import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Contact</h1>
        <p className="text-slate-600 mb-6">
          Need help or want to give feedback? Reach out — I read everything. 👋
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-900 font-semibold">S</div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Sanyam Chawla</div>
              <div className="text-sm text-slate-500">Creator & Developer</div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-700">Email</p>
            <a href="mailto:sanchawla17@gmail.com" className="text-emerald-900 font-medium hover:underline">
              sanchawla17@gmail.com
            </a>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-700">Location</p>
            <div className="text-slate-600">IND</div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <a href="mailto:sanchawla17@gmail.com" className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg">
            Email Me
          </a>
          <a href="https://www.linkedin.com/in/sanyam-chawla-b6b34019b/" target="_blank" rel="noopener noreferrer" className="px-5 py-3 border rounded-lg text-slate-700">
            LinkedIn
          </a>
          <a href="https://github.com/sanchawla17" target="_blank" rel="noopener noreferrer" className="px-5 py-3 border rounded-lg text-slate-700">
            GitHub
          </a>
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

export default Contact;
