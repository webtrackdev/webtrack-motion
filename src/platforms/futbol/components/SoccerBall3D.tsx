// Balon de futbol en 3D (three.js via @remotion/three). El patron es exacto: 12 pentagonos
// y 20 hexagonos de un icosaedro truncado, calculados en el shader por la cara que "mira"
// cada punto de la esfera. Camara ortografica en px: x/y son coordenadas del cuadro.
import { useMemo, type FC } from 'react';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

const PHI = (1 + Math.sqrt(5)) / 2;

// Centros de caras: pentagonos = vertices del icosaedro; hexagonos = vertices del dodecaedro.
const centers = (() => {
  const pent: number[][] = [];
  for (const a of [-1, 1]) for (const b of [-PHI, PHI]) pent.push([0, a, b], [a, b, 0], [b, 0, a]);
  const hex: number[][] = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) hex.push([a, b, c]);
  // Duales del icosaedro (0, ±1, ±PHI): permutaciones ciclicas de (±1/PHI, 0, ±PHI).
  for (const a of [-1 / PHI, 1 / PHI]) for (const b of [-PHI, PHI]) hex.push([a, 0, b], [b, a, 0], [0, b, a]);
  return [...pent, ...hex].map((v) => new THREE.Vector3(v[0], v[1], v[2]).normalize());
})();
// Distancia al plano de cada cara (arista 1): pentagonos 2.32744, hexagonos 2.26728.
const weights = centers.map((_, i) => (i < 12 ? 2.26728 / 2.32744 : 1));

const vertex = /* glsl */ `
  varying vec3 vObjN;
  varying vec3 vViewN;
  varying vec3 vViewPos;
  void main() {
    vObjN = normalize(normal);
    vViewN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uCenters[32];
  uniform float uWeights[32];
  uniform vec3 uPent;
  uniform vec3 uHex;
  uniform vec3 uRim;
  uniform float uOpacity;
  varying vec3 vObjN;
  varying vec3 vViewN;
  varying vec3 vViewPos;
  void main() {
    vec3 n = normalize(vObjN);
    float best = -10.0;
    float second = -10.0;
    int idx = 0;
    for (int i = 0; i < 32; i++) {
      float s = dot(n, uCenters[i]) * uWeights[i];
      if (s > best) { second = best; best = s; idx = i; }
      else if (s > second) { second = s; }
    }
    vec3 base = idx < 12 ? uPent : uHex;
    // Costura entre paneles, con un leve hundido
    float edge = best - second;
    float seam = smoothstep(0.0, 0.010, edge);
    base = mix(base * 0.45, base, seam);
    float pillow = smoothstep(0.0, 0.08, edge);

    vec3 N = normalize(vViewN);
    vec3 V = normalize(-vViewPos);
    vec3 L = normalize(vec3(-0.45, 0.65, 0.75));
    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 28.0) * 0.45 * pillow;
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 col = base * (0.32 + 0.78 * diff) * (0.86 + 0.14 * pillow) + spec + rim * uRim * 0.12;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

export type BallState = {
  /** Centro en px del cuadro (1920x1080). */
  x: number;
  y: number;
  /** Radio en px. */
  r: number;
  rx?: number;
  ry?: number;
  rz?: number;
  opacity?: number;
};

const Ball: FC<{ s: BallState; rim: string; w: number; h: number }> = ({ s, rim, w, h }) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        uniforms: {
          uCenters: { value: centers },
          uWeights: { value: weights },
          uPent: { value: new THREE.Color('#111614') },
          uHex: { value: new THREE.Color('#f7f8f6') },
          uRim: { value: new THREE.Color(rim) },
          uOpacity: { value: 1 }
        }
      }),
    [rim]
  );
  material.uniforms.uOpacity.value = s.opacity ?? 1;
  return (
    <mesh position={[s.x - w / 2, h / 2 - s.y, 0]} rotation={[s.rx ?? 0, s.ry ?? 0, s.rz ?? 0]} scale={[s.r, s.r, s.r]} material={material}>
      <sphereGeometry args={[1, 128, 96]} />
    </mesh>
  );
};

/** Capa de balones 3D a pantalla completa (fondo transparente). */
export const BallLayer: FC<{ balls: BallState[]; width?: number; height?: number; rim?: string }> = ({ balls, width = 1920, height = 1080, rim = '#84cc16' }) => (
  <ThreeCanvas
    width={width}
    height={height}
    orthographic
    camera={{ position: [0, 0, 1000], near: 0.1, far: 4000, zoom: 1 }}
    gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
    style={{ position: 'absolute', inset: 0 }}
  >
    {balls.filter((b) => (b.opacity ?? 1) > 0.001 && b.r > 0.5).map((b, i) => (
      <Ball key={i} s={b} rim={rim} w={width} h={height} />
    ))}
  </ThreeCanvas>
);
