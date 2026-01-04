import Button from "../ui/Button";
import { Plus, Trash2 } from "lucide-react";

const InvoiceItemsTable = ({ items, onItemChange, onRemoveItem, onAddItem }) => (
  <div className="bg-white border border-slate-200 rounded-lg shadow-sm shadow-gray-100 overflow-hidden">
    <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
      <h3 className="text-lg font-semibold text-slate-900">Items</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Item
            </th>
            <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Qty
            </th>
            <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tax (%)
            </th>
            <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-2 sm:px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50">
              <td className="px-2 sm:px-6 py-4">
                <input
                  type="text"
                  name="name"
                  value={item.name}
                  onChange={(e) => onItemChange(e, index)}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Item name"
                />
              </td>
              <td className="px-2 sm:px-6 py-4">
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => onItemChange(e, index)}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="1"
                />
              </td>
              <td className="px-2 sm:px-6 py-4">
                <input
                  type="number"
                  name="unitPrice"
                  value={item.unitPrice}
                  onChange={(e) => onItemChange(e, index)}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </td>
              <td className="px-2 sm:px-6 py-4">
                <input
                  type="number"
                  name="taxPercent"
                  value={item.taxPercent}
                  onChange={(e) => onItemChange(e, index)}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0"
                />
              </td>
              <td className="px-2 sm:px-6 py-4 text-sm text-slate-500">
                ${((item.quantity || 0) * (item.unitPrice || 0) * (1 + (item.taxPercent || 0) / 100)).toFixed(2)}
              </td>
              <td className="px-2 sm:px-6 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={() => onRemoveItem(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="p-4 sm:p-6 border-t border-slate-200">
      <Button type="button" variant="secondary" onClick={onAddItem} icon={Plus}>
        Add Item
      </Button>
    </div>
  </div>
);

export default InvoiceItemsTable;
