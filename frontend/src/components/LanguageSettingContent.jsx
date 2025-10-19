import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

export default function LanguageSettingContent() {
  const [selectedLanguage, setSelectedLanguage] = useState('zh-TW');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 從localStorage讀取語言設定
    const savedLanguage = localStorage.getItem('app_language') || 'zh-TW';
    setSelectedLanguage(savedLanguage);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('app_language', selectedLanguage);
      toast.success('語言設定已儲存');
      
      // 提示用戶重新載入以應用語言設定
      setTimeout(() => {
        toast.info('請重新載入頁面以應用新的語言設定', {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          語言設定
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          選擇應用程式的顯示語言
        </p>
      </div>

      <div className="space-y-4">
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

        {/* Current Selection Display */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">目前選擇：</span>
              <span className="font-semibold text-gray-900">
                {LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Info Message */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">
              💡 註：目前語言功能僅保存設定，完整的多語言翻譯將在未來版本中實現。
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
