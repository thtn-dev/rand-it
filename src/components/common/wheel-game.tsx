"use client";

import { shadeColor } from "@/utils/color-utils";
import { radToDeg } from "@/utils/math-utils";
import { useRef, useEffect, useState, useCallback } from "react";

interface WheelProps {
  items: string[];
  onSelectItem: (item: string) => void;
}

const COLORS = [
  "#D62226",
  "#4542B9",
  "#01AA31",
  "#411271",
  "#F5C603",
  "#ad11ff",
];

export default function WheelOfFortune({ items, onSelectItem }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0); // radians
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSlowSpinning, setIsSlowSpinning] = useState(false);
  const [hasSpunOnce, setHasSpunOnce] = useState(false);
  const slowSpinRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    
  }, []);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach((item, index) => {
      const angle = (2 * Math.PI) / items.length;
      const startAngle = rotation + angle * index;
      const endAngle = rotation + angle * (index + 1);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      ctx.closePath();
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
      gradient.addColorStop(1, shadeColor(color, -10)); // Tối màu ở rìa ngoài
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + Math.PI / items.length);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 44px Arial";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(item, radius - 20, 0);
      ctx.restore();
    });

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI);
    ctx.beginPath();
    ctx.moveTo(-120, 0);
    ctx.lineTo(-62, -36);
    ctx.lineTo(-62, 36);
    ctx.closePath();
    ctx.fillStyle = "#333";
    ctx.fill();
    
    // shadow
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 3;
    ctx.fill();
    ctx.restore();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    // stroke
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#333";
    ctx.stroke();
    ctx.save();
  }, [items, rotation]);

  const slowSpin = useCallback(() => {
    setRotation((prevRotation) => (prevRotation + 0.003333333) % (2 * Math.PI));
    slowSpinRef.current = requestAnimationFrame(slowSpin);
  }, []);

  useEffect(() => {
    drawWheel();
    if (isSlowSpinning && !isSpinning && !hasSpunOnce) {
      slowSpinRef.current = requestAnimationFrame(slowSpin);
    }
    return () => {
      if (slowSpinRef.current) {
        cancelAnimationFrame(slowSpinRef.current);
      }
    };
  }, [drawWheel, isSlowSpinning, isSpinning, hasSpunOnce, slowSpin]);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSlowSpinning(false);
    setHasSpunOnce(true);
    if (slowSpinRef.current) {
      cancelAnimationFrame(slowSpinRef.current);
    }

    setIsSpinning(true);
    const spinDuration = 5000; // 5s
    const startRotation = rotation;
    const totalRotation =
      360 * 5 + 
      Math.random() * 360 +
      Math.random() * 180 +
      Math.random() * 90 +
      Math.random() * 45;

    const startTime = performance.now();

    const spin = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime < spinDuration) {
        const progress = elapsedTime / spinDuration;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        const currentRotation =
          startRotation + totalRotation * easeOut * (Math.PI / 180);
        setRotation(currentRotation);
        requestAnimationFrame(spin);
      } else {
        setIsSpinning(false);
        const finalRotation =
          (startRotation + totalRotation * (Math.PI / 180)) % (2 * Math.PI);
        console.log(radToDeg(startRotation), radToDeg(totalRotation));
        console.log(radToDeg(finalRotation));
        const selectedIndex =
          items.length -
          1 -
          Math.floor((finalRotation / (2 * Math.PI)) * items.length);
        onSelectItem(items[selectedIndex]);
      }
    };

    requestAnimationFrame(spin);
  };

  return (
    <div className="w-[40vw] mx-auto text-center">
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
