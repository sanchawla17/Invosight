import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { createInvoice, fetchInvoices } from "../../api/invoiceApi";
import { useAuth } from "../../context/AuthContext";
import { formatDateInput } from "../../utils/date";
import {
  PAYMENT_TERMS_OPTIONS,
  calculateDueDate,
  calculateTotals,
  attachItemTotals,
} from "../../utils/invoice";

import InputField from "../../components/ui/InputField";
import TextareaField from "../../components/ui/TextareaField";
import SelectField from "../../components/ui/SelectField";
import Button from "../../components/ui/Button";
import CreateWithAIModal from "../../components/invoices/CreateWithAIModal";
import InvoiceItemsTable from "../../components/invoices/InvoiceItemsTable";
import InvoiceTotalsCard from "../../components/invoices/InvoiceTotalsCard";

const CreateInvoice = ({ existingInvoice, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [formData, setFormData] = useState(
    existingInvoice || {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      billFrom: {
        businessName: user?.businessName || "",
        email: user?.email || "",
        address: user?.address || "",
        phone: user?.phone || "",
      },
      billTo: { clientName: "", email: "", address: "", phone: "" },
      items: [{ name: "", quantity: 1, unitPrice: 0, taxPercent: 0 }],
      notes: "",
      paymentTerms: "Net 15",
    }
  );
  const [loading, setLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(
    !existingInvoice
  );
  const [isDueDateManual, setIsDueDateManual] = useState(
    Boolean(existingInvoice?.dueDate)
  );
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Populate form if editing an existing invoice or generate new invoice number
  useEffect(() => {
    if (existingInvoice) {
      setFormData({
        ...existingInvoice,
        invoiceDate: formatDateInput(existingInvoice.invoiceDate),
        dueDate: formatDateInput(existingInvoice.dueDate),
      });
      setIsDueDateManual(Boolean(existingInvoice.dueDate));
    } else {
      const generateNewInvoiceNumber = async () => {
        setIsGeneratingNumber(true);
        try {
          const response = await fetchInvoices();
          const invoices = response.data;
          let maxNum = 0;
          invoices.forEach((inv) => {
            const num = parseInt(inv.invoiceNumber.split("-")[1]);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          });
          const newInvoiceNumber = `INV-${String(maxNum + 1).padStart(3, "0")}`;
          setFormData((prev) => ({ ...prev, invoiceNumber: newInvoiceNumber }));
        } catch (error) {
          console.error("Failed to generate invoice number", error);
          setFormData((prev) => ({
            ...prev,
            invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
          }));
        }
        setIsGeneratingNumber(false);
      };
      generateNewInvoiceNumber();
      setIsDueDateManual(false);
    }
  }, [existingInvoice]);

  // If navigated with AI data, populate form fields
  useEffect(() => {
    const aiData = location.state?.aiData; // AI extracted invoice data

    if (aiData) {
      setFormData((prev) => ({
        ...prev,
        billTo: {
          clientName: aiData.clientName || prev.billTo.clientName,
          email: aiData.email || prev.billTo.email,
          address: aiData.address || prev.billTo.address,
          phone: prev.billTo.phone,
        },
        items:
          aiData.items && aiData.items.length > 0
            ? aiData.items.map((item) => ({
                name: item.name || "",
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                taxPercent: item.taxPercent || 0,
              }))
            : prev.items,
      }));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isDueDateManual) {
      return;
    }
    const computedDueDate = calculateDueDate(
      formData.invoiceDate,
      formData.paymentTerms
    );
    if (!computedDueDate || computedDueDate === formData.dueDate) {
      return;
    }
    setFormData((prev) => ({ ...prev, dueDate: computedDueDate }));
  }, [formData.invoiceDate, formData.paymentTerms, isDueDateManual]);

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else {
      if (name === "dueDate") {
        setIsDueDateManual(value !== "");
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [name]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const { subtotal, taxTotal, total } = calculateTotals(formData.items);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const itemsWithTotal = attachItemTotals(formData.items);
    const finalFormData = { ...formData, items: itemsWithTotal, subtotal, taxTotal, total };

    if (onSave) {
      await onSave(finalFormData);
    } else {
      try {
        await createInvoice(finalFormData);
        toast.success("Invoice created successfully!");
        navigate("/invoices");
      } catch (error) {
        toast.error("Failed to create invoice.");
        console.error(error);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <CreateWithAIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
      <form onSubmit={handleSubmit} className="space-y-8 pb-[100vh]">
        <div className="flex justify-between items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {existingInvoice ? "Edit Invoice" : "Create Invoice"}
          </h2>
          <div className="flex items-center gap-2">
            {!existingInvoice && (
              <Button
                type="button"
                variant="ai"
                icon={Sparkles}
                onClick={() => setIsAiModalOpen(true)}
              >
                Generate with AI
              </Button>
            )}
            <Button type="submit" isLoading={loading || isGeneratingNumber}>
              {existingInvoice ? "Save Changes" : "Save Invoice"}
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Invoice Number"
              name="invoiceNumber"
              readOnly
              value={formData.invoiceNumber}
              placeholder={isGeneratingNumber ? "Generating..." : ""}
              disabled
            />
            <InputField
              label="Invoice Date"
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleInputChange}
            />
            <InputField
              label="Due Date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Bill From
            </h3>
            <InputField
              label="Business Name"
              name="businessName"
              value={formData.billFrom.businessName}
              onChange={(e) => handleInputChange(e, "billFrom")}
            />
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.billFrom.email}
              onChange={(e) => handleInputChange(e, "billFrom")}
            />
            <TextareaField
              label="Address"
              name="address"
              value={formData.billFrom.address}
              onChange={(e) => handleInputChange(e, "billFrom")}
            />
            <InputField
              label="Phone"
              name="phone"
              value={formData.billFrom.phone}
              onChange={(e) => handleInputChange(e, "billFrom")}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Bill To
            </h3>
            <InputField
              label="Client Name"
              name="clientName"
              value={formData.billTo.clientName}
              onChange={(e) => handleInputChange(e, "billTo")}
            />
            <InputField
              label="Client Email"
              type="email"
              name="email"
              value={formData.billTo.email}
              onChange={(e) => handleInputChange(e, "billTo")}
            />
            <TextareaField
              label="Client Address"
              name="address"
              value={formData.billTo.address}
              onChange={(e) => handleInputChange(e, "billTo")}
            />
            <InputField
              label="Client Phone"
              name="phone"
              value={formData.billTo.phone}
              onChange={(e) => handleInputChange(e, "billTo")}
            />
          </div>
        </div>

        <InvoiceItemsTable
          items={formData.items}
          onItemChange={handleItemChange}
          onRemoveItem={handleRemoveItem}
          onAddItem={handleAddItem}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Notes & Terms
            </h3>
            <TextareaField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
            <SelectField
              label="Payment Terms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleInputChange}
              options={PAYMENT_TERMS_OPTIONS}
            />
          </div>
          <InvoiceTotalsCard subtotal={subtotal} taxTotal={taxTotal} total={total} />
        </div>
      </form>
    </>
  );
};

export default CreateInvoice;

