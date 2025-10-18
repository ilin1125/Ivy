import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Clock, Plane, Calendar, Play, CheckCircle, XCircle, Copy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

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

export default function AppointmentList({ appointments, appointmentTypes, onEdit, onCopy, onDelete, onQuickStatusChange }) {
  const formatDateTime = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MM/dd HH:mm', { locale: zhTW });
    } catch {
      return dateStr;
    }
  };

  const isUpcoming = (dateStr) => {
    const now = new Date();
    const appointmentDate = new Date(dateStr);
    return appointmentDate > now;
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

  if (appointments.length === 0) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="py-16 text-center">
          <div className="text-gray-400 mb-2">
            <Calendar className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">尚無預約記錄</p>
          <p className="text-gray-400 text-sm mt-2">點擊上方「新增預約」按鈕開始</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="appointments-list">
      {appointments.map((appointment) => {
        const isUpcomingAppt = isUpcoming(appointment.pickup_time) && appointment.status === 'scheduled';
        const typeInfo = getTypeInfo(appointment.appointment_type_id);
        const typeStyle = getColorStyle(typeInfo.color);
        const TypeIcon = LucideIcons[typeInfo.icon] || LucideIcons.Circle;
        
        return (
          <Card
            key={appointment.id}
            className={`bg-white shadow-lg border-0 hover:shadow-xl transition-all card-enter ${
              typeStyle.bg
            } border-l-4 ${
              typeStyle.border
            } ${
              isUpcomingAppt ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
            }`}
            data-testid={`appointment-card-${appointment.id}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900" data-testid={`client-name-${appointment.id}`}>
                      {appointment.client_name}
                    </h3>
                    {isUpcomingAppt && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 animate-pulse">
                        即將到來
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={`${typeStyle.badge} ${typeStyle.text} border-0 font-semibold`}
                      data-testid={`type-badge-${appointment.id}`}
                    >
                      <TypeIcon className="w-4 h-4 mr-1" />
                      {typeInfo.name}
                    </Badge>
                    <Badge
                      className={`status-badge ${statusConfig[appointment.status]?.color || statusConfig.scheduled.color}`}
                      data-testid={`status-badge-${appointment.id}`}
                    >
                      {statusConfig[appointment.status]?.label || appointment.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {appointment.status === 'scheduled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onQuickStatusChange(appointment.id, 'in_progress')}
                      className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                      title="開始行程"
                      data-testid={`start-button-${appointment.id}`}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  {appointment.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onQuickStatusChange(appointment.id, 'completed')}
                      className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                      title="完成行程"
                      data-testid={`complete-button-${appointment.id}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {(appointment.status === 'scheduled' || appointment.status === 'in_progress') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onQuickStatusChange(appointment.id, 'cancelled')}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      title="取消行程"
                      data-testid={`cancel-button-${appointment.id}`}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopy(appointment)}
                    className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                    title="複製行程"
                    data-testid={`copy-button-${appointment.id}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(appointment)}
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    title="編輯"
                    data-testid={`edit-button-${appointment.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(appointment.id)}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    title="刪除"
                    data-testid={`delete-button-${appointment.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">接送地點</p>
                      <p className="font-medium text-gray-900">{appointment.pickup_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">接送時間</p>
                      <p className="font-medium text-gray-900">{formatDateTime(appointment.pickup_time)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">目的地</p>
                      <p className="font-medium text-gray-900">{appointment.arrival_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">預計抵達</p>
                      <p className="font-medium text-gray-900">{formatDateTime(appointment.arrival_time)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(appointment.flight_info || appointment.other_details) && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  {appointment.flight_info && (
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">航班資訊：</span>
                      <span className="text-sm font-medium text-gray-900">{appointment.flight_info}</span>
                    </div>
                  )}
                  {appointment.other_details && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">備註：</span> {appointment.other_details}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}