import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Clock, MapPin, Edit } from 'lucide-react';

const statusConfig = {
  scheduled: { label: '已排程', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { label: '進行中', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function AppointmentCalendar({ appointments, onEdit }) {
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

  // Get dates that have appointments
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

      {/* Appointments for selected date */}
      <Card className="lg:col-span-2 bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, 'yyyy年MM月dd日', { locale: zhTW })} 的預約
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>此日期沒有預約</p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="calendar-appointments">
              {selectedDateAppointments
                .sort((a, b) => new Date(a.pickup_time) - new Date(b.pickup_time))
                .map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="bg-gradient-to-r from-white to-blue-50 border border-blue-100 hover:shadow-md transition-shadow"
                    data-testid={`calendar-appointment-${appointment.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">{appointment.client_name}</h4>
                            <Badge className={`status-badge text-xs ${statusConfig[appointment.status]?.color}`}>
                              {statusConfig[appointment.status]?.label}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(appointment.pickup_time)} - {formatTime(appointment.arrival_time)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span>{appointment.pickup_location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-red-600" />
                              <span>{appointment.arrival_location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(appointment)}
                          className="ml-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                          data-testid={`calendar-edit-${appointment.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}