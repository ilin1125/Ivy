import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const typeConfig = {
  airport: { label: '機場接送', color: 'bg-purple-100 text-purple-700' },
  city: { label: '市區接送', color: 'bg-cyan-100 text-cyan-700' },
  corporate: { label: '商務用車', color: 'bg-slate-100 text-slate-700' },
  personal: { label: '私人行程', color: 'bg-emerald-100 text-emerald-700' },
  vip: { label: 'VIP 專屬', color: 'bg-amber-100 text-amber-700' },
};

export default function AppointmentModal({ appointment, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_name: '',
    pickup_time: '',
    pickup_location: '',
    arrival_time: '',
    arrival_location: '',
    flight_info: '',
    luggage_count: 0,
    other_details: '',
    appointment_type: 'airport',
    status: 'scheduled'
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        client_name: appointment.client_name || '',
        pickup_time: appointment.pickup_time ? appointment.pickup_time.slice(0, 16) : '',
        pickup_location: appointment.pickup_location || '',
        arrival_time: appointment.arrival_time ? appointment.arrival_time.slice(0, 16) : '',
        arrival_location: appointment.arrival_location || '',
        flight_info: appointment.flight_info || '',
        luggage_count: appointment.luggage_count || 0,
        other_details: appointment.other_details || '',
        appointment_type: appointment.appointment_type || 'airport',
        status: appointment.status || 'scheduled'
      });
    }
  }, [appointment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      pickup_time: new Date(formData.pickup_time).toISOString(),
      arrival_time: new Date(formData.arrival_time).toISOString(),
    };
    onSave(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="appointment-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {appointment ? '編輯預約' : '新增預約'}
            {formData.appointment_type && (
              <Badge className={typeConfig[formData.appointment_type].color}>
                {typeConfig[formData.appointment_type].label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">客戶姓名 *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleChange('client_name', e.target.value)}
                required
                data-testid="modal-client-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_type">預約類型 *</Label>
              <Select value={formData.appointment_type} onValueChange={(value) => handleChange('appointment_type', value)}>
                <SelectTrigger data-testid="modal-appointment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="airport">🛫 機場接送</SelectItem>
                  <SelectItem value="city">🚗 市區接送</SelectItem>
                  <SelectItem value="corporate">💼 商務用車</SelectItem>
                  <SelectItem value="personal">👤 私人行程</SelectItem>
                  <SelectItem value="vip">⭐ VIP 專屬</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup_location">接送地點 *</Label>
              <Input
                id="pickup_location"
                value={formData.pickup_location}
                onChange={(e) => handleChange('pickup_location', e.target.value)}
                required
                data-testid="modal-pickup-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup_time">接送時間 *</Label>
              <Input
                id="pickup_time"
                type="datetime-local"
                value={formData.pickup_time}
                onChange={(e) => handleChange('pickup_time', e.target.value)}
                required
                data-testid="modal-pickup-time"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrival_location">目的地 *</Label>
              <Input
                id="arrival_location"
                value={formData.arrival_location}
                onChange={(e) => handleChange('arrival_location', e.target.value)}
                required
                data-testid="modal-arrival-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival_time">預計抵達時間 *</Label>
              <Input
                id="arrival_time"
                type="datetime-local"
                value={formData.arrival_time}
                onChange={(e) => handleChange('arrival_time', e.target.value)}
                required
                data-testid="modal-arrival-time"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flight_info">航班資訊</Label>
              <Input
                id="flight_info"
                value={formData.flight_info}
                onChange={(e) => handleChange('flight_info', e.target.value)}
                placeholder="例如：CI123"
                data-testid="modal-flight-info"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="luggage_count">行李數量</Label>
              <Input
                id="luggage_count"
                type="number"
                min="0"
                value={formData.luggage_count}
                onChange={(e) => handleChange('luggage_count', parseInt(e.target.value) || 0)}
                data-testid="modal-luggage-count"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">狀態</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger data-testid="modal-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">已排程</SelectItem>
                <SelectItem value="in_progress">進行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="other_details">其他備註</Label>
            <Textarea
              id="other_details"
              value={formData.other_details}
              onChange={(e) => handleChange('other_details', e.target.value)}
              rows={3}
              placeholder="其他需要注意的事項..."
              data-testid="modal-other-details"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="modal-cancel">
              取消
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              data-testid="modal-save"
            >
              {appointment ? '更新預約' : '新增預約'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}