import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

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
      const response = await axios.get(`${API}/appointments/stats/income`, {
        params: {
          start_date: startDate,
          end_date: endDate
        },
        ...getAuthHeader()
      });
      setStats(response.data);
    } catch (error) {
      toast.error('載入收入統計失敗');
    } finally {
      setLoading(false);
    }
  };

  const clientList = stats?.by_client ? Object.entries(stats.by_client).sort((a, b) => b[1].total - a[1].total) : [];

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
          {/* Date Range Selector */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    開始日期
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    結束日期
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="end-date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12 text-gray-500">載入中...</div>
          ) : stats ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      平均收入
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-700">
                      NT$ {Math.round(stats.average_income).toLocaleString()}
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
                      <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-gray-100 rounded-lg font-semibold text-sm text-gray-700">
                        <div>客戶名稱</div>
                        <div className="text-center">行程數</div>
                        <div className="text-right">總費用</div>
                      </div>
                      {clientList.map(([clientName, data]) => (
                        <div
                          key={clientName}
                          className="grid grid-cols-3 gap-4 px-4 py-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{clientName}</div>
                          <div className="text-center text-gray-600">{data.count} 趟</div>
                          <div className="text-right font-semibold text-green-700">
                            NT$ {data.total.toLocaleString()}
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
