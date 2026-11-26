import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  attachStudioEnvironment,
  createStudioRenderer,
  detectSoftwareWebGL,
  disposeSceneResources,
  gameSfx,
  startPacedLoop,
} from "./threeUtils";

interface MysteryBox3DStageProps {
  total: number;
  openedIds: Set<number>;
  disabled: boolean;
  onOpenBox: (id: number) => void;
}

function makeCrateLabelTexture(num: number, opened: boolean, maxAniso: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = opened ? "#334155" : "#f59e0b";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = opened ? "#475569" : "#b45309";
  ctx.lineWidth = 18;
  ctx.strokeRect(12, 12, 232, 232);

  // Ribbon stripe
  ctx.fillStyle = opened ? "#475569" : "#dc2626";
  ctx.fillRect(110, 12, 36, 232);
  ctx.fillRect(12, 110, 232, 36);

  // Center badge
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(128, 128, 52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = opened ? "#64748b" : "#0f172a";
  ctx.font = "900 54px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(opened ? "✓" : String(num), 128, 132);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export function MysteryBox3DStage({ total, openedIds, disabled, onOpenBox }: MysteryBox3DStageProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ openedIds, disabled, onOpenBox });

  useEffect(() => {
    stateRef.current = { openedIds, disabled, onOpenBox };
  }, [openedIds, disabled, onOpenBox]);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = createStudioRenderer(container, isSoftwareGl);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 10, 22);
    attachStudioEnvironment(renderer, scene);

    const camera = new THREE.PerspectiveCamera(
      40,
      Math.max(container.clientWidth, 320) / Math.max(container.clientHeight, 220),
      0.1,
      60,
    );
    camera.position.set(0, 6.2, 8.6);
    camera.lookAt(0, 0.4, 0.3);

    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.85);
    const key = new THREE.DirectionalLight(0xfff4d6, 1.5);
    key.position.set(5, 9, 6);
    key.castShadow = !isSoftwareGl;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0005;
    scene.add(hemi, key);

    // Wide Studio floor blending smoothly into background fog
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x182338, roughness: 0.65, metalness: 0.15 });
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(18, 18.5, 0.4, 56), stageMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    scene.add(floor);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const cols = 4;
    const rows = Math.ceil(total / cols);
    const boxes: {
      id: number;
      group: THREE.Group;
      lidPivot: THREE.Group;
      bodyMesh: THREE.Mesh;
      closedTex: THREE.CanvasTexture;
      openTex: THREE.CanvasTexture;
      wasOpened: boolean;
      hover: number;
    }[] = [];

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2(-99, -99);
    let hoveredId: number | null = null;

    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.32, metalness: 0.55 });

    for (let i = 0; i < total; i++) {
      const id = i + 1;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - (cols - 1) / 2) * 2.15;
      const z = (row - (rows - 1) / 2) * 2.1;

      const group = new THREE.Group();
      group.position.set(x, 0, z);
      scene.add(group);

      const closedTex = makeCrateLabelTexture(id, false, maxAniso);
      const openTex = makeCrateLabelTexture(id, true, maxAniso);

      const bodyMat = new THREE.MeshStandardMaterial({ map: closedTex, roughness: 0.4, metalness: 0.12 });
      const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.95, 1.15), bodyMat);
      bodyMesh.position.y = 0.52;
      bodyMesh.castShadow = true;
      bodyMesh.userData.boxId = id;
      bodyMesh.layers.enable(1);
      group.add(bodyMesh);

      // Base trim ring
      const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.1, 1.22), rimMat);
      baseTrim.position.y = 0.06;
      group.add(baseTrim);

      // Hinged lid at back edge
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 1.0, -0.57);
      group.add(lidPivot);

      const lid = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.16, 1.22), rimMat);
      lid.position.set(0, 0.06, 0.57);
      lid.castShadow = true;
      lid.userData.boxId = id;
      lid.layers.enable(1);
      lidPivot.add(lid);

      boxes.push({
        id,
        group,
        lidPivot,
        bodyMesh,
        closedTex,
        openTex,
        wasOpened: false,
        hover: 0,
      });
    }

    const updatePointer = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (ev: PointerEvent) => {
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const hitId = hits.find((h) => typeof h.object.userData?.boxId === "number")?.object.userData.boxId ?? null;
      hoveredId = hitId;
      renderer.domElement.style.cursor =
        hitId && !stateRef.current.openedIds.has(hitId) && !stateRef.current.disabled ? "pointer" : "default";
    };

    const onClick = (ev: PointerEvent) => {
      if (stateRef.current.disabled) return;
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const hitId = hits.find((h) => typeof h.object.userData?.boxId === "number")?.object.userData.boxId ?? null;
      if (typeof hitId === "number" && !stateRef.current.openedIds.has(hitId)) {
        gameSfx.playBoxOpen();
        stateRef.current.onOpenBox(hitId);
      }
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", onClick);

    const stopLoop = startPacedLoop(renderer, isSoftwareGl, (dt, elapsed) => {
      const openSet = stateRef.current.openedIds;
      for (const b of boxes) {
        const isOpen = openSet.has(b.id);
        if (isOpen && !b.wasOpened) {
          b.wasOpened = true;
          const mat = b.bodyMesh.material as THREE.MeshStandardMaterial;
          mat.map = b.openTex;
          mat.needsUpdate = true;
        }
        const targetHover = !isOpen && hoveredId === b.id ? 1 : 0;
        b.hover = THREE.MathUtils.damp(b.hover, targetHover, 8, dt);

        const floatY = isOpen ? 0 : Math.sin(elapsed * 2.2 + b.id * 0.7) * 0.06 + b.hover * 0.16;
        b.group.position.y = floatY;
        b.group.rotation.y = isOpen ? 0 : Math.sin(elapsed * 1.1 + b.id) * 0.08;
        b.lidPivot.rotation.x = THREE.MathUtils.damp(b.lidPivot.rotation.x, isOpen ? -1.45 : 0, 7, dt);
      }
      renderer.render(scene, camera);
    });

    const onResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 220);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      stopLoop();
      boxes.forEach((b) => {
        b.closedTex.dispose();
        b.openTex.dispose();
      });
      disposeSceneResources(scene);
      renderer.dispose();
    };
  }, [total]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 mb-4">
      <div ref={hostRef} className="w-full h-[240px] sm:h-[290px]" />
    </div>
  );
}
