import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';
import TextareaField from '../ui/TextareaField';
import SelectField from '../ui/SelectField';
import { generateReminder } from "../../api/aiApi";
import toast from 'react-hot-toast';

const ReminderModal = ({isOpen, onClose, invoiceId}) => {

  const [reminderText, setReminderText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [tone, setTone] = useState('polite');

  useEffect(() => {
    if (isOpen) {
      setReminderText('');
      setIsLoading(false);
      setHasCopied(false);
      setTone('polite');
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!invoiceId) {
      toast.error('Invoice not found.');
      return;
    }
    setIsLoading(true);
    setReminderText('');
    try {
      const response = await generateReminder(invoiceId, tone);
      setReminderText(response.data.reminderText);
    } catch (error) {
      toast.error('Failed to generate reminder.');
      console.error('AI reminder error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reminderText);
    setHasCopied(true);
    toast.success('Reminder copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  if (!isOpen) return null

  return (
     <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative text-left transform transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-700" />
              AI-Generated Reminder
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <SelectField
                label="Tone"
                name="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isLoading}
                options={[
                  { value: 'polite', label: 'Polite' },
                  { value: 'firm', label: 'Firm' },
                  { value: 'final', label: 'Final' },
                ]}
              />
              {!reminderText && (
                <p className="text-sm text-slate-600">
                  Click generate to create a reminder for this invoice.
                </p>
              )}
              <TextareaField 
                name="reminderText"
                value={reminderText}
                readOnly
                placeholder="AI-generated reminder will appear here."
                rows={10}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={handleGenerate} isLoading={isLoading} variant="ai">
              {isLoading ? 'Generating...' : 'Generate Reminder'}
            </Button>
            <Button onClick={handleCopyToClipboard} icon={hasCopied ? Check : Copy} disabled={isLoading || !reminderText}>
              {hasCopied ? 'Copied!' : 'Copy Text'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReminderModal


