import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Terms of Service</h1>

        <p className="text-slate-600 mb-4">
          Invosight is provided for learning and demonstration purposes only. It is not a commercial product — there are no payments or subscriptions.
        </p>

        <p className="text-slate-600 mb-4">
          Use it freely for testing, exploring, and portfolio showcasing. If you host this publicly for real users, replace these terms with a legal terms document.
        </p>

        <div className="flex gap-3">
          <Link to="/contact" className="px-5 py-3 bg-emerald-900 text-white rounded-lg">Contact about terms</Link>
          <Link to="/" className="px-5 py-3 border rounded-lg">Back to home</Link>
        </div>
      </div>
    </section>
  );
};

export default Terms;
