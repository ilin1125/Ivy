import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Users, Calendar, ArrowLeft, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function IncomeReportModal({ onClose }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState(null);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [clientAppointments, setClientAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClientDetail, setShowClientDetail] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    // Set default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
    
    // Fetch appointment types
    fetchAppointmentTypes();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchStats();
    }
  }, [startDate, endDate, selectedType]);

  const fetchAppointmentTypes = async () => {
    try {
      const response = await axios.get(`${API}/appointment-types`, getAuthHeader());
      setAppointmentTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch appointment types');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: startDate,
        end_date: endDate
      };
      if (selectedType !== 'all') {
        params.appointment_type_id = selectedType;
      }
      
      const response = await axios.get(`${API}/appointments/stats/income`, {
        params,
        ...getAuthHeader()
      });
      setStats(response.data);
    } catch (error) {
      toast.error('載入收入統計失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientAppointments = async (clientName) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/appointments`, getAuthHeader());
      const appointments = response.data;
      
      // Filter appointments for the selected client and date range
      const filtered = appointments.filter(apt => {
        const pickupDate = apt.pickup_time.split('T')[0];
        const matchClient = apt.client_name === clientName;
        const matchDate = pickupDate >= startDate && pickupDate <= endDate;
        const matchStatus = apt.status === 'completed';
        return matchClient && matchDate && matchStatus;
      });
      
      setClientAppointments(filtered);
      setSelectedClient(clientName);
      setShowClientDetail(true);
    } catch (error) {
      toast.error('載入客戶行程失敗');
    } finally {
      setLoading(false);
    }
  };

  const clientList = stats?.by_client ? Object.entries(stats.by_client).sort((a, b) => b[1].total - a[1].total) : [];

  const formatDateTime = (dateStr) => {
    try {
      return format(new Date(dateStr), 'yyyy/MM/dd HH:mm', { locale: zhTW });
    } catch {
      return dateStr;
    }
  };

  const getTypeName = (typeId) => {
    const type = appointmentTypes.find(t => t.id === typeId);
    return type ? type.name : '未知類型';
  };

  const clientDetailTotal = clientAppointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="income-report-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            收入報表
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range and Type Filter */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    開始日期
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                        data-testid="start-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'yyyy年MM月dd日', { locale: zhTW }) : "選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        locale={zhTW}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    結束日期
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                        data-testid="end-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'yyyy年MM月dd日', { locale: zhTW }) : "選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        locale={zhTW}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type-filter" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    篩選類型
                  </Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger data-testid="type-filter">
                      <SelectValue placeholder="選擇類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部類型</SelectItem>
                      {appointmentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12 text-gray-500">載入中...</div>
          ) : showClientDetail ? (
            <>
              {/* Client Detail View */}
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setShowClientDetail(false)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回統計
                </Button>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {selectedClient} 的行程明細
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-4 bg-white rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">總行程數：</span>
                        <span className="text-xl font-bold text-blue-700">{clientAppointments.length} 趟</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">總金額：</span>
                        <span className="text-2xl font-bold text-green-700">NT$ {clientDetailTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {clientAppointments.map((apt, idx) => (
                        <div key={apt.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">行程 #{idx + 1}</div>
                              <div className="text-sm text-gray-600">{getTypeName(apt.appointment_type_id)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-700">NT$ {(apt.amount || 0).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-green-600" />
                              <span className="text-gray-600">接客：</span>
                              <span className="font-medium">{apt.pickup_location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-600" />
                              <span className="text-gray-600">目的地：</span>
                              <span className="font-medium">{apt.arrival_location}</span>
                            </div>
                            <div className="flex items-center gap-1 col-span-2">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span className="text-gray-600">時間：</span>
                              <span className="font-medium">{formatDateTime(apt.pickup_time)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : stats ? (
            <>
              {/* Summary Cards - Removed Average Income */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      總收入
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-700">
                      NT$ {stats.total_income.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      完成行程
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-700">
                      {stats.total_count} 趟
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* By Client Stats */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    各客戶收入明細
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientList.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">此期間無完成行程</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-100 rounded-lg font-semibold text-sm text-gray-700">
                        <div>客戶名稱</div>
                        <div className="text-center">行程數</div>
                        <div className="text-right">總費用</div>
                        <div className="text-center">操作</div>
                      </div>
                      {clientList.map(([clientName, data]) => (
                        <div
                          key={clientName}
                          className="grid grid-cols-4 gap-4 px-4 py-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{clientName}</div>
                          <div className="text-center text-gray-600">{data.count} 趟</div>
                          <div className="text-right font-semibold text-green-700">
                            NT$ {data.total.toLocaleString()}
                          </div>
                          <div className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchClientAppointments(clientName)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              查看明細
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
