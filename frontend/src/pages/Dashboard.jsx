import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List, Plus, LogOut, Search, Filter, Settings, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import AppointmentList from '@/components/AppointmentList';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import AppointmentModal from '@/components/AppointmentModal';
import SettingsModal from '@/components/SettingsModal';
import IncomeReportModal from '@/components/IncomeReportModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ onLogout }) {
  const [appointments, setAppointments] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('list');
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    fetchAppointmentTypes();
    fetchAppointments();
    fetchIncomeStats();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, typeFilter]);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchAppointmentTypes = async () => {
    try {
      const response = await axios.get(`${API}/appointment-types`, getAuthHeader());
      setAppointmentTypes(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('登入已過期，請重新登入');
        onLogout();
      }
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments`, getAuthHeader());
      setAppointments(response.data);
      fetchIncomeStats();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('登入已過期，請重新登入');
        onLogout();
      } else {
        toast.error('載入預約失敗');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeStats = async () => {
    try {
      // Get current month date range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const response = await axios.get(`${API}/appointments/stats/income`, {
        params: {
          start_date: firstDay.toISOString().split('T')[0],
          end_date: lastDay.toISOString().split('T')[0]
        },
        ...getAuthHeader()
      });
      setTotalIncome(response.data.total_income);
    } catch (error) {
      console.error('Failed to fetch income stats');
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.appointment_type_id === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.arrival_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleAddAppointment = () => {
    if (appointmentTypes.length === 0) {
      toast.error('請先設定預約類型');
      setShowSettingsModal(true);
      return;
    }
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleCopyAppointment = (appointment) => {
    // Create a copy without id and timestamps, keeping all other data
    const copiedData = {
      ...appointment,
      id: undefined,
      created_at: undefined,
      updated_at: undefined
    };
    setEditingAppointment(copiedData);
    setShowModal(true);
    toast.info('已複製行程，請修改日期後儲存');
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('確定要刪除這個預約嗎？')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/appointments/${id}`, getAuthHeader());
      toast.success('預約已刪除');
      fetchAppointments();
    } catch (error) {
      toast.error('刪除預約失敗');
    }
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (editingAppointment?.id) {
        await axios.put(`${API}/appointments/${editingAppointment.id}`, appointmentData, getAuthHeader());
        toast.success('預約已更新');
      } else {
        await axios.post(`${API}/appointments`, appointmentData, getAuthHeader());
        toast.success('預約已新增');
      }
      setShowModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error(editingAppointment?.id ? '更新預約失敗' : '新增預約失敗');
    }
  };

  const handleQuickStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put(`${API}/appointments/${appointmentId}`, { status: newStatus }, getAuthHeader());
      toast.success('狀態已更新');
      fetchAppointments();
    } catch (error) {
      toast.error('更新狀態失敗');
    }
  };

  const getUpcomingCount = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const pickupTime = new Date(apt.pickup_time);
      return pickupTime > now && apt.status === 'scheduled';
    }).length;
  };

  const isRemembered = localStorage.getItem('rememberMe') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" data-testid="dashboard-title">
                輝哥預約管理
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                即將到來的預約：<span className="font-semibold text-blue-600">{getUpcomingCount()}</span> 個
                <span className="mx-2">|</span>
                總收入：<span className="font-semibold text-green-600">NT$ {totalIncome.toLocaleString()}</span>
                {isRemembered && <span className="ml-3 text-green-600">● 已啟用自動登入</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowIncomeModal(true)}
                variant="outline"
                className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                data-testid="income-report-button"
              >
                <DollarSign className="w-4 h-4" />
                收入報表
              </Button>
              <Button
                onClick={() => setShowSettingsModal(true)}
                variant="outline"
                className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                data-testid="settings-button"
              >
                <Settings className="w-4 h-4" />
                設定
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜尋客戶、地點..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-white border-gray-200"
                data-testid="search-input"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 h-11 bg-white" data-testid="type-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部類型</SelectItem>
                  {appointmentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-11 bg-white" data-testid="status-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="scheduled">已排程</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddAppointment}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-11 px-6 btn-hover shadow-lg"
                data-testid="add-appointment-button"
              >
                <Plus className="w-5 h-5 mr-2" />
                新增預約
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm" data-testid="view-tabs">
            <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white" data-testid="list-tab">
              <List className="w-4 h-4" />
              列表檢視
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white" data-testid="calendar-tab">
              <Calendar className="w-4 h-4" />
              日曆檢視
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0">
            {loading ? (
              <div className="text-center py-12 text-gray-500">載入中...</div>
            ) : (
              <AppointmentList
                appointments={filteredAppointments}
                appointmentTypes={appointmentTypes}
                onEdit={handleEditAppointment}
                onCopy={handleCopyAppointment}
                onDelete={handleDeleteAppointment}
                onQuickStatusChange={handleQuickStatusChange}
              />
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            {loading ? (
              <div className="text-center py-12 text-gray-500">載入中...</div>
            ) : (
              <AppointmentCalendar
                appointments={filteredAppointments}
                appointmentTypes={appointmentTypes}
                onEdit={handleEditAppointment}
                onCopy={handleCopyAppointment}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {showModal && (
        <AppointmentModal
          appointment={editingAppointment}
          appointmentTypes={appointmentTypes}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAppointment}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          types={appointmentTypes}
          onClose={() => setShowSettingsModal(false)}
          onSave={() => {
            fetchAppointmentTypes();
            fetchAppointments();
          }}
        />
      )}

      {showIncomeModal && (
        <IncomeReportModal
          onClose={() => setShowIncomeModal(false)}
        />
      )}
    </div>
  );
}