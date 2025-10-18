import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AVAILABLE_FIELDS = [
  { id: 'client_name', label: '客戶名稱' },
  { id: 'type', label: '預約類型' },
  { id: 'pickup_time', label: '接客時間' },
  { id: 'pickup_location', label: '接客地點' },
  { id: 'arrival_time', label: '抵達時間' },
  { id: 'arrival_location', label: '抵達地點' },
  { id: 'flight_info', label: '航班資訊' },
  { id: 'other_details', label: '備註' },
];

// 固定的問候語和結語
const FIXED_GREETING = '您好，以下是我們接下來的行程：';
const FIXED_CLOSING = '期待為您服務！';

export default function SMSTemplateContent() {
  const [selectedFields, setSelectedFields] = useState([
    'client_name', 'type', 'pickup_time', 'pickup_location',
    'arrival_time', 'arrival_location', 'flight_info', 'other_details'
  ]);
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(`${API}/sms-template`, getAuthHeader());
      setSelectedFields(response.data.fields);
    } catch (error) {
      console.error('Failed to fetch SMS template');
    }
  };

  const handleFieldToggle = (fieldId) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/sms-template`, {
        greeting: FIXED_GREETING,
        fields: selectedFields,
        closing: FIXED_CLOSING
      }, getAuthHeader());
      toast.success('簡訊模板已儲存');
    } catch (error) {
      toast.error('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  // Generate preview
  const generatePreview = () => {
    let preview = FIXED_GREETING + '\n\n';
    
    selectedFields.forEach(fieldId => {
      const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
      if (field) {
        preview += `【${field.label}】...\n`;
      }
    });
    
    preview += '\n' + FIXED_CLOSING;
    return preview;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          客製化簡訊模板
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          選擇要在客戶提醒簡訊中顯示的資訊欄位
        </p>
      </div>

      <div className="space-y-4">
        {/* Fixed Greeting Display */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">固定問候語</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-gray-700">{FIXED_GREETING}</p>
          </CardContent>
        </Card>

        {/* Field Selection */}
        <div className="space-y-2">
          <Label>顯示欄位</Label>
          <Card>
            <CardHeader>
              <CardDescription>選擇要在簡訊中顯示的資訊</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_FIELDS.map(field => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                      data-testid={`field-${field.id}`}
                    />
                    <label
                      htmlFor={`field-${field.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Closing Display */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">固定結語</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-gray-700">{FIXED_CLOSING}</p>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-2">
          <Label>簡訊預覽</Label>
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                {generatePreview()}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            data-testid="save-sms-template"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? '儲存中...' : '儲存模板'}
          </Button>
        </div>
      </div>
    </div>
  );
}
