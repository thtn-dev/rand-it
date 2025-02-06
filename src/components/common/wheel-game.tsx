"use client";

import { shadeColor } from "@/utils/color-utils";
import { degToRad } from "@/utils/math-utils";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";

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

const CIRCLE_PI = 2 * Math.PI;
const startRotation = Math.random() * CIRCLE_PI;
const arrowDirection = Math.PI / 2;
export default function WheelOfFortune({ items, onSelectItem }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(startRotation); // radians
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSlowSpinning, setIsSlowSpinning] = useState(true);
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
    const radius = Math.min(centerX, centerY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach((item, index) => {
      const angle = CIRCLE_PI / items.length;
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
      ctx.fillText(index + " " + item, radius - 20, 0);
      ctx.restore();
    });

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(arrowDirection);
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
    ctx.arc(centerX, centerY, 80, 0, CIRCLE_PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    // stroke
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#333";
    ctx.stroke();
    ctx.save();
  }, [items, rotation]);

  const slowSpin = useCallback(() => {
    setRotation((prevRotation) => (prevRotation + 0.003333333) % CIRCLE_PI);
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
    const totalRotation = 360 * 5 + Math.random() * 360;

    const startTime = performance.now();

    const spin = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime < spinDuration) {
        const progress = elapsedTime / spinDuration;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        const currentRotation =
          startRotation + degToRad(totalRotation * easeOut);
        setRotation(currentRotation);
        requestAnimationFrame(spin);
      } else {
        setIsSpinning(false);
        const finalRotation =
          (startRotation + degToRad(totalRotation) + arrowDirection) %
          CIRCLE_PI;

        const selectedIndex =
          items.length -
          1 -
          Math.floor((finalRotation / CIRCLE_PI) * items.length);
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
        className="mb-4 w-full cursor-pointer rounded-full"
        onClick={spinWheel}
      />
      {/* <Button onClick={spinWheel} disabled={isSpinning}>
        {isSpinning ? "Đang quay..." : "Quay"}
      </Button> */}
    </div>
  );
}
