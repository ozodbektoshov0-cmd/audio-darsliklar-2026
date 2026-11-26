import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw, Trophy, Users, Volume2, VolumeX, Camera } from "lucide-react";
import type { PlayMode, Quiz } from "./types";
import { buildExplanation, correctAnswerText, shuffle } from "./util";
import { toPlayableChoiceQuestions } from "./gameEngines";
import {
  attachStudioEnvironment,
  createStudioRenderer,
  detectSoftwareWebGL,
  disposeSceneResources,
  gameSfx,
  startPacedLoop,
} from "./threeUtils";

interface TugOfWar3DProps {
  quiz: Quiz;
  uz: boolean;
  playMode: PlayMode;
  onFinish: (score: number) => void;
  onRestart: () => void;
}

interface KidRig {
  root: THREE.Group;
  torsoPivot: THREE.Group;
  headGroup: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
}

const WIN_STEPS = 5;

function createGrassTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3f8f46";
  ctx.fillRect(0, 0, 512, 512);

  // Subtle mowed grass stripes
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
    ctx.fillRect(i * 64, 0, 64, 512);
  }
  // Grass speckles
  for (let i = 0; i < 2400; i++) {
    const x = (i * 73) % 512;
    const y = (i * 137) % 512;
    ctx.fillStyle = i % 3 === 0 ? "#4aa552" : "#347a3b";
    ctx.fillRect(x, y, 2, 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 6);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createRopeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#b88746";
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = "#8a5e28";
  ctx.lineWidth = 6;
  for (let x = -64; x < 320; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 64, 128);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function buildKidCharacter(
  jerseyHex: number,
  shortsHex: number,
  capHex: number,
  skinHex: number,
  facingSign: 1 | -1,
): KidRig {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.65, metalness: 0.02 });
  const jerseyMat = new THREE.MeshStandardMaterial({ color: jerseyHex, roughness: 0.55, metalness: 0.05 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.08 });
  const shortsMat = new THREE.MeshStandardMaterial({ color: shortsHex, roughness: 0.72, metalness: 0.02 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.15 });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5, metalness: 0.05 });
  const capMat = new THREE.MeshStandardMaterial({ color: capHex, roughness: 0.5, metalness: 0.08 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.1 });

  // Ground contact shadow plane under kid
  const shadowGeo = new THREE.CircleGeometry(0.42, 20);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x0b1f10,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.02;
  root.add(contactShadow);

  // Legs (pivoted at hip y = 0.72)
  const makeLeg = (zOffset: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(0, 0.72, zOffset);

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.24, 6, 10), shortsMat);
    upper.position.y = -0.18;
    upper.castShadow = true;
    legPivot.add(upper);

    const calf = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.26, 6, 10), skinMat);
    calf.position.y = -0.44;
    calf.castShadow = true;
    legPivot.add(calf);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.13, 0.18), shoeMat);
    shoe.position.set(facingSign * 0.05, -0.64, 0);
    shoe.castShadow = true;
    legPivot.add(shoe);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.19), soleMat);
    sole.position.set(facingSign * 0.05, -0.7, 0);
    legPivot.add(sole);

    return legPivot;
  };

  const leftLegPivot = makeLeg(0.16);
  const rightLegPivot = makeLeg(-0.16);
  root.add(leftLegPivot, rightLegPivot);

  // Torso pivot at hips (y = 0.72)
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.72, 0);
  root.add(torsoPivot);

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.2, 12), shortsMat);
  pelvis.position.y = 0.06;
  pelvis.castShadow = true;
  torsoPivot.add(pelvis);

  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.23, 0.56, 14), jerseyMat);
  chest.position.y = 0.42;
  chest.castShadow = true;
  torsoPivot.add(chest);

  const chestBand = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.255, 0.12, 14), stripeMat);
  chestBand.position.y = 0.45;
  torsoPivot.add(chestBand);

  // Head group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.78, 0);
  torsoPivot.add(headGroup);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.12, 10), skinMat);
  neck.position.y = 0.02;
  headGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 14), skinMat);
  head.position.y = 0.24;
  head.castShadow = true;
  headGroup.add(head);

  // Eyes facing toward center
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeMat);
  eyeL.position.set(facingSign * 0.21, 0.26, 0.09);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeMat);
  eyeR.position.set(facingSign * 0.21, 0.26, -0.09);
  headGroup.add(eyeL, eyeR);

  // Cap dome + visor
  const capDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.265, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.54),
    capMat,
  );
  capDome.position.y = 0.27;
  capDome.castShadow = true;
  headGroup.add(capDome);

  const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.28), capMat);
  capVisor.position.set(facingSign * 0.22, 0.34, 0);
  capVisor.rotation.z = facingSign * -0.15;
  headGroup.add(capVisor);

  // Arms reaching forward toward the rope
  const makeArm = (zOffset: number) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(0, 0.62, zOffset);

    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.16, 6, 8), jerseyMat);
    sleeve.rotation.z = facingSign * (-Math.PI / 2 + 0.12);
    sleeve.position.set(facingSign * 0.14, -0.02, 0);
    sleeve.castShadow = true;
    armPivot.add(sleeve);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.28, 6, 8), skinMat);
    forearm.rotation.z = facingSign * (-Math.PI / 2 + 0.05);
    forearm.position.set(facingSign * 0.38, -0.04, -zOffset * 0.35);
    forearm.castShadow = true;
    armPivot.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), skinMat);
    hand.position.set(facingSign * 0.56, -0.05, -zOffset * 0.65);
    armPivot.add(hand);

    return armPivot;
  };

  const leftArmPivot = makeArm(0.28);
  const rightArmPivot = makeArm(-0.28);
  torsoPivot.add(leftArmPivot, rightArmPivot);

  return { root, torsoPivot, headGroup, leftLegPivot, rightLegPivot, leftArmPivot, rightArmPivot };
}

function buildStylizedTree(x: number, z: number, scale = 1): THREE.Group {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6d4c3d, roughness: 0.88, metalness: 0.02 });
  const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.72, metalness: 0.02 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.68, metalness: 0.02 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 1.5 * scale, 8), trunkMat);
  trunk.position.y = 0.75 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95 * scale, 1), leafMat1);
  crown1.position.y = 2.0 * scale;
  crown1.castShadow = true;
  const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 * scale, 1), leafMat2);
  crown2.position.set(0.35 * scale, 2.55 * scale, 0.2 * scale);
  tree.add(crown1, crown2);
  return tree;
}

export default function TugOfWar3D({ quiz, uz, playMode, onFinish, onRestart }: TugOfWar3DProps) {
  const pool = useMemo(() => shuffle(toPlayableChoiceQuestions(quiz, uz)), [quiz, uz]);
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Two independent question streams: Left (Team 1) & Right (Team 2 / Bot)
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(() => (pool.length > 1 ? Math.floor(pool.length / 2) : 0));
  const [leftLock, setLeftLock] = useState<{ picked: number; ok: boolean } | null>(null);
  const [rightLock, setRightLock] = useState<{ picked: number; ok: boolean } | null>(null);
  const [ropePos, setRopePos] = useState(0); // -WIN_STEPS (Left wins) .. +WIN_STEPS (Right wins)
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [muted, setMuted] = useState(false);
  const [camPreset, setCamPreset] = useState<"arena" | "close">("arena");
  const [botProgress, setBotProgress] = useState(0);

  const reported = useRef(false);
  const vsBot = playMode === "solo";

  // Mutable animation refs read by Three.js render loop without tearing down WebGL
  const simRef = useRef({
    ropeTarget: 0,
    leftPullBurst: 0,
    rightPullBurst: 0,
    leftStumble: 0,
    rightStumble: 0,
    winner: null as 1 | 2 | null,
    camPreset: "arena" as "arena" | "close",
    spawnDustSide: 0 as -1 | 0 | 1,
  });

  useEffect(() => {
    simRef.current.ropeTarget = (ropePos / WIN_STEPS) * 3.1;
    simRef.current.winner = winner;
    simRef.current.camPreset = camPreset;
  }, [ropePos, winner, camPreset]);

  useEffect(() => {
    gameSfx.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (winner && !reported.current) {
      reported.current = true;
      gameSfx.playWin();
      onFinish(winner === 1 ? Math.max(100, scores[0]) : scores[0]);
    }
  }, [winner, scores, onFinish]);

  // Mount Three.js 3D Arena once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = createStudioRenderer(container, isSoftwareGl);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbeafe);
    scene.fog = new THREE.Fog(0xdbeafe, 16, 46);
    attachStudioEnvironment(renderer, scene);

    const camera = new THREE.PerspectiveCamera(
      42,
      Math.max(container.clientWidth, 320) / Math.max(container.clientHeight, 240),
      0.1,
      90,
    );
    camera.position.set(0, 4.1, 10.6);
    camera.lookAt(0, 1.0, 0);

    // 3-Point Outdoor Lighting
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x3b6e35, 0.9);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff5db, 1.8);
    sun.position.set(6, 11, 7);
    sun.castShadow = !isSoftwareGl;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -9;
    sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 7;
    sun.shadow.camera.bottom = -7;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0xbae6fd, 0.55);
    rim.position.set(-7, 5, -6);
    scene.add(rim);

    // Extended Outdoor Grass Field (no indoor boxed walls)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const grassTex = createGrassTexture(maxAniso);
    const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.9, metalness: 0.0 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, 50), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Dirt tug lane & finish lines
    const laneMat = new THREE.MeshStandardMaterial({ color: 0xa17c55, roughness: 0.94, metalness: 0.0 });
    const lane = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.02, 2.2), laneMat);
    lane.position.y = 0.01;
    lane.receiveShadow = true;
    scene.add(lane);

    const chalkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 });
    const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.024, 2.8), chalkMat);
    centerLine.position.y = 0.015;
    scene.add(centerLine);

    const leftWinLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.024, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }),
    );
    leftWinLine.position.set(-3.1, 0.015, 0);
    const rightWinLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.024, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }),
    );
    rightWinLine.position.set(3.1, 0.015, 0);
    scene.add(leftWinLine, rightWinLine);

    // Stadium boundary cones/posts
    const postMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
    const conePositions: [number, number, number][] = [
      [-5.8, 0.35, -1.6],
      [-5.8, 0.35, 1.6],
      [5.8, 0.35, -1.6],
      [5.8, 0.35, 1.6],
    ];
    conePositions.forEach(([x, y, z], idx) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 0.7, 10),
        idx < 2 ? new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.45 }) : new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 }),
      );
      post.position.set(x, y, z);
      post.castShadow = true;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), postMat);
      cap.position.set(x, y + 0.38, z);
      scene.add(post, cap);
    });

    // Background trees along horizon
    const treeCoords: [number, number, number][] = [
      [-10, -7, 1.15],
      [-5.5, -8.5, 0.95],
      [0.5, -9, 1.25],
      [6.5, -8.2, 1.05],
      [11, -7.2, 1.1],
      [-12, -3.5, 0.9],
      [12.5, -3.5, 0.95],
    ];
    treeCoords.forEach(([x, z, s]) => scene.add(buildStylizedTree(x, z, s)));

    // Braided Rope + Center Flag Group
    const ropeGroup = new THREE.Group();
    scene.add(ropeGroup);

    const ropeTex = createRopeTexture(maxAniso);
    const ropeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 6.2, 12),
      new THREE.MeshStandardMaterial({ map: ropeTex, roughness: 0.78, metalness: 0.04 }),
    );
    ropeMesh.rotation.z = Math.PI / 2;
    ropeMesh.position.y = 1.26;
    ropeMesh.castShadow = true;
    ropeGroup.add(ropeMesh);

    // Center red knot & ribbon flag
    const knot = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 }),
    );
    knot.position.set(0, 1.26, 0);
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.38, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }),
    );
    ribbon.position.set(0, 1.05, 0);
    ropeGroup.add(knot, ribbon);

    // Two 3D Kids pulling the rope
    const leftKid = buildKidCharacter(0x2563eb, 0x1e3a8a, 0x1d4ed8, 0xf6c7a6, 1);
    leftKid.root.position.set(-2.45, 0, 0);
    scene.add(leftKid.root);

    const rightKid = buildKidCharacter(0xea580c, 0x7c2d12, 0xd97706, 0xf2be9b, -1);
    rightKid.root.position.set(2.45, 0, 0);
    scene.add(rightKid.root);

    // Dust puff pool (zero GC in loop)
    const dustCount = 12;
    const dustPuffs: { mesh: THREE.Mesh; vx: number; vy: number; life: number }[] = [];
    const dustGeo = new THREE.SphereGeometry(0.11, 8, 8);
    const dustMat = new THREE.MeshBasicMaterial({ color: 0xe7d3b3, transparent: true, opacity: 0.0 });
    for (let i = 0; i < dustCount; i++) {
      const m = new THREE.Mesh(dustGeo, dustMat.clone());
      m.visible = false;
      scene.add(m);
      dustPuffs.push({ mesh: m, vx: 0, vy: 0, life: 0 });
    }

    const spawnDustBurst = (x: number, dirX: number) => {
      let spawned = 0;
      for (const p of dustPuffs) {
        if (p.life <= 0 && spawned < 4) {
          p.life = 0.55;
          p.vx = dirX * (0.8 + spawned * 0.4);
          p.vy = 0.7 + spawned * 0.25;
          p.mesh.position.set(x + (spawned - 1.5) * 0.15, 0.12, (spawned % 2 === 0 ? 1 : -1) * 0.14);
          p.mesh.scale.setScalar(0.8);
          p.mesh.visible = true;
          spawned++;
        }
      }
    };

    let currentRopeX = 0;
    let camX = 0;
    let camZ = 10.6;
    let camY = 4.1;

    const stopLoop = startPacedLoop(renderer, isSoftwareGl, (dt, elapsed) => {
      const s = simRef.current;

      // Smooth rope & kids horizontal slide
      currentRopeX = THREE.MathUtils.damp(currentRopeX, s.ropeTarget, 6.2, dt);
      ropeGroup.position.x = currentRopeX;
      leftKid.root.position.x = currentRopeX - 2.45;
      rightKid.root.position.x = currentRopeX + 2.45;

      // Decay bursts
      if (s.spawnDustSide !== 0) {
        spawnDustBurst(
          s.spawnDustSide === -1 ? leftKid.root.position.x : rightKid.root.position.x,
          s.spawnDustSide === -1 ? 1 : -1,
        );
        s.spawnDustSide = 0;
      }
      s.leftPullBurst = Math.max(0, s.leftPullBurst - dt * 1.9);
      s.rightPullBurst = Math.max(0, s.rightPullBurst - dt * 1.9);
      s.leftStumble = Math.max(0, s.leftStumble - dt * 2.1);
      s.rightStumble = Math.max(0, s.rightStumble - dt * 2.1);

      // Idle tension breathing + pulling kinematics
      const idleStrain = Math.sin(elapsed * 4.2) * 0.05;

      if (s.winner === 1) {
        leftKid.root.position.y = Math.abs(Math.sin(elapsed * 7.5)) * 0.45;
        leftKid.torsoPivot.rotation.z = 0.05;
        leftKid.leftArmPivot.rotation.z = 1.9;
        leftKid.rightArmPivot.rotation.z = 1.9;
        rightKid.torsoPivot.rotation.z = 0.35;
        rightKid.root.position.y = 0;
      } else if (s.winner === 2) {
        rightKid.root.position.y = Math.abs(Math.sin(elapsed * 7.5)) * 0.45;
        rightKid.torsoPivot.rotation.z = -0.05;
        rightKid.leftArmPivot.rotation.z = -1.9;
        rightKid.rightArmPivot.rotation.z = -1.9;
        leftKid.torsoPivot.rotation.z = -0.35;
        leftKid.root.position.y = 0;
      } else {
        leftKid.root.position.y = 0;
        rightKid.root.position.y = 0;

        // Left kid leans BACK (+Z rotation is leaning left away from center!)
        const leftLean = 0.22 + idleStrain + s.leftPullBurst * 0.34 - s.leftStumble * 0.32;
        leftKid.torsoPivot.rotation.z = leftLean;
        const leftStride = Math.sin(elapsed * (6 + s.leftPullBurst * 10)) * (0.14 + s.leftPullBurst * 0.38);
        leftKid.leftLegPivot.rotation.z = leftStride + 0.15;
        leftKid.rightLegPivot.rotation.z = -leftStride - 0.1;
        leftKid.leftArmPivot.rotation.z = -s.leftPullBurst * 0.25;
        leftKid.rightArmPivot.rotation.z = -s.leftPullBurst * 0.25;

        // Right kid leans BACK (-Z rotation is leaning right away from center!)
        const rightLean = -(0.22 - idleStrain + s.rightPullBurst * 0.34 - s.rightStumble * 0.32);
        rightKid.torsoPivot.rotation.z = rightLean;
        const rightStride = Math.sin(elapsed * (6 + s.rightPullBurst * 10) + 1.2) * (0.14 + s.rightPullBurst * 0.38);
        rightKid.leftLegPivot.rotation.z = rightStride - 0.15;
        rightKid.rightLegPivot.rotation.z = -rightStride + 0.1;
        rightKid.leftArmPivot.rotation.z = s.rightPullBurst * 0.25;
        rightKid.rightArmPivot.rotation.z = s.rightPullBurst * 0.25;

        // Subtle rope vibration when pulling
        ropeGroup.position.y = Math.sin(elapsed * 22) * (s.leftPullBurst + s.rightPullBurst) * 0.02;
        ribbon.rotation.z = THREE.MathUtils.clamp(-currentRopeX * 0.08 + Math.sin(elapsed * 5) * 0.06, -0.35, 0.35);
      }

      // Dust puff update
      for (const p of dustPuffs) {
        if (p.life > 0) {
          p.life -= dt;
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.vy -= 1.8 * dt;
          p.mesh.scale.addScalar(dt * 1.4);
          const m = p.mesh.material as THREE.MeshBasicMaterial;
          m.opacity = Math.max(0, p.life * 0.9);
          if (p.life <= 0) p.mesh.visible = false;
        }
      }

      // Smooth camera tracking
      const targetCamX = currentRopeX * 0.35;
      const targetCamZ = s.camPreset === "close" ? 8.2 : 10.6;
      const targetCamY = s.camPreset === "close" ? 3.2 : 4.1;
      camX = THREE.MathUtils.damp(camX, targetCamX, 4.5, dt);
      camZ = THREE.MathUtils.damp(camZ, targetCamZ, 4.5, dt);
      camY = THREE.MathUtils.damp(camY, targetCamY, 4.5, dt);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(currentRopeX * 0.5, 1.05, 0);

      renderer.render(scene, camera);
    });

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 240);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      stopLoop();
      disposeSceneResources(scene);
      renderer.dispose();
    };
  }, []);

  // Solo mode: AI opponent kid automatically attempts its question
  useEffect(() => {
    if (!vsBot || winner !== null || pool.length === 0) return;
    let elapsedMs = 0;
    const intervalMs = 100;
    const thinkTargetMs = 4600;

    const timer = window.setInterval(() => {
      elapsedMs += intervalMs;
      setBotProgress(Math.min(100, Math.round((elapsedMs / thinkTargetMs) * 100)));
      if (elapsedMs >= thinkTargetMs) {
        elapsedMs = 0;
        const botCorrect = Math.random() < 0.62;
        if (botCorrect) {
          gameSfx.playPullCorrect();
          setScores((s) => [s[0], s[1] + 50]);
          simRef.current.rightPullBurst = 1.0;
          simRef.current.leftStumble = 0.7;
          simRef.current.spawnDustSide = 1;
          setRopePos((pos) => {
            const next = Math.min(WIN_STEPS, pos + 1);
            if (next >= WIN_STEPS) setWinner(2);
            return next;
          });
        } else {
          gameSfx.playWrong();
        }
        setRightIdx((i) => i + 1);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [vsBot, winner, pool.length]);

  if (pool.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        {uz ? "O'yin uchun test savollari yetarli emas." : "Недостаточно вопросов для игры."}
      </div>
    );
  }

  const leftQ = pool[leftIdx % pool.length];
  const rightQ = pool[rightIdx % pool.length];

  const handleSideAnswer = (side: 1 | 2, pickIdx: number) => {
    if (winner !== null) return;
    if (side === 1 && leftLock !== null) return;
    if (side === 2 && (rightLock !== null || vsBot)) return;

    const q = side === 1 ? leftQ : rightQ;
    const correctIdx = q.type === "choice" ? q.answer : q.answer ? 0 : 1;
    const ok = pickIdx === correctIdx;

    if (side === 1) setLeftLock({ picked: pickIdx, ok });
    else setRightLock({ picked: pickIdx, ok });

    if (ok) {
      gameSfx.playPullCorrect();
      setScores((s) => (side === 1 ? [s[0] + 50, s[1]] : [s[0], s[1] + 50]));
      if (side === 1) {
        simRef.current.leftPullBurst = 1.0;
        simRef.current.rightStumble = 0.8;
        simRef.current.spawnDustSide = -1;
      } else {
        simRef.current.rightPullBurst = 1.0;
        simRef.current.leftStumble = 0.8;
        simRef.current.spawnDustSide = 1;
      }

      setRopePos((pos) => {
        const next = side === 1 ? Math.max(-WIN_STEPS, pos - 1) : Math.min(WIN_STEPS, pos + 1);
        if (next <= -WIN_STEPS) setWinner(1);
        else if (next >= WIN_STEPS) setWinner(2);
        return next;
      });

      window.setTimeout(() => {
        if (side === 1) {
          setLeftLock(null);
          setLeftIdx((n) => n + 1);
        } else {
          setRightLock(null);
          setRightIdx((n) => n + 1);
        }
      }, 650);
    } else {
      gameSfx.playWrong();
      window.setTimeout(() => {
        if (side === 1) {
          setLeftLock(null);
          setLeftIdx((n) => n + 1);
        } else {
          setRightLock(null);
          setRightIdx((n) => n + 1);
        }
      }, 1200);
    }
  };

  const renderOptions = (q: typeof leftQ) =>
    q.type === "choice" ? q.options : [uz ? "To'g'ri" : "Верно", uz ? "Noto'g'ri" : "Неверно"];

  const ropePercent = ((ropePos + WIN_STEPS) / (WIN_STEPS * 2)) * 100;

  return (
    <div className="space-y-3">
      {/* Compact Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-black text-brand-primary dark:text-blue-300 tabular-nums">
          <Users size={16} />
          <span>{uz ? "1-bola (Ko'k):" : "Игрок 1:"}</span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50">{scores[0]}</span>
        </div>

        {/* Rope tension indicator */}
        <div className="flex items-center gap-3 flex-1 max-w-xs min-w-[150px]">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">←</span>
          <div className="relative flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400" />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow transition-all duration-300"
              style={{ left: `${ropePercent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">→</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums">
            <span>{vsBot ? (uz ? "Raqib bola:" : "Соперник:") : uz ? "2-bola (Sariq):" : "Игрок 2:"}</span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50">{scores[1]}</span>
          </div>
          <button
            type="button"
            onClick={() => setCamPreset((p) => (p === "arena" ? "close" : "arena"))}
            aria-label={uz ? "Kamerani almashtirish" : "Сменить камеру"}
            title={uz ? "Kamerani yaqinlashtirish" : "Сменить камеру"}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            <Camera size={15} />
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={uz ? "Ovozni yoqish yoki o'chirish" : "Включить или выключить звук"}
            title={uz ? "Ovozni yoqish/o'chirish" : "Звук"}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* 3D ARENA VIEWPORT (100% unobstructed center) */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-sky-100 shadow-lg">
        <div
          ref={mountRef}
          data-testid="tug-3d-canvas-host"
          className="w-full h-[230px] sm:h-[265px] lg:h-[295px]"
        />

        {/* Winner overlay when match ends */}
        {winner !== null && (
          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
              <Trophy className="mx-auto text-amber-500 mb-2" size={44} />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {uz ? "3D Arg'amchi tortish yakuni" : "Итоги 3D перетягивания каната"}
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white my-2">
                {winner === 1
                  ? uz
                    ? "1-bola (Ko'k jamoa) g'olib bo'ldi!"
                    : "Победила Команда 1!"
                  : vsBot
                    ? uz
                      ? "Raqib bola arqonni tortib ketdi"
                      : "Соперник перетянул канат"
                    : uz
                      ? "2-bola (Sariq jamoa) g'olib bo'ldi!"
                      : "Победила Команда 2!"}
              </h3>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-5 tabular-nums">
                {uz ? `Hisob: ${scores[0]} — ${scores[1]}` : `Счёт: ${scores[0]} — ${scores[1]}`}
              </p>
              <button
                type="button"
                onClick={onRestart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold"
              >
                <RotateCcw size={16} />
                {uz ? "Qayta o'ynash" : "Играть снова"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PASTDA IKKI CHETDA IKKITA TEST PANELI */}
      {winner === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CHAP CHET: 1-BOLA TESTI */}
          <div
            data-testid="tug-left-quiz"
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-brand-primary dark:text-blue-300">
                  {uz ? "Chap tomon · 1-bola testi" : "Левый игрок · Тест 1"}
                </span>
                <span className="text-xs font-bold text-slate-400 tabular-nums">#{leftIdx + 1}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                {leftQ.q}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {renderOptions(leftQ).map((opt, idx) => {
                  const correctIdx = leftQ.type === "choice" ? leftQ.answer : leftQ.answer ? 0 : 1;
                  let cls =
                    "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-brand-primary hover:bg-blue-50 dark:hover:bg-slate-700";
                  if (leftLock !== null) {
                    if (idx === correctIdx) {
                      cls = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200";
                    } else if (idx === leftLock.picked) {
                      cls = "bg-red-50 dark:bg-red-950/50 border-red-500 text-red-800 dark:text-red-200";
                    } else {
                      cls = "opacity-55 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={leftLock !== null}
                      onClick={() => handleSideAnswer(1, idx)}
                      className={`px-3 py-2.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-colors ${cls}`}
                    >
                      <span className="font-black mr-1.5">{String.fromCharCode(65 + idx)})</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {leftLock && !leftLock.ok && (
              <p className="mt-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                {uz ? "To'g'ri javob:" : "Верно:"} {correctAnswerText(leftQ, uz)} — {buildExplanation(leftQ, uz)}
              </p>
            )}
          </div>

          {/* O'NG CHET: 2-BOLA TESTI */}
          <div
            data-testid="tug-right-quiz"
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {vsBot
                    ? uz
                      ? "O'ng tomon · Raqib bola"
                      : "Правый · Соперник"
                    : uz
                      ? "O'ng tomon · 2-bola testi"
                      : "Правый игрок · Тест 2"}
                </span>
                {vsBot ? (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {uz ? "Fikrlamoqda:" : "Думает:"} {botProgress}%
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400 tabular-nums">#{rightIdx + 1}</span>
                )}
              </div>

              {vsBot && (
                <div className="w-full h-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 overflow-hidden mb-3">
                  <div
                    className="h-full bg-amber-500 transition-all duration-100"
                    style={{ width: `${botProgress}%` }}
                  />
                </div>
              )}

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                {rightQ.q}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {renderOptions(rightQ).map((opt, idx) => {
                  const correctIdx = rightQ.type === "choice" ? rightQ.answer : rightQ.answer ? 0 : 1;
                  let cls =
                    "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700";
                  if (vsBot) {
                    cls = "bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-500 cursor-default";
                  } else if (rightLock !== null) {
                    if (idx === correctIdx) {
                      cls = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200";
                    } else if (idx === rightLock.picked) {
                      cls = "bg-red-50 dark:bg-red-950/50 border-red-500 text-red-800 dark:text-red-200";
                    } else {
                      cls = "opacity-55 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={vsBot || rightLock !== null}
                      onClick={() => handleSideAnswer(2, idx)}
                      className={`px-3 py-2.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-colors ${cls}`}
                    >
                      <span className="font-black mr-1.5">{String.fromCharCode(65 + idx)})</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {rightLock && !rightLock.ok && (
              <p className="mt-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                {uz ? "To'g'ri javob:" : "Верно:"} {correctAnswerText(rightQ, uz)} — {buildExplanation(rightQ, uz)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
