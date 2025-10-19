import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { formatDateTime } from '@/utils/dateFormat';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// 固定的問候語和結語
const FIXED_GREETING = '您好，以下是我們接下來的行程：';
const FIXED_CLOSING = '期待為您服務！';

export default function SMSPreviewModal({ appointment, appointmentTypes, onClose }) {
  const [copied, setCopied] = useState(false);
  const [template, setTemplate] = useState(null);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(`${API}/sms-template`, getAuthHeader());
      setTemplate(response.data);
    } catch (error) {
      console.error('Failed to fetch SMS template');
      // Use default template
      setTemplate({
        greeting: FIXED_GREETING,
        fields: ['client_name', 'type', 'pickup_time', 'pickup_location', 'arrival_time', 'arrival_location', 'flight_info', 'other_details'],
        closing: FIXED_CLOSING
      });
    }
  };

  const getTypeName = (typeId) => {
    const type = appointmentTypes.find(t => t.id === typeId);
    return type ? type.name : '';
  };

  // Generate SMS content based on template with fixed greeting and closing
  const generateSMS = () => {
    if (!template) return '';
    
    let sms = FIXED_GREETING + '\n\n';
    
    const fieldData = {
      'client_name': { label: '客戶', value: appointment.client_name },
      'type': { label: '類型', value: getTypeName(appointment.appointment_type_id) },
      'pickup_time': { label: '接客時間', value: formatDateTime(appointment.pickup_time) },
      'pickup_location': { label: '接客地點', value: appointment.pickup_location },
      'arrival_time': { label: '抵達時間', value: formatDateTime(appointment.arrival_time) },
      'arrival_location': { label: '抵達地點', value: appointment.arrival_location },
      'flight_info': { label: '航班資訊', value: appointment.flight_info },
      'other_details': { label: '備註', value: appointment.other_details },
    };
    
    template.fields.forEach(fieldId => {
      const field = fieldData[fieldId];
      if (field && field.value) {
        sms += `【${field.label}】${field.value}\n`;
      }
    });
    
    sms += '\n' + FIXED_CLOSING;
    
    return sms;
  };

  const smsContent = generateSMS();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(smsContent);
      setCopied(true);
      toast.success('已複製到剪貼簿');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('複製失敗，請手動複製');
    }
  };

  if (!template) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="sms-preview-modal">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            客戶提醒簡訊
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-2">
              💡 提示：您可以複製以下內容後，再根據需要進行修改
            </p>
          </div>

          <Textarea
            value={smsContent}
            readOnly
            rows={15}
            className="font-mono text-sm bg-gray-50 resize-none"
            data-testid="sms-content"
          />

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="sms-close"
            >
              關閉
            </Button>
            <Button
              onClick={handleCopy}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2"
              data-testid="sms-copy"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  已複製
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  複製簡訊
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
