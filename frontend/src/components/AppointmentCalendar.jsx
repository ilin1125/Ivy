import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Clock, MapPin, Edit, Copy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const statusConfig = {
  scheduled: { label: '已排程', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { label: '進行中', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-700 border-red-200' },
};

const COLORS = [
  { value: '#9333ea', bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', badge: 'bg-purple-100' },
  { value: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', badge: 'bg-blue-100' },
  { value: '#06b6d4', bg: 'bg-cyan-50', border: 'border-cyan-500', text: 'text-cyan-700', badge: 'bg-cyan-100' },
  { value: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100' },
  { value: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', badge: 'bg-amber-100' },
  { value: '#ef4444', bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', badge: 'bg-red-100' },
  { value: '#ec4899', bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-700', badge: 'bg-pink-100' },
  { value: '#64748b', bg: 'bg-slate-50', border: 'border-slate-600', text: 'text-slate-700', badge: 'bg-slate-100' },
];

export default function AppointmentCalendar({ appointments, appointmentTypes, onEdit, onCopy }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.pickup_time.startsWith(dateStr));
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const formatTime = (dateStr) => {
    try {
      return format(new Date(dateStr), 'HH:mm', { locale: zhTW });
    } catch {
      return dateStr;
    }
  };

  const getTypeInfo = (typeId) => {
    const type = appointmentTypes.find(t => t.id === typeId);
    if (!type) return { name: '未知', icon: 'Circle', color: '#64748b' };
    return type;
  };

  const getColorStyle = (colorValue) => {
    const color = COLORS.find(c => c.value === colorValue);
    return color || COLORS[0];
  };

  const appointmentDates = appointments.map(apt => {
    try {
      return new Date(apt.pickup_time.split('T')[0]);
    } catch {
      return null;
    }
  }).filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="calendar-view">
      {/* Calendar */}
      <Card className="lg:col-span-1 bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">選擇日期</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={zhTW}
            className="rounded-md border"
            modifiers={{
              hasAppointment: appointmentDates
            }}
            modifiersStyles={{
              hasAppointment: {
                fontWeight: 'bold',
                color: '#3b82f6'
              }
            }}
            data-testid="calendar-picker"
          />
          <div className="mt-4 text-xs text-gray-500">
            <p>藍色粗體日期表示有預約</p>
          </div>
        </CardContent>
      </Card>

      {/* Appointments for selected date - Google Calendar style */}
      <Card className="lg:col-span-2 bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>此日期沒有預約</p>
            </div>
          ) : (
            <div className="space-y-2" data-testid="calendar-appointments">
              {selectedDateAppointments
                .sort((a, b) => new Date(a.pickup_time) - new Date(b.pickup_time))
                .slice(0, 5)
                .map((appointment) => {
                  const typeInfo = getTypeInfo(appointment.appointment_type_id);
                  const typeStyle = getColorStyle(typeInfo.color);
                  const TypeIcon = LucideIcons[typeInfo.icon] || LucideIcons.Circle;
                  
                  return (
                    <div
                      key={appointment.id}
                      className={`p-3 rounded-lg border-l-4 ${typeStyle.border} ${typeStyle.bg} hover:shadow-md transition-all group relative`}
                      data-testid={`calendar-appointment-${appointment.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${typeStyle.badge} p-1.5 rounded`}>
                          <TypeIcon className={`w-4 h-4 ${typeStyle.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 truncate">{appointment.client_name}</span>
                            <Badge className={`text-xs ${statusConfig[appointment.status]?.color}`}>
                              {statusConfig[appointment.status]?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(appointment.pickup_time)} - {formatTime(appointment.arrival_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3 text-green-600" />
                            <span className="truncate">{appointment.pickup_location}</span>
                            <span>→</span>
                            <MapPin className="w-3 h-3 text-red-600" />
                            <span className="truncate">{appointment.arrival_location}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopy(appointment);
                            }}
                            className="p-1.5 rounded hover:bg-purple-100 text-purple-600"
                            title="複製行程"
                            data-testid={`calendar-copy-${appointment.id}`}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(appointment);
                            }}
                            className="p-1.5 rounded hover:bg-blue-100 text-blue-600"
                            title="編輯"
                            data-testid={`calendar-edit-${appointment.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {selectedDateAppointments.length > 5 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  +{selectedDateAppointments.length - 5} 個更多預約
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}