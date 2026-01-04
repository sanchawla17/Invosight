const InvoiceTotalsCard = ({ subtotal, taxTotal, total }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm shadow-gray-100 border border-slate-200 flex flex-col justify-center">
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-slate-600">
        <p>Subtotal:</p>
        <p>${subtotal.toFixed(2)}</p>
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <p>Tax:</p>
        <p>${taxTotal.toFixed(2)}</p>
      </div>
      <div className="flex justify-between text-lg font-semibold text-slate-900 border-t border-slate-200 pt-4 mt-4">
        <p>Total:</p>
        <p>${total.toFixed(2)}</p>
      </div>
    </div>
  </div>
);

export default InvoiceTotalsCard;
