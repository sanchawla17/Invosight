import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import TextareaField from '../ui/TextareaField';
import { parseInvoiceImage, parseInvoiceText } from "../../api/aiApi";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateWithAIModal = ({isOpen, onClose}) => {

  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const navigate = useNavigate();

  const resetModal = () => {
    setText('');
    setImageFile(null);
    setImageError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImageError('');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file.');
      setImageFile(null);
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setImageError('Image is too large. Max size is 4MB.');
      setImageFile(null);
      return;
    }
    setImageError('');
    setImageFile(file);
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    if (!text.trim() && !imageFile) {
      toast.error('Please paste text or upload an image.');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (imageFile) {
        const dataUrl = await readFileAsDataUrl(imageFile);
        response = await parseInvoiceImage(dataUrl, imageFile.type, text.trim() || undefined);
      } else {
        response = await parseInvoiceText(text);
      }
      const invoiceData = response.data;

      toast.success('Invoice data extracted successfully!');
      handleClose();

      // Navigate to create invoice page with the parsed data
      navigate('/invoices/new', { state: { aiData: invoiceData } });

    } catch (error) {
      const errorMessage = imageFile
        ? 'Failed to generate invoice from image.'
        : 'Failed to generate invoice from text.';
      toast.error(errorMessage);
      console.error('AI parsing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if(!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 transition-opacity" onClick={handleClose}></div>
        
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative text-left transform transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
              Create Invoice with AI
            </h3>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">&times;</button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Paste invoice details or upload a photo, and the AI will extract the invoice data.
            </p>
            <TextareaField 
              name="invoiceText"
              label="Paste Invoice Text Here"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., 'Invoice for ClientCorp: 2 hours of design work at $150/hr and 1 logo for $800'"
              rows={8}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Invoice Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
              {imageFile && (
                <p className="text-xs text-slate-500 mt-2">
                  Selected: {imageFile.name}
                </p>
              )}
              {imageError && (
                <p className="text-xs text-red-600 mt-2">{imageError}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Max size 4MB. We only use the image to extract invoice fields.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleGenerate} isLoading={isLoading} variant="ai">
              {isLoading ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateWithAIModal

