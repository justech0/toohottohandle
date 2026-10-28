"use client";

import { shouldLoadThree } from "@/lib/three/eligibility";

export const THREE_DISABLED_KEY = "thth-3d-disabled";
export const THREE_DISABLED_EVENT = "thth:3d-disabled";

type SceneModule = typeof import("./reliefScene");
let modulePromise: Promise<SceneModule> | null = null;

type NetworkHints = { saveData?: boolean; effectiveType?: string };

function hasWebGL2() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return Boolean(gl);
}
export function browserCanLoadThree() {
  let sessionDisabled = false;
  try { sessionDisabled = sessionStorage.getItem(THREE_DISABLED_KEY) === "1"; } catch {}
  const connection = (navigator as Navigator & { connection?: NetworkHints }).connection;
  return shouldLoadThree({
    webgl2: hasWebGL2(),
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: connection?.saveData,
    effectiveType: connection?.effectiveType,
    hardwareConcurrency: navigator.hardwareConcurrency || undefined,
    sessionDisabled,
  });
}

function busy() {
  const intro = document.querySelector('[data-testid="intro"]');
  const search = document.activeElement?.closest('[data-testid="search-panel"]');
  return Boolean(intro || search);
}

export function loadThreeWhenIdle(onLoad: (module: SceneModule) => void, onDisabled: () => void) {
  if (!browserCanLoadThree()) {
    onDisabled();
    return () => {};
  }

  let cancelled = false;
  let idleId = 0;
  let timer = 0;
  let lastScroll = -Infinity;
  const idleWindow = window as Window & {
    requestIdleCallback?: Window["requestIdleCallback"];
    cancelIdleCallback?: Window["cancelIdleCallback"];
  };

  const importModule = () => {
    if (cancelled) return;
    if (busy() || performance.now() - lastScroll < 500) {
      timer = window.setTimeout(importModule, 500);
      return;
    }
    modulePromise ??= import("./reliefScene");
    void modulePromise.then((module) => {
      if (!cancelled) onLoad(module);
    }).catch(onDisabled);
  };
  const schedule = () => {
    if (typeof idleWindow.requestIdleCallback === "function") {
      idleId = idleWindow.requestIdleCallback(importModule, { timeout: 2_000 });
    } else {
      timer = window.setTimeout(importModule, 2_000);
    }
  };
  const onScroll = () => { lastScroll = performance.now(); };
  window.addEventListener("scroll", onScroll, { passive: true });
  schedule();

  return () => {
    cancelled = true;
    window.removeEventListener("scroll", onScroll);
    window.clearTimeout(timer);
    if (idleId) idleWindow.cancelIdleCallback?.(idleId);
  };
}

export function disableThreeForSession() {
  try { sessionStorage.setItem(THREE_DISABLED_KEY, "1"); } catch {}
  window.dispatchEvent(new Event(THREE_DISABLED_EVENT));
}

