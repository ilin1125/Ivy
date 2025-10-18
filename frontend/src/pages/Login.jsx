import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';
import { Lock, Car, Grid3x3 } from 'lucide-react';
import PatternLock from '@/components/PatternLock';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPattern, setHasPattern] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    checkPatternStatus();
  }, []);

  const checkPatternStatus = async () => {
    try {
      const response = await axios.get(`${API}/auth/pattern-status`);
      setHasPattern(response.data.has_pattern);
      if (response.data.has_pattern) {
        setActiveTab('pattern');
      }
    } catch (error) {
      console.error('Failed to check pattern status');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, { password });
      toast.success('登入成功！');
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      onLogin(response.data.token);
    } catch (error) {
      toast.error('密碼錯誤，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handlePatternComplete = async (pattern) => {
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, { pattern });
      toast.success('登入成功！');
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      onLogin(response.data.token);
    } catch (error) {
      toast.error('圖案錯誤，請重試');
      setTimeout(() => window.location.reload(), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0" data-testid="login-card">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
            <Car className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            駕駛預約管理
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            選擇登入方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                密碼登入
              </TabsTrigger>
              <TabsTrigger value="pattern" className="flex items-center gap-2" disabled={!hasPattern}>
                <Grid3x3 className="w-4 h-4" />
                圖案解鎖
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">密碼</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="請輸入密碼"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      data-testid="password-input"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    data-testid="remember-me-checkbox"
                  />
                  <label htmlFor="remember-me" className="text-sm text-gray-700 cursor-pointer">
                    記住我（下次自動登入）
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium text-base shadow-lg btn-hover"
                  disabled={loading}
                  data-testid="login-button"
                >
                  {loading ? '登入中...' : '登入'}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>預設密碼：driver123</p>
              </div>
            </TabsContent>

            <TabsContent value="pattern" className="flex flex-col items-center">
              {hasPattern ? (
                <div className="w-full flex flex-col items-center">
                  <PatternLock onComplete={handlePatternComplete} size={4} />
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      type="checkbox"
                      id="remember-me-pattern"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remember-me-pattern" className="text-sm text-gray-700 cursor-pointer">
                      記住我（下次自動登入）
                    </label>
                  </div>
                  {loading && (
                    <p className="text-sm text-gray-600 mt-4">驗證中...</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">尚未設定圖案解鎖</p>
                  <p className="text-sm text-gray-500">登入後可在設定中啟用圖案解鎖功能</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}