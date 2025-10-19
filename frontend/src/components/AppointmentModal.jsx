import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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

export default function AppointmentModal({ appointment, appointmentTypes, allAppointments, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_name: '',
    pickup_time: '',
    pickup_location: '',
    arrival_time: '',
    arrival_location: '',
    flight_info: '',
    other_details: '',
    amount: '',
    appointment_type_id: '',
    status: 'scheduled'
  });

  const [timeWarning, setTimeWarning] = useState('');
  const [overlapWarning, setOverlapWarning] = useState('');

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
        other_details: appointment.other_details || '',
        amount: appointment.amount || '',
        appointment_type_id: appointment.appointment_type_id || (appointmentTypes[0]?.id || ''),
        status: appointment.status || 'scheduled'
      });
    }
  }, [appointment, appointmentTypes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 如果有時間錯誤，阻止提交
    if (timeWarning) {
      toast.error('請修正時間設定：抵達時間必須晚於接客時間');
      return;
    }
    
    const submitData = {
      ...formData,
      pickup_time: new Date(formData.pickup_time).toISOString(),
      arrival_time: formData.arrival_time ? new Date(formData.arrival_time).toISOString() : '',
      amount: formData.amount === '' || formData.amount === null || formData.amount === undefined ? 0 : Number(formData.amount)
    };
    
    // 如果有重疊警告，仍然允許儲存（只是警告）
    if (overlapWarning) {
      toast.warning('提醒：此預約與其他預約時間重疊', { duration: 3000 });
    }
    
    onSave(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 當接客時間或抵達時間變更時，進行即時驗證
      if (field === 'pickup_time' || field === 'arrival_time') {
        const pickupTime = field === 'pickup_time' ? value : prev.pickup_time;
        const arrivalTime = field === 'arrival_time' ? value : prev.arrival_time;
        
        // 只有當兩個時間都有值時才檢查
        if (pickupTime && arrivalTime) {
          const pickup = new Date(pickupTime);
          const arrival = new Date(arrivalTime);
          
          if (pickup >= arrival) {
            setTimeWarning('⚠️ 抵達時間必須晚於接客時間');
          } else {
            setTimeWarning('');
            
            // 檢查時間重疊
            checkTimeOverlap(pickup, arrival);
          }
        } else {
          // 如果抵達時間為空，清除警告
          setTimeWarning('');
          
          // 如果只有接客時間，檢查是否與其他預約重疊
          if (pickupTime && !arrivalTime) {
            // 暫時不檢查重疊，因為沒有完整時間範圍
            setOverlapWarning('');
          }
        }
      }
      
      return newData;
    });
  };

  const checkTimeOverlap = (pickupTime, arrivalTime) => {
    const hasOverlap = (allAppointments || []).some(apt => {
      // 跳過當前編輯的預約
      if (appointment?.id && apt.id === appointment.id) {
        return false;
      }
      
      const aptPickup = new Date(apt.pickup_time);
      const aptArrival = new Date(apt.arrival_time);
      
      // 檢查時間是否重疊
      const overlap = (
        (pickupTime >= aptPickup && pickupTime < aptArrival) ||
        (arrivalTime > aptPickup && arrivalTime <= aptArrival) ||
        (pickupTime <= aptPickup && arrivalTime >= aptArrival)
      );
      
      return overlap;
    });
    
    if (hasOverlap) {
      setOverlapWarning('⚠️ 警告：此時段與其他預約時間重疊');
    } else {
      setOverlapWarning('');
    }
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 py-4">
            {/* 客戶姓名 */}
            <div className="space-y-1">
              <Label htmlFor="client_name" className="text-xs">客戶姓名 *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleChange('client_name', e.target.value)}
                required
                className="text-sm h-9"
                data-testid="modal-client-name"
              />
            </div>

            {/* 預約類型和狀態 - 並排 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="appointment_type_id" className="text-xs">預約類型</Label>
                <Select value={formData.appointment_type_id} onValueChange={(value) => handleChange('appointment_type_id', value)}>
                  <SelectTrigger className="text-sm h-9" data-testid="modal-appointment-type">
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

              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs">狀態</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="text-sm h-9" data-testid="modal-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">已排程</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 接客時間和地點 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="pickup_time" className="text-xs">接客時間 *</Label>
                <Input
                  id="pickup_time"
                  type="datetime-local"
                  value={formData.pickup_time}
                  onChange={(e) => handleChange('pickup_time', e.target.value)}
                  required
                  className="text-sm h-9"
                  data-testid="modal-pickup-time"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pickup_location" className="text-xs">接客地點</Label>
                <Input
                  id="pickup_location"
                  value={formData.pickup_location}
                  onChange={(e) => handleChange('pickup_location', e.target.value)}
                  className="text-sm h-9"
                  data-testid="modal-pickup-location"
                />
              </div>
            </div>

            {/* 抵達時間和地點 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="arrival_time" className="text-xs">抵達時間</Label>
                <Input
                  id="arrival_time"
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={(e) => handleChange('arrival_time', e.target.value)}
                  className="text-sm h-9"
                  data-testid="modal-arrival-time"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="arrival_location" className="text-xs">抵達地點</Label>
                <Input
                  id="arrival_location"
                  value={formData.arrival_location}
                  onChange={(e) => handleChange('arrival_location', e.target.value)}
                  className="text-sm h-9"
                  data-testid="modal-arrival-location"
                />
              </div>
            </div>

            {/* 時間驗證警告 */}
            {(timeWarning || overlapWarning) && (
              <div className="space-y-1.5">
                {timeWarning && (
                  <div className="text-red-600 text-xs font-medium bg-red-50 p-2 rounded border border-red-200">
                    {timeWarning}
                  </div>
                )}
                {overlapWarning && (
                  <div className="text-amber-600 text-xs font-medium bg-amber-50 p-2 rounded border border-amber-200">
                    {overlapWarning}
                  </div>
                )}
              </div>
            )}

            {/* 航班資訊和金額 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="flight_info" className="text-xs">航班資訊</Label>
                <Input
                  id="flight_info"
                  value={formData.flight_info}
                  onChange={(e) => handleChange('flight_info', e.target.value)}
                  placeholder="例如：CI123"
                  className="text-sm h-9"
                  data-testid="modal-flight-info"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="amount" className="text-xs">金額（元）</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="請輸入金額"
                  className="text-sm h-9"
                  data-testid="modal-amount"
                />
              </div>
            </div>

            {/* 其他詳情 */}
            <div className="space-y-1">
              <Label htmlFor="other_details" className="text-xs">其他詳情</Label>
              <Textarea
                id="other_details"
                value={formData.other_details}
                onChange={(e) => handleChange('other_details', e.target.value)}
                placeholder="其他備註..."
                rows={2}
                className="text-sm"
                data-testid="modal-other-details"
              />
            </div>
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