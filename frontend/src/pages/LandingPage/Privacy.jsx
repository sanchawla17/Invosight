import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>

        <p className="text-slate-600 leading-relaxed mb-4">
          Invosight is a personal and educational project by Sanyam Chawla. It is designed to demonstrate full-stack development and AI integration skills.
        </p>

        <p className="text-slate-600 leading-relaxed mb-4">
          <strong>No personal data collection:</strong> This demo does not collect or share personal data. There are no cookies or tracking tools in use.
        </p>

        <p className="text-slate-600 leading-relaxed mb-6">
          If you plan to host this publicly and accept real users, you should replace this page with a full policy that explains how you store and protect user data and how users can contact you about their data.
        </p>

        <div className="flex gap-3">
          <Link to="/contact" className="px-5 py-3 bg-emerald-900 text-white rounded-lg">Ask a question</Link>
          <Link to="/" className="px-5 py-3 border rounded-lg">Back home</Link>
        </div>
      </div>
    </section>
  );
};

export default Privacy;
