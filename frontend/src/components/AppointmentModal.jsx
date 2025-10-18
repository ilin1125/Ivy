import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';

const COLORS = [
  { value: '#9333ea', badge: 'bg-purple-100 text-purple-700' },
  { value: '#3b82f6', badge: 'bg-blue-100 text-blue-700' },
  { value: '#06b6d4', badge: 'bg-cyan-100 text-cyan-700' },
  { value: '#10b981', badge: 'bg-emerald-100 text-emerald-700' },
  { value: '#f59e0b', badge: 'bg-amber-100 text-amber-700' },
  { value: '#ef4444', badge: 'bg-red-100 text-red-700' },
  { value: '#ec4899', badge: 'bg-pink-100 text-pink-700' },
  { value: '#64748b', badge: 'bg-slate-100 text-slate-700' },
];

export default function AppointmentModal({ appointment, appointmentTypes, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_name: '',
    pickup_time: '',
    pickup_location: '',
    arrival_time: '',
    arrival_location: '',
    flight_info: '',
    luggage_passengers: '',
    other_details: '',
    amount: '',
    appointment_type_id: '',
    status: 'scheduled'
  });

  useEffect(() => {
    if (appointmentTypes.length > 0 && !appointment) {
      setFormData(prev => ({ ...prev, appointment_type_id: appointmentTypes[0].id }));
    }
  }, [appointmentTypes, appointment]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        client_name: appointment.client_name || '',
        pickup_time: appointment.pickup_time ? appointment.pickup_time.slice(0, 16) : '',
        pickup_location: appointment.pickup_location || '',
        arrival_time: appointment.arrival_time ? appointment.arrival_time.slice(0, 16) : '',
        arrival_location: appointment.arrival_location || '',
        flight_info: appointment.flight_info || '',
        luggage_passengers: appointment.luggage_passengers || '',
        other_details: appointment.other_details || '',
        amount: appointment.amount || '',
        appointment_type_id: appointment.appointment_type_id || (appointmentTypes[0]?.id || ''),
        status: appointment.status || 'scheduled'
      });
    }
  }, [appointment, appointmentTypes]);

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
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // 當接客日期改變時，自動更新抵達日期為同一天，但保持原有時間
      if (field === 'pickup_time' && prev.arrival_time) {
        try {
          const newPickupDate = new Date(value);
          const oldArrivalDate = new Date(prev.arrival_time);
          
          // 設置抵達日期為接客日期，但保持原有時間
          const newArrivalDate = new Date(
            newPickupDate.getFullYear(),
            newPickupDate.getMonth(),
            newPickupDate.getDate(),
            oldArrivalDate.getHours(),
            oldArrivalDate.getMinutes()
          );
          
          // 轉換為 datetime-local 格式
          const year = newArrivalDate.getFullYear();
          const month = String(newArrivalDate.getMonth() + 1).padStart(2, '0');
          const day = String(newArrivalDate.getDate()).padStart(2, '0');
          const hours = String(newArrivalDate.getHours()).padStart(2, '0');
          const minutes = String(newArrivalDate.getMinutes()).padStart(2, '0');
          
          updated.arrival_time = `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
          console.error('Date sync error:', e);
        }
      }
      
      return updated;
    });
  };

  const getSelectedType = () => {
    return appointmentTypes.find(t => t.id === formData.appointment_type_id);
  };

  const selectedType = getSelectedType();
  const TypeIcon = selectedType ? LucideIcons[selectedType.icon] || LucideIcons.Circle : LucideIcons.Circle;
  const typeColor = selectedType ? COLORS.find(c => c.value === selectedType.color) : COLORS[0];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="appointment-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {appointment?.id ? '編輯預約' : '新增預約'}
            {selectedType && (
              <Badge className={typeColor?.badge}>
                <TypeIcon className="w-4 h-4 mr-1" />
                {selectedType.name}
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
              <Label htmlFor="appointment_type_id">預約類型 *</Label>
              <Select value={formData.appointment_type_id} onValueChange={(value) => handleChange('appointment_type_id', value)}>
                <SelectTrigger data-testid="modal-appointment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map(type => {
                    const Icon = LucideIcons[type.icon] || LucideIcons.Circle;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup_location">接客地點 *</Label>
              <Input
                id="pickup_location"
                value={formData.pickup_location}
                onChange={(e) => handleChange('pickup_location', e.target.value)}
                required
                data-testid="modal-pickup-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup_time">接客時間 *</Label>
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
              <Label htmlFor="amount">金額（元）</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="1"
                value={formData.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || '')}
                placeholder="請輸入金額"
                data-testid="modal-amount"
              />
            </div>
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
              {appointment?.id ? '更新預約' : '新增預約'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}