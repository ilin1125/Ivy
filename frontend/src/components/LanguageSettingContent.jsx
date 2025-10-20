import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Save, Calendar, Type } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

const DATE_FORMATS = [
  { code: 'MM/dd/yyyy', name: '月/日/年 (MM/dd/yyyy)', example: '10/18/2025' },
  { code: 'dd/MM/yyyy', name: '日/月/年 (dd/MM/yyyy)', example: '18/10/2025' },
];

const FONT_SIZES = [
  { code: 'small', name: '小', description: '適合一般使用' },
  { code: 'medium', name: '中', description: '預設大小' },
  { code: 'large', name: '大', description: '適合年長者' },
  { code: 'xlarge', name: '特大', description: '最大字體' },
];

export default function LanguageSettingContent() {
  const [selectedLanguage, setSelectedLanguage] = useState('zh-TW');
  const [selectedDateFormat, setSelectedDateFormat] = useState('MM/dd/yyyy');
  const [selectedFontSize, setSelectedFontSize] = useState('medium');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 從localStorage讀取設定
    const savedLanguage = localStorage.getItem('app_language') || 'zh-TW';
    const savedDateFormat = localStorage.getItem('app_date_format') || 'MM/dd/yyyy';
    const savedFontSize = localStorage.getItem('app_font_size') || 'medium';
    setSelectedLanguage(savedLanguage);
    setSelectedDateFormat(savedDateFormat);
    setSelectedFontSize(savedFontSize);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('app_language', selectedLanguage);
      localStorage.setItem('app_date_format', selectedDateFormat);
      localStorage.setItem('app_font_size', selectedFontSize);
      
      // 立即應用字體大小
      applyFontSize(selectedFontSize);
      
      toast.success('設定已儲存');
      
      // 提示用戶重新載入以應用其他設定
      setTimeout(() => {
        toast.info('請重新載入頁面以完全應用所有設定', {
          duration: 5000,
          action: {
            label: '重新載入',
            onClick: () => window.location.reload()
          }
        });
      }, 500);
    } catch (error) {
      toast.error('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  const applyFontSize = (size) => {
    const root = document.documentElement;
    switch(size) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'xlarge':
        root.style.fontSize = '20px';
        break;
      default:
        root.style.fontSize = '16px';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          語言與格式設定
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          選擇應用程式的顯示語言和日期格式
        </p>
      </div>

      <div className="space-y-4">
        {/* 語言選擇 */}
        <div className="space-y-2">
          <Label>選擇語言</Label>
          <Card>
            <CardHeader>
              <CardDescription>點選您偏好的語言</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {LANGUAGES.map(lang => (
                  <div
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedLanguage === lang.code 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{lang.nativeName}</div>
                        <div className="text-sm text-gray-600">{lang.name}</div>
                      </div>
                      {selectedLanguage === lang.code && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 日期格式選擇 */}
        <div className="space-y-2">
          <Label>日期格式</Label>
          <Card>
            <CardHeader>
              <CardDescription>選擇日期顯示格式</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DATE_FORMATS.map(format => (
                  <div
                    key={format.code}
                    onClick={() => setSelectedDateFormat(format.code)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedDateFormat === format.code 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{format.name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          範例：{format.example}
                        </div>
                      </div>
                      {selectedDateFormat === format.code && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 當前選擇顯示 */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">目前語言：</span>
                <span className="font-semibold text-gray-900">
                  {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">目前日期格式：</span>
                <span className="font-semibold text-gray-900">
                  {DATE_FORMATS.find(f => f.code === selectedDateFormat)?.example}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Message */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">
              💡 註：目前語言功能僅保存設定，完整的多語言翻譯將在未來版本中實現。日期格式將立即應用於所有時間顯示。
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            data-testid="save-language"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? '儲存中...' : '儲存設定'}
          </Button>
        </div>
      </div>
    </div>
  );
}
