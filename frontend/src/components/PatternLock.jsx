import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

const PatternLock = ({ onComplete, size = 4, isSetup = false }) => {
  const [pattern, setPattern] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);

  const dotSize = 20;
  const spacing = 80;
  const padding = 40;
  const canvasSize = padding * 2 + spacing * (size - 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    drawPattern(ctx);
  }, [pattern, currentPos, isDrawing]);

  const getDotPosition = (index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    return {
      x: padding + col * spacing,
      y: padding + row * spacing
    };
  };

  const drawPattern = (ctx) => {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Draw dots
    for (let i = 0; i < size * size; i++) {
      const pos = getDotPosition(i);
      const isSelected = pattern.includes(i);
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, dotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#3b82f6' : '#e5e7eb';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#2563eb' : '#d1d5db';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw inner circle for selected dots
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotSize / 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
    
    // Draw lines between selected dots
    if (pattern.length > 0) {
      ctx.beginPath();
      const firstPos = getDotPosition(pattern[0]);
      ctx.moveTo(firstPos.x, firstPos.y);
      
      for (let i = 1; i < pattern.length; i++) {
        const pos = getDotPosition(pattern[i]);
        ctx.lineTo(pos.x, pos.y);
      }
      
      // Draw line to current mouse position if drawing
      if (isDrawing && currentPos) {
        ctx.lineTo(currentPos.x, currentPos.y);
      }
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const getDotAtPosition = (x, y) => {
    for (let i = 0; i < size * size; i++) {
      const pos = getDotPosition(i);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance <= dotSize) {
        return i;
      }
    }
    return -1;
  };

  const handleStart = (e) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    const dot = getDotAtPosition(coords.x, coords.y);
    
    if (dot !== -1) {
      setIsDrawing(true);
      setPattern([dot]);
      setCurrentPos(coords);
    }
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getCanvasCoordinates(e);
    setCurrentPos(coords);
    
    const dot = getDotAtPosition(coords.x, coords.y);
    if (dot !== -1 && !pattern.includes(dot)) {
      setPattern([...pattern, dot]);
    }
  };

  const handleEnd = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    setIsDrawing(false);
    setCurrentPos(null);
    
    if (pattern.length >= 4) {
      onComplete(pattern);
    } else {
      // Pattern too short, reset
      setTimeout(() => setPattern([]), 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="border-2 border-gray-200 rounded-lg cursor-pointer touch-none"
        style={{ width: canvasSize, height: canvasSize }}
      />
      <p className="text-sm text-gray-600">
        {isSetup ? '設定您的解鎖圖案（至少連接4個點）' : '繪製您的解鎖圖案'}
      </p>
    </div>
  );
};

export default PatternLock;