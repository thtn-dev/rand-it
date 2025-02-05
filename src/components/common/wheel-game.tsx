"use client";

import { useRef, useEffect, useState } from "react";

interface WheelProps {
  items: string[];
  onSelectItem: (item: string) => void;
}

const COLORS = [
  "#4E6813", // DRILL GREEN
  "#74070E", // CHERRY RED
  "#FF33FF",
  "#FFFF99",
  "#00B3E6",
  "#E6B333",
  "#3366E6",
  "#999966",
  "#99FF99",
  "#B34D4D",
];

export default function WheelOfFortune({ items, onSelectItem }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  console.log(">>Rotation", rotation);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ một vòng tròn trắng làm nền
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    items.forEach((item, index) => {
      const angle = (index / items.length) * 2 * Math.PI;
      const endAngle = ((index + 1) / items.length) * 2 * Math.PI;

      // Vẽ phần của vòng xoay với độ mịn cao
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle + rotation, endAngle + rotation);
      ctx.closePath();

      // Áp dụng đổ màu gradient để tạo hiệu ứng mịn
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      const color = COLORS[index % COLORS.length];
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, shadeColor(color, -12)); // Tối màu ở rìa ngoài
      ctx.fillStyle = gradient;
      ctx.fill();

      // Vẽ text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + rotation + Math.PI / items.length);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px Arial";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(item, radius - 20, 0);
      ctx.restore();
    });

    // Vẽ vòng tròn trung tâm
    ctx.beginPath();
    const centerCircleWidth = canvas.width / 12;
    ctx.arc(centerX, centerY, centerCircleWidth, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    // ctx.strokeStyle = "#000000";
    // ctx.lineWidth = 2;
    // ctx.stroke();

    // Vẽ mũi tên
    ctx.beginPath();
    ctx.moveTo(canvas.width - 40, centerY - 10);
    ctx.lineTo(canvas.width - 20, centerY);
    ctx.lineTo(canvas.width - 40, centerY + 10);
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();
  }, [items, rotation]);

  // Hàm để tạo màu tối hơn
  function shadeColor(color: string, percent: number) {
    const num = Number.parseInt(color.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = ((num >> 8) & 0x00ff) + amt,
      B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const spinDuration = 5000; // 5 giây
    const startRotation = rotation;
    console.log("startRotation", startRotation);
    const totalRotation = 360 * 5 + Math.random() * 360; // 5 vòng quay đầy đủ + ngẫu nhiên

    const startTime = performance.now();

    const spin = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime < spinDuration) {
        const progress = elapsedTime / spinDuration;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        const currentRotation = startRotation + totalRotation * easeOut;
        setRotation(currentRotation * (Math.PI / 180));
        requestAnimationFrame(spin);
      } else {
        setIsSpinning(false);
        const finalRotation = (startRotation + totalRotation) % 360;
        const selectedIndex =
          items.length - 1 - Math.floor(finalRotation / (360 / items.length));
        onSelectItem(items[selectedIndex]);
      }
    };

    requestAnimationFrame(spin);
  };

  return (
    <div className="w-[600px] mx-auto text-center">
      <canvas
        ref={canvasRef}
        width={868}
        height={868}
        className="mb-4 w-full"
      />
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isSpinning ? "Đang quay..." : "Quay"}
      </button>
    </div>
  );
}
