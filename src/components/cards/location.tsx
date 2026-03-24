'use client';

import { defaultVariantsNoDelay } from '@/constants/motion-variants';
import createGlobe from 'cobe';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { useSpring } from 'react-spring';

export function LocationCard() {
  const { resolvedTheme } = useTheme();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const pointerInteracting = React.useRef<number | null>(null);
  const pointerInteractionMovement = React.useRef(0);
  const fadeMask = 'radial-gradient(circle at 50% 50%, rgb(0, 0, 0) 60%, rgb(0, 0, 0, 0) 70%)';

  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: {
      mass: 0.5,
      tension: 200,
      friction: 20,
      precision: 0.001,
    },
  }));

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth;
    let phi = 3;
    let direction = 1;

    const onResize = () => {
      width = canvas.offsetWidth;
    };
    window.addEventListener('resize', onResize);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.2,
      dark: resolvedTheme === 'dark' ? 1 : 0,
      diffuse: 3,
      mapSamples: 36_000,
      mapBrightness: 2.5,
      baseColor: resolvedTheme === 'dark' ? [0.5, 0.5, 0.5] : [1, 1, 1],
      markerColor: [1.6, 0.45, 0.45],
      glowColor: resolvedTheme === 'dark' ? [0.5, 0.5, 0.5] : [0.9, 0.9, 0.9],
      markers: [
        {
          id: 'kiev',
          location: [50.4501, 30.5234],
          size: 0.012,
          color: [1.6, 0.45, 0.45],
        },
      ],
      markerElevation: 0.012,
      scale: 1,
    });

    let rafId: number | null = null;
    const render = () => {
      const nextPhi = phi + r.get();

      if (nextPhi > 5.5) direction = -1;
      else if (nextPhi < 3.25) direction = 1;

      phi += direction === 1 ? 0.001 : -0.001;

      globe.update({
        phi: nextPhi,
        width: width * 2,
        height: width * 2,
      });

      rafId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [r, resolvedTheme]);

  return (
    <motion.div
      variants={defaultVariantsNoDelay}
      whileHover={{ scale: 1.05 }}
      className="card-border relative col-span-4 col-start-5 row-span-3 row-start-2 flex flex-col gap-6 overflow-hidden rounded-xl bg-white p-4 md:col-span-2 md:col-start-6 md:row-span-2 md:row-start-2 md:h-40 dark:bg-neutral-900"
    >
      <div className="z-10 flex items-center gap-2">
        <Globe className="size-4.5" />
        <h2 className="text-sm font-light">Ukraine, Kiev</h2>
      </div>
      <div className="absolute inset-x-0 bottom-[-75%] mx-auto aspect-square h-[150%] translate-x-[-12.5%] [@media(max-width:420px)]:h-80">
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            placeItems: 'center',
            placeContent: 'center',
            overflow: 'visible',
          }}
        >
          <div
            className="relative"
            style={{
              width: '100%',
              aspectRatio: '1/1',
              WebkitMaskImage: fadeMask,
              maskImage: fadeMask,
            }}
          >
            <div className="cobe-anchor-marker">
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="absolute -inset-1.5 rounded-full bg-red-500/18 blur-lg dark:bg-red-500/14" />
                <div className="absolute -inset-0.5 rounded-full bg-red-500/14 blur-sm dark:bg-red-500/10" />
                <div className="relative size-1.25 rounded-full bg-red-400" />
              </div>
            </div>
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                canvasRef.current && (canvasRef.current.style.cursor = 'grabbing');
              }}
              onPointerUp={() => {
                pointerInteracting.current = null;
                canvasRef.current && (canvasRef.current.style.cursor = 'grab');
              }}
              onPointerOut={() => {
                pointerInteracting.current = null;
                canvasRef.current && (canvasRef.current.style.cursor = 'grab');
              }}
              onMouseMove={(e) => {
                if (pointerInteracting.current !== null) {
                  const delta = e.clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta;
                  api.start({
                    r: delta / 200,
                  });
                }
              }}
              onTouchMove={(e) => {
                if (pointerInteracting.current !== null && e.touches[0]) {
                  const delta = e.touches[0].clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta;
                  api.start({
                    r: delta / 100,
                  });
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                contain: 'layout paint size',
                cursor: 'auto',
                userSelect: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
