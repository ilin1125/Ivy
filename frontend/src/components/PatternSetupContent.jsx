import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import PatternLock from '@/components/PatternLock';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PatternSetupContent() {
  const [step, setStep] = useState(1);
  const [firstPattern, setFirstPattern] = useState(null);
  const [secondPattern, setSecondPattern] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const handleFirstPattern = (pattern) => {
    setFirstPattern(pattern);
    setStep(2);
  };

  const handleSecondPattern = async (pattern) => {
    setSecondPattern(pattern);
    
    if (JSON.stringify(pattern) !== JSON.stringify(firstPattern)) {
      toast.error('圖案不一致，請重新設定');
      setTimeout(() => {
        setStep(1);
        setFirstPattern(null);
        setSecondPattern(null);
      }, 1500);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/setup-pattern`, { pattern }, getAuthHeader());
      toast.success('圖案設定成功！');
      setTimeout(() => {
        setStep(1);
        setFirstPattern(null);
        setSecondPattern(null);
      }, 1500);
    } catch (error) {
      toast.error('設定失敗，請重試');
      setStep(1);
      setFirstPattern(null);
      setSecondPattern(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center mb-4">
        <p className="text-gray-600">設定您的 4×4 圖案密碼，至少連接4個點</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              步驟 1/2：繪製您的圖案
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <PatternLock onComplete={handleFirstPattern} size={4} isSetup={true} />
          </div>
        </div>
      )}

      {step === 2 && !loading && (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              步驟 2/2：再次繪製相同圖案以確認
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <PatternLock onComplete={handleSecondPattern} size={4} isSetup={true} />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStep(1);
              setFirstPattern(null);
            }}
            className="w-full"
          >
            重新設定
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">儲存中...</p>
        </div>
      )}
    </div>
  );
}
