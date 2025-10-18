import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Clock, Plane, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const statusConfig = {
  scheduled: { label: '已排程', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { label: '進行中', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function AppointmentList({ appointments, onEdit, onDelete }) {
  const formatDateTime = (dateStr) => {
    try {
      return format(new Date(dateStr), 'yyyy/MM/dd HH:mm', { locale: zhTW });
    } catch {
      return dateStr;
    }
  };

  const isUpcoming = (dateStr) => {
    const now = new Date();
    const appointmentDate = new Date(dateStr);
    return appointmentDate > now;
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
        
        return (
          <Card
            key={appointment.id}
            className={`bg-white shadow-lg border-0 hover:shadow-xl transition-shadow card-enter ${
              isUpcomingAppt ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
            }`}
            data-testid={`appointment-card-${appointment.id}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900" data-testid={`client-name-${appointment.id}`}>
                      {appointment.client_name}
                    </h3>
                    <Badge
                      className={`status-badge ${statusConfig[appointment.status]?.color || statusConfig.scheduled.color}`}
                      data-testid={`status-badge-${appointment.id}`}
                    >
                      {statusConfig[appointment.status]?.label || appointment.status}
                    </Badge>
                    {isUpcomingAppt && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        即將到來
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(appointment)}
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    data-testid={`edit-button-${appointment.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(appointment.id)}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
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

              {(appointment.flight_info || appointment.luggage_count > 0 || appointment.other_details) && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  {appointment.flight_info && (
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">航班資訊：</span>
                      <span className="text-sm font-medium text-gray-900">{appointment.flight_info}</span>
                    </div>
                  )}
                  {appointment.luggage_count > 0 && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">行李數量：</span>
                      <span className="text-sm font-medium text-gray-900">{appointment.luggage_count} 件</span>
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