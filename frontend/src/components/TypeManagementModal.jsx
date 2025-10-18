import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AVAILABLE_ICONS = [
  'Plane', 'Car', 'Briefcase', 'User', 'Star', 'Home', 'MapPin', 
  'Coffee', 'ShoppingBag', 'Heart', 'Gift', 'Calendar', 'Clock',
  'Truck', 'Bus', 'Train', 'Ship', 'Rocket', 'Building'
];

const COLORS = [
  { name: '紫色', value: '#9333ea', bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', badge: 'bg-purple-100' },
  { name: '藍色', value: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', badge: 'bg-blue-100' },
  { name: '青色', value: '#06b6d4', bg: 'bg-cyan-50', border: 'border-cyan-500', text: 'text-cyan-700', badge: 'bg-cyan-100' },
  { name: '綠色', value: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100' },
  { name: '黃色', value: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', badge: 'bg-amber-100' },
  { name: '紅色', value: '#ef4444', bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', badge: 'bg-red-100' },
  { name: '粉紅', value: '#ec4899', bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-700', badge: 'bg-pink-100' },
  { name: '灰色', value: '#64748b', bg: 'bg-slate-50', border: 'border-slate-600', text: 'text-slate-700', badge: 'bg-slate-100' },
];

export default function TypeManagementModal({ types, onClose, onSave }) {
  const [typesList, setTypesList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: COLORS[0].value, icon: 'Car' });
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    setTypesList(types);
  }, [types]);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('請輸入類型名稱');
      return;
    }

    try {
      if (editing) {
        await axios.put(`${API}/appointment-types/${editing.id}`, formData, getAuthHeader());
        toast.success('類型已更新');
      } else {
        await axios.post(`${API}/appointment-types`, formData, getAuthHeader());
        toast.success('類型已新增');
      }
      setFormData({ name: '', color: COLORS[0].value, icon: 'Car' });
      setEditing(null);
      onSave();
      const response = await axios.get(`${API}/appointment-types`, getAuthHeader());
      setTypesList(response.data);
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleEdit = (type) => {
    setEditing(type);
    setFormData({ name: type.name, color: type.color, icon: type.icon });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除這個類型嗎？')) {
      return;
    }

    try {
      await axios.delete(`${API}/appointment-types/${id}`, getAuthHeader());
      toast.success('類型已刪除');
      onSave();
      const response = await axios.get(`${API}/appointment-types`, getAuthHeader());
      setTypesList(response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('無法刪除：有預約使用此類型');
      } else {
        toast.error('刪除失敗');
      }
    }
  };

  const getColorStyle = (colorValue) => {
    const color = COLORS.find(c => c.value === colorValue) || COLORS[0];
    return color;
  };

  const IconComponent = LucideIcons[formData.icon] || LucideIcons.Car;
  const selectedColor = getColorStyle(formData.color);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="type-management-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl">預約類型管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{editing ? '編輯類型' : '新增類型'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>類型名稱 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：機場接送"
                    data-testid="type-name-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>選擇顜色</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          formData.color === color.value ? 'border-gray-900 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        data-testid={`color-${color.name}`}
                      >
                        {formData.color === color.value && <Check className="w-6 h-6 text-white mx-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>選擇圖示</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full h-12 flex items-center justify-center gap-2"
                    data-testid="icon-picker-button"
                  >
                    <IconComponent className="w-5 h-5" />
                    {formData.icon}
                  </Button>
                  {showIconPicker && (
                    <div className="absolute z-10 bg-white border rounded-lg shadow-lg p-4 grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                      {AVAILABLE_ICONS.map((iconName) => {
                        const Icon = LucideIcons[iconName];
                        return (
                          <button
                            key={iconName}
                            onClick={() => {
                              setFormData({ ...formData, icon: iconName });
                              setShowIconPicker(false);
                            }}
                            className={`p-3 rounded hover:bg-gray-100 ${
                              formData.icon === iconName ? 'bg-blue-100' : ''
                            }`}
                            title={iconName}
                          >
                            <Icon className="w-6 h-6" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-4">
                <Label className="mb-2 block">預覽</Label>
                <Badge className={`${selectedColor.badge} ${selectedColor.text} px-4 py-2 text-base`}>
                  <IconComponent className="w-4 h-4 mr-2" />
                  {formData.name || '類型名稱'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  data-testid="save-type-button"
                >
                  {editing ? '更新' : '新增'}
                </Button>
                {editing && (
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setFormData({ name: '', color: COLORS[0].value, icon: 'Car' });
                    }}
                    variant="outline"
                  >
                    取消編輯
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Types List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">現有類型 ({typesList.length})</h3>
            {typesList.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  尚無類型，請新增第一個類型
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typesList.map((type) => {
                  const TypeIcon = LucideIcons[type.icon] || LucideIcons.Car;
                  const typeColor = getColorStyle(type.color);
                  
                  return (
                    <Card
                      key={type.id}
                      className={`${typeColor.bg} border-l-4 ${typeColor.border} hover:shadow-md transition-shadow`}
                      data-testid={`type-card-${type.id}`}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`${typeColor.badge} p-2 rounded-lg`}>
                            <TypeIcon className={`w-6 h-6 ${typeColor.text}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{type.name}</h4>
                            <p className="text-xs text-gray-500">{type.icon}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(type)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                            data-testid={`edit-type-${type.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(type.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                            data-testid={`delete-type-${type.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}