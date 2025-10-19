import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// 獲取用戶選擇的日期格式
export const getDateFormat = () => {
  return localStorage.getItem('app_date_format') || 'MM/dd/yyyy';
};

// 格式化日期時間（包含時間）
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    const dateFormat = getDateFormat();
    const date = new Date(dateStr);
    return format(date, `${dateFormat} HH:mm`, { locale: zhTW });
  } catch {
    return dateStr;
  }
};

// 格式化日期（不含時間）
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    const dateFormat = getDateFormat();
    const date = new Date(dateStr);
    return format(date, dateFormat, { locale: zhTW });
  } catch {
    return dateStr;
  }
};

// 格式化為簡短日期（月/日 或 日/月）
export const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    const dateFormat = getDateFormat();
    const date = new Date(dateStr);
    // 根據格式選擇 MM/dd 或 dd/MM
    const shortFormat = dateFormat.startsWith('MM') ? 'MM/dd' : 'dd/MM';
    return format(date, `${shortFormat} HH:mm`, { locale: zhTW });
  } catch {
    return dateStr;
  }
};
