import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default function SMSPreviewModal({ appointment, appointmentTypes, onClose }) {
  const [copied, setCopied] = useState(false);

  const formatDateTime = (dateStr) => {
    try {
      return format(new Date(dateStr), 'yyyy年MM月dd日 HH:mm', { locale: zhTW });
    } catch {
      return dateStr;
    }
  };

  const getTypeName = (typeId) => {
    const type = appointmentTypes.find(t => t.id === typeId);
    return type ? type.name : '';
  };

  // Generate SMS content
  const generateSMS = () => {
    let sms = `您好，以下是我們接下來的行程：\n\n`;
    sms += `【客戶】${appointment.client_name}\n`;
    
    const typeName = getTypeName(appointment.appointment_type_id);
    if (typeName) {
      sms += `【類型】${typeName}\n`;
    }
    
    sms += `\n【接客時間】${formatDateTime(appointment.pickup_time)}\n`;
    sms += `【接客地點】${appointment.pickup_location}\n`;
    sms += `\n【抵達時間】${formatDateTime(appointment.arrival_time)}\n`;
    sms += `【抵達地點】${appointment.arrival_location}\n`;
    
    if (appointment.flight_info) {
      sms += `\n【航班資訊】${appointment.flight_info}\n`;
    }
    
    if (appointment.luggage_passengers) {
      sms += `【行李/人數】${appointment.luggage_passengers}\n`;
    }
    
    if (appointment.other_details) {
      sms += `\n【備註】${appointment.other_details}\n`;
    }
    
    sms += `\n期待為您服務！`;
    
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
