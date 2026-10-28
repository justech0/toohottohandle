"use client";

import { useEffect, useRef, useState } from "react";
import type { ReliefScene } from "./reliefScene";
import {
  disableThreeForSession,
  loadThreeWhenIdle,
  THREE_DISABLED_EVENT,
} from "./runtime";

export type ReliefAsset = "hot" | "lips" | "rabbit" | "star";

export function Relief({
  asset,
  active,
  interactive = false,
  className = "",
  testId,
}: {
  asset: ReliefAsset;
  active: boolean;
  interactive?: boolean;
  className?: string;
  testId?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ReliefScene | null>(null);
  const activeRef = useRef(active);
  const [status, setStatus] = useState<"waiting" | "three" | "disabled">("waiting");
  activeRef.current = active;

  useEffect(() => {
    const disable = () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
      setStatus("disabled");
    };
    window.addEventListener(THREE_DISABLED_EVENT, disable);
    const cancelLoad = loadThreeWhenIdle((module) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scene = new module.ReliefScene(canvas, {
        asset,
        interactive,
        onReady: () => setStatus("three"),
        onFallback: disableThreeForSession,
      });
      sceneRef.current = scene;
      scene.setActive(activeRef.current);
      void scene.init().catch(disable);
    }, disable);
    return () => {
      cancelLoad();
      window.removeEventListener(THREE_DISABLED_EVENT, disable);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [asset, interactive]);

  useEffect(() => {
    sceneRef.current?.setActive(active);
  }, [active]);

  const svg = `/qr/brand/${asset}.svg`;
  return (
    <span className={`relief ${className}`.trim()} data-three-status={status} data-testid={testId} aria-hidden="true">
      <span className="relief__fallback" style={{ maskImage: `url(${svg})`, WebkitMaskImage: `url(${svg})` }} />
      <canvas ref={canvasRef} className="relief__canvas" />
    </span>
  );
}
