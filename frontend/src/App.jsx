import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Client side routing
import { Toaster } from "react-hot-toast"; // Toast notifications

// Importing Pages
import LandingPage from "./pages/LandingPage/LandingPage";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AllInvoices from "./pages/Invoices/AllInvoices";
import CreateInvoice from "./pages/Invoices/CreateInvoice";
import InvoiceDetail from "./pages/Invoices/InvoiceDetail";
import SharedInvoice from "./pages/Invoices/SharedInvoice";
import Stats from "./pages/Stats/Stats";
import Clients from "./pages/Clients/Clients";
import ClientDetail from "./pages/Clients/ClientDetail";
import Tools from "./pages/Tools/Tools";
import ProfilePage from "./pages/Profile/ProfilePage";
import About from "./pages/LandingPage/About"
import Contact from "./pages/LandingPage/Contact"
import Privacy from "./pages/LandingPage/Privacy"
import Terms from "./pages/LandingPage/Terms"
// Importing Components
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Protecting routes
import { AuthProvider } from "./context/AuthContext"; // Auth Context

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/share/:token" element={<SharedInvoice />} /> 


          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stats" element={<Stats />} />
            <Route path="tools" element={<Tools />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:clientKey" element={<ClientDetail />} />
            <Route path="invoices" element={<AllInvoices />} />
            <Route path="invoices/new" element={<CreateInvoice />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <Toaster // 
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </AuthProvider>
  )
}

export default App
