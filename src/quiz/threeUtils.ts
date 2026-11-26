import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function detectSoftwareWebGL(): boolean {
  if (typeof document === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function createStudioRenderer(container: HTMLElement, isSoftwareGl: boolean): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const w = Math.max(container.clientWidth, 320);
  const h = Math.max(container.clientHeight, 240);
  renderer.setSize(w, h);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.innerHTML = "";
  container.appendChild(renderer.domElement);
  return renderer;
}

export function attachStudioEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmrem.dispose();
  return envTex;
}

export function startPacedLoop(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
  onFrame: (dt: number, elapsed: number) => void,
): () => void {
  let disposed = false;
  let frameId = 0;
  let lastTime = performance.now();
  const startTime = lastTime;

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext | null;
    if (!gl || typeof gl.fenceSync !== "function") {
      frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 80);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  function tick() {
    if (disposed) return;
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.08);
    lastTime = now;
    const elapsed = (now - startTime) / 1000;

    onFrame(dt, elapsed);

    if (disposed) return;
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  }

  if (isSoftwareGl) {
    frameId = window.setTimeout(tick, 16);
  } else {
    frameId = requestAnimationFrame(tick);
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    window.clearTimeout(frameId);
  };
}

export function disposeSceneResources(scene: THREE.Scene) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = (mesh as any).material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => {
        if (m?.map) m.map.dispose();
        m?.dispose?.();
      });
    } else if (mat) {
      if (mat.map) mat.map.dispose();
      mat.dispose?.();
    }
  });
}

// Lightweight Web Audio synth for game SFX (no external audio 404s)
class SoundEffects {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureCtx(): AudioContext | null {
    if (this.muted || typeof window === "undefined") return null;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  playTone(freq: number, duration = 0.14, type: OscillatorType = "triangle", gainVal = 0.08) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playPullCorrect() {
    this.playTone(523.25, 0.1, "triangle", 0.09);
    window.setTimeout(() => this.playTone(659.25, 0.15, "triangle", 0.09), 70);
  }

  playWrong() {
    this.playTone(190, 0.18, "sawtooth", 0.05);
  }

  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => window.setTimeout(() => this.playTone(n, 0.24, "triangle", 0.09), i * 110));
  }

  playBoxOpen() {
    this.playTone(440, 0.12, "sine", 0.08);
    window.setTimeout(() => this.playTone(660, 0.16, "sine", 0.08), 80);
  }
}

export const gameSfx = new SoundEffects();
