
"use client";

import { useEffect, useRef } from "react";

interface ParticleBrandSymbolProps {
  src?: string;
  className?: string;
  color?: string;
  particleCount?: number;
}

interface Particle {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  radius: number;
  phase: number;
  delay: number;
  opacity: number;
}

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

export default function ParticleBrandSymbol({
  src = "/chamber-icon.svg.png",
  className = "",
  color = "#087BFA",
  particleCount = 1000,
}: ParticleBrandSymbolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const containerElement = containerRef.current;
    const canvasElement = canvasRef.current;

    if (!containerElement || !canvasElement) return;

    const context = canvasElement.getContext("2d");
    if (!context) return;

    const container: HTMLDivElement = containerElement;
    const canvas: HTMLCanvasElement = canvasElement;
    const ctx: CanvasRenderingContext2D = context;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let reducedMotion = motionQuery.matches;
    let isVisible = true;
    let isDisposed = false;
    let animationFrame = 0;
    let startTime = performance.now();

    let width = 0;
    let height = 0;

    let pointerX = 0;
    let pointerY = 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;

    let particles: Particle[] = [];

    const image = new Image();

    function resizeCanvas(): void {
      const rect = container.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function sampleLogo(): Array<{ x: number; y: number }> {
      const sampleCanvas = document.createElement("canvas");
      const sampleContext = sampleCanvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!sampleContext || !image.naturalWidth) return [];

      const size = 260;

      sampleCanvas.width = size;
      sampleCanvas.height = size;

      sampleContext.clearRect(0, 0, size, size);

      const ratio = Math.min(
        size / image.naturalWidth,
        size / image.naturalHeight
      );

      const drawWidth = image.naturalWidth * ratio;
      const drawHeight = image.naturalHeight * ratio;

      sampleContext.drawImage(
        image,
        (size - drawWidth) / 2,
        (size - drawHeight) / 2,
        drawWidth,
        drawHeight
      );

      const pixels = sampleContext.getImageData(
        0,
        0,
        size,
        size
      ).data;

      const points: Array<{ x: number; y: number }> = [];

      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          const index = (y * size + x) * 4;

          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];

          const isBlue =
            alpha > 100 &&
            blue > 95 &&
            blue > red * 1.2 &&
            blue > green * 1.05;

          if (isBlue) {
            points.push({ x, y });
          }
        }
      }

      return points;
    }

    function generateParticles(): void {
      resizeCanvas();

      if (!width || !height || !image.naturalWidth) return;

      const points = sampleLogo();

      if (points.length === 0) {
        console.warn(
          "ParticleBrandSymbol: No blue logo pixels detected. " +
            "Check the Chamber icon image."
        );
        particles = [];
        return;
      }

      const isMobile = width < 500;

      const count = Math.min(
        isMobile ? 450 : particleCount,
        points.length
      );

      const sampleSize = 260;
      const symbolSize = Math.min(width * 0.84, height * 0.84);
      const scale = symbolSize / sampleSize;

      particles = [];

      for (let i = 0; i < count; i++) {
        const position = Math.min(
          points.length - 1,
          Math.floor(
            ((i + seededRandom(i + 10)) / count) * points.length
          )
        );

        const point = points[position];

        const targetX =
          width / 2 + (point.x - sampleSize / 2) * scale;

        const targetY =
          height / 2 + (point.y - sampleSize / 2) * scale;

        const angle = seededRandom(i + 100) * Math.PI * 2;
        const distance =
          40 + seededRandom(i + 200) * symbolSize * 0.55;

        particles.push({
          startX: targetX + Math.cos(angle) * distance,
          startY: targetY + Math.sin(angle) * distance,
          targetX,
          targetY,
          radius: 0.7 + seededRandom(i + 300) * 1.25,
          phase: seededRandom(i + 400) * Math.PI * 2,
          delay: seededRandom(i + 500) * 550,
          opacity: 0.55 + seededRandom(i + 600) * 0.45,
        });
      }

      startTime = performance.now();
    }

    function draw(now: number): void {
      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);

      const elapsed = now - startTime;

      if (!reducedMotion) {
        smoothPointerX += (pointerX - smoothPointerX) * 0.035;
        smoothPointerY += (pointerY - smoothPointerY) * 0.035;
      } else {
        smoothPointerX = 0;
        smoothPointerY = 0;
      }

      for (const particle of particles) {
        const progress = reducedMotion
          ? 1
          : Math.max(
              0,
              Math.min(1, (elapsed - particle.delay) / 1900)
            );

        const eased = easeOutCubic(progress);

        const ambientX = reducedMotion
          ? 0
          : Math.sin(now * 0.0008 + particle.phase) * 0.6;

        const ambientY = reducedMotion
          ? 0
          : Math.cos(now * 0.0007 + particle.phase) * 0.6;

        const x =
          particle.startX +
          (particle.targetX - particle.startX) * eased +
          ambientX +
          smoothPointerX * 0.5;

        const y =
          particle.startY +
          (particle.targetY - particle.startY) * eased +
          ambientY +
          smoothPointerY * 0.5;

        const pulse = reducedMotion
          ? 1
          : 0.85 +
            Math.sin(now * 0.0015 + particle.phase) * 0.15;

        ctx.globalAlpha =
          particle.opacity * pulse * (0.25 + eased * 0.75);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    function animate(now: number): void {
      if (isDisposed || !isVisible || reducedMotion) return;

      draw(now);

      animationFrame = requestAnimationFrame(animate);
    }

    function restartAnimation(): void {
      cancelAnimationFrame(animationFrame);

      if (isDisposed || !image.naturalWidth) return;

      generateParticles();

      if (reducedMotion) {
        draw(startTime + 4000);
      } else if (isVisible) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    function handlePointerMove(event: PointerEvent): void {
      if (reducedMotion || event.pointerType === "touch") return;

      const rect = container.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      pointerX =
        ((event.clientX - rect.left) / rect.width - 0.5) * 10;

      pointerY =
        ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    }

    function handlePointerLeave(): void {
      pointerX = 0;
      pointerY = 0;
    }

    function handleMotionChange(
      event: MediaQueryListEvent
    ): void {
      reducedMotion = event.matches;
      restartAnimation();
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        cancelAnimationFrame(animationFrame);

        if (isVisible) {
          if (reducedMotion) {
            draw(startTime + 4000);
          } else {
            animationFrame = requestAnimationFrame(animate);
          }
        }
      },
      { threshold: 0.01 }
    );

    const resizeObserver = new ResizeObserver(() => {
      restartAnimation();
    });

    image.onload = () => {
      if (!isDisposed) restartAnimation();
    };

    image.onerror = () => {
      console.error(
        "ParticleBrandSymbol: Could not load image:",
        src
      );
    };

    image.src = src;

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    motionQuery.addEventListener("change", handleMotionChange);

    visibilityObserver.observe(container);
    resizeObserver.observe(container);

    if (image.complete && image.naturalWidth) {
      restartAnimation();
    }

    return () => {
      isDisposed = true;

      cancelAnimationFrame(animationFrame);

      visibilityObserver.disconnect();
      resizeObserver.disconnect();

      container.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      container.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );

      motionQuery.removeEventListener(
        "change",
        handleMotionChange
      );

      image.onload = null;
      image.onerror = null;
    };
  }, [src, color, particleCount]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${className}`}
      role="img"
      aria-label="Animated Chamber brand emblem"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}