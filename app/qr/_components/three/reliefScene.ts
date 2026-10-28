import {
  AmbientLight,
  Box3,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  OrthographicCamera,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { FrameBudget } from "@/lib/three/frameBudget";
import type { ReliefAsset } from "./Relief";

type Options = {
  asset: ReliefAsset;
  interactive: boolean;
  onReady: () => void;
  onFallback: () => void;
};

export class ReliefScene {
  private renderer: WebGLRenderer | null = null;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 2_000);
  private readonly model = new Group();
  private readonly budget = new FrameBudget();
  private readonly pointer = new Vector2();
  private frame = 0;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private inViewport = false;
  private active = true;
  private measuring = true;
  private interactionUntil = 0;
  private previousFrame = 0;
  private dragging = false;
  private disposed = false;
  private width = 0;
  private height = 0;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly options: Options) {}

  async init() {
    if (this.disposed) return;
    this.renderer = new WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.camera.position.set(0, 0, 800);
    this.scene.add(this.model, new AmbientLight(0xffffff, 2.1));
    const key = new DirectionalLight(0xffffff, 5.2);
    key.position.set(-300, 420, 700);
    const rim = new DirectionalLight(0xffb3a9, 3.4);
    rim.position.set(420, -160, 520);
    this.scene.add(key, rim);

    const svg = await new SVGLoader().loadAsync(`/qr/brand/${this.options.asset}.svg`);
    if (this.disposed) return;
    const material = new MeshPhysicalMaterial({
      color: 0xdc2524,
      metalness: 0.08,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });
    for (const path of svg.paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        const geometry = new ExtrudeGeometry(shape, {
          depth: 22,
          bevelEnabled: true,
          bevelSegments: 3,
          bevelSize: 3,
          bevelThickness: 4,
          curveSegments: 8,
        });
        this.model.add(new Mesh(geometry, material));
      }
    }
    this.model.scale.y = -1;
    const bounds = new Box3().setFromObject(this.model);
    const center = bounds.getCenter(new Vector3());
    this.model.position.sub(center);

    this.resizeObserver = new ResizeObserver(() => this.renderOnce());
    this.resizeObserver.observe(this.canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.inViewport = entry.isIntersecting;
      if (this.inViewport) this.ensureLoop();
      else {
        this.stop();
        if (this.measuring) this.budget.reset();
      }
    });
    this.intersectionObserver.observe(this.canvas);
    document.addEventListener("visibilitychange", this.onVisibility);
    if (this.options.interactive) {
      window.addEventListener("scroll", this.onScroll, { passive: true });
      this.canvas.addEventListener("pointerdown", this.onPointerDown);
      this.canvas.addEventListener("pointermove", this.onPointerMove);
      window.addEventListener("pointerup", this.onPointerUp);
    }
    this.resize();
    this.renderOnce();
    this.options.onReady();
    this.ensureLoop();
  }

  setActive(active: boolean) {
    this.active = active;
    if (active) this.ensureLoop();
    else this.stop();
  }

  private resize() {
    if (!this.renderer) return;
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    const bounds = new Box3().setFromObject(this.model);
    const size = bounds.getSize(new Vector3());
    const padding = 1.16;
    const halfHeight = Math.max(size.y / 2, (size.x / 2) / (width / height)) * padding;
    const halfWidth = halfHeight * (width / height);
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
  }

  private renderOnce = () => {
    if (!this.renderer || this.disposed) return;
    this.resize();
    this.renderer.render(this.scene, this.camera);
  };

  private ensureLoop() {
    if (this.frame || !this.active || !this.inViewport || document.hidden || this.disposed) return;
    this.previousFrame = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.frame = 0;
    if (!this.renderer || !this.active || !this.inViewport || document.hidden || this.disposed) return;
    const delta = Math.min(now - this.previousFrame, 64);
    this.previousFrame = now;
    if (this.options.interactive) {
      this.model.rotation.x += (this.pointer.y - this.model.rotation.x) * 0.12;
      this.model.rotation.y += (this.pointer.x - this.model.rotation.y) * 0.12;
      if (!this.dragging) this.pointer.multiplyScalar(0.9);
    } else {
      this.model.rotation.y += delta * 0.0048;
    }
    this.renderOnce();

    if (this.measuring) {
      const result = this.budget.sample(now);
      if (result === "fallback") {
        this.options.onFallback();
        return;
      }
      if (result === "pass") this.measuring = false;
    }
    if (this.measuring || !this.options.interactive || now < this.interactionUntil) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };

  private stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private onVisibility = () => {
    if (document.hidden) {
      this.stop();
      if (this.measuring) this.budget.reset();
    } else {
      this.ensureLoop();
    }
  };

  private onScroll = () => {
    this.pointer.y = Math.max(-0.12, Math.min(0.12, window.scrollY * 0.00025));
    this.interactionUntil = performance.now() + 350;
    this.ensureLoop();
  };

  private onPointerDown = (event: PointerEvent) => {
    this.dragging = true;
    this.canvas.setPointerCapture?.(event.pointerId);
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.dragging) return;
    const bounds = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.35,
      ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.24,
    );
    this.interactionUntil = performance.now() + 300;
    this.ensureLoop();
  };

  private onPointerUp = () => {
    if (!this.dragging) return;
    this.dragging = false;
    this.pointer.set(0, 0);
    this.interactionUntil = performance.now() + 500;
    this.ensureLoop();
  };

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("scroll", this.onScroll);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    const materials = new Set<MeshPhysicalMaterial>();
    this.model.traverse((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material));
        else materials.add(object.material);
      }
    });
    materials.forEach((material) => material.dispose());
    this.renderer?.dispose();
    this.renderer = null;
  }
}
