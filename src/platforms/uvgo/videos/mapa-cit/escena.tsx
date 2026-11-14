// Mapa 3D real alrededor del CIT de la UVG: edificios, calles y áreas verdes de OpenStreetMap
// (osm.ts), con la misma apariencia de DeliveryMap (edificios #d9d4cb, ruta coral con borde blanco)
// y la moto 3D de UVGo (public/uvgo/moto.glb). Origen en 14.6039125, -90.4891944 (+X este, +Z sur).
// Ojo: no nombrar este archivo como la composición (VideoCit.tsx); el disco de macOS no distingue mayúsculas.
import { useMemo, type FC } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OSM } from './osm';
import { useModeloMoto } from '../mapa-3d/Mapa3D';

export { useModeloMoto };

type Pt = readonly [number, number];
export const RUTA = OSM.ruta as unknown as Pt[];
const largos = RUTA.slice(1).map(([x, z], i) => Math.hypot(x - RUTA[i][0], z - RUTA[i][1]));
const LARGO = largos.reduce((a, b) => a + b, 0);

/** Posición y giro (radianes sobre Y, 0 = +X) en la fracción t de la ruta. */
export const enRuta = (t: number) => {
  let d = Math.max(0, Math.min(1, t)) * LARGO;
  for (let i = 0; i < largos.length; i++) {
    const [x0, z0] = RUTA[i];
    const [x1, z1] = RUTA[i + 1];
    if (d <= largos[i] || i === largos.length - 1) {
      const k = largos[i] === 0 ? 1 : Math.min(1, d / largos[i]);
      return { x: x0 + (x1 - x0) * k, z: z0 + (z1 - z0) * k, rot: Math.atan2(-(z1 - z0), x1 - x0), seg: i };
    }
    d -= largos[i];
  }
  const n = RUTA.length - 1;
  return { x: RUTA[n][0], z: RUTA[n][1], rot: 0, seg: n - 1 };
};

// ---------------------------------------------------------------- geometrías (se arman una vez)

/** Cintas planas unidas en una sola geometría (calles o ruta). */
const cintas = (lineas: { p: readonly Pt[]; w: number }[]) => {
  const pos: number[] = [];
  for (const { p, w } of lineas) {
    for (let i = 0; i < p.length - 1; i++) {
      const [x0, z0] = p[i];
      const [x1, z1] = p[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      if (L < 0.01) continue;
      // se alarga medio ancho en cada punta para que las esquinas no queden abiertas
      const ux = (x1 - x0) / L;
      const uz = (z1 - z0) / L;
      const nx = -uz * (w / 2);
      const nz = ux * (w / 2);
      const ax = x0 - ux * (w / 2);
      const az = z0 - uz * (w / 2);
      const bx = x1 + ux * (w / 2);
      const bz = z1 + uz * (w / 2);
      pos.push(ax + nx, 0, az + nz, bx - nx, 0, bz - nz, bx + nx, 0, bz + nz, ax + nx, 0, az + nz, ax - nx, 0, az - nz, bx - nx, 0, bz - nz);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
};

const poligono = (p: readonly Pt[]) => new THREE.Shape(p.map(([x, z]) => new THREE.Vector2(x, -z)));

const PEATONAL = new Set(['footway', 'path', 'steps', 'cycleway', 'pedestrian']);

const useCiudad = () =>
  useMemo(() => {
    const calles = OSM.calles as unknown as { w: number; k: string; p: Pt[] }[];
    return {
      vias: cintas(calles.filter((c) => !PEATONAL.has(c.k))),
      senderos: cintas(calles.filter((c) => PEATONAL.has(c.k))),
      verdes: (OSM.verdes as unknown as { p: Pt[] }[]).map((v) => new THREE.ShapeGeometry(poligono(v.p))),
      edificios: (OSM.edificios as unknown as { p: Pt[]; h: number }[]).map((e) => new THREE.ExtrudeGeometry(poligono(e.p), { depth: e.h, bevelEnabled: false }))
    };
  }, []);

// ---------------------------------------------------------------- piezas

const Ruta: FC<{ progreso: number }> = ({ progreso }) => {
  const m = enRuta(progreso);
  const borde = useMemo(() => cintas([{ p: RUTA, w: 10 }]), []);
  const pendiente = useMemo(() => cintas([{ p: RUTA, w: 5 }]), []);
  const hecho = useMemo(() => cintas([{ p: [...RUTA.slice(0, m.seg + 1), [m.x, m.z] as Pt], w: 5 }]), [m.seg, m.x, m.z]);
  return (
    <group>
      <mesh geometry={borde} position={[0, 0.3, 0]}>
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={pendiente} position={[0, 0.35, 0]}>
        <meshBasicMaterial color="#e07a5f" transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={hecho} position={[0, 0.4, 0]}>
        <meshBasicMaterial color="#e07a5f" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Marcador: FC<{ x: number; z: number; color: string; r?: number }> = ({ x, z, color, r = 7 }) => (
  <group position={[x, 0.5, z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 32]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <circleGeometry args={[r * 0.7, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  </group>
);

/** Rótulo de texto que siempre mira a la cámara (como las etiquetas del mapa). */
const Rotulo: FC<{ texto: string; x: number; y: number; z: number; escala: number; fondo?: string; color?: string; opacidad?: number }> = ({ texto, x, y, z, escala, fondo = 'rgba(255,255,255,0.95)', color = '#0a0a0a', opacidad = 1 }) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d') as CanvasRenderingContext2D;
    const font = '700 56px Inter, sans-serif';
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(texto).width) + 64;
    c.width = w;
    c.height = 96;
    ctx.font = font;
    ctx.fillStyle = fondo;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, 96, 48);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, 32, 50);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { t, aspect: w / 96 };
  }, [texto, fondo, color]);
  return (
    <sprite position={[x, y, z]} scale={[escala * tex.aspect, escala, 1]} renderOrder={10}>
      <spriteMaterial map={tex.t} transparent opacity={opacidad} depthTest={false} />
    </sprite>
  );
};

const Ciudad: FC<{ altura: number }> = ({ altura }) => {
  const c = useCiudad();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3000, 3000]} />
        <meshLambertMaterial color="#e4ddd1" />
      </mesh>
      {c.verdes.map((g, i) => (
        <mesh key={i} geometry={g} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} receiveShadow>
          <meshLambertMaterial color="#cfe5c4" side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={c.vias} position={[0, 0.15, 0]} receiveShadow>
        <meshLambertMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={c.senderos} position={[0, 0.12, 0]}>
        <meshLambertMaterial color="#f7f4ee" side={THREE.DoubleSide} />
      </mesh>
      {altura > 0.001 &&
        c.edificios.map((g, i) => (
          <mesh key={i} geometry={g} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, Math.max(0.01, altura)]} castShadow receiveShadow>
            <meshLambertMaterial color="#d9d4cb" />
          </mesh>
        ))}
    </group>
  );
};

export type Vista = { cx: number; cz: number; dist: number; pitch: number; bearing: number };

const Camara: FC<{ v: Vista }> = ({ v }) => {
  const { camera } = useThree();
  const p = THREE.MathUtils.degToRad(Math.max(0.5, v.pitch));
  const b = THREE.MathUtils.degToRad(v.bearing);
  const suelo = v.dist * Math.sin(p);
  camera.position.set(v.cx - Math.sin(b) * suelo, v.dist * Math.cos(p), v.cz + Math.cos(b) * suelo);
  camera.up.set(Math.sin(b) * Math.cos(p), Math.sin(p), -Math.cos(b) * Math.cos(p)).normalize();
  camera.lookAt(v.cx, 0, v.cz);
  camera.updateProjectionMatrix();
  return null;
};

export const MapaCIT: FC<{
  width: number;
  height: number;
  vista: Vista;
  progreso: number;
  altura: number;
  modelo: THREE.Object3D | null;
  rotulos: number;
  nombre: string;
}> = ({ width, height, vista, progreso, altura, modelo, rotulos, nombre }) => {
  const m = enRuta(progreso);
  const [bx, bz] = OSM.bodega;
  return (
    <ThreeCanvas width={width} height={height} dpr={2} camera={{ fov: 36, near: 1, far: 5000 }} shadows gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
      <color attach="background" args={['#eef0ec']} />
      <fog attach="fog" args={['#eef0ec', 900, 2400]} />
      <Camara v={vista} />
      <hemisphereLight args={['#ffffff', '#c9c2b6', 1.25]} />
      <directionalLight
        position={[-300, 520, 360]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-520}
        shadow-camera-right={520}
        shadow-camera-top={520}
        shadow-camera-bottom={-520}
        shadow-camera-far={1800}
        shadow-bias={-0.0005}
      />
      <Ciudad altura={altura} />
      <Ruta progreso={progreso} />
      <Marcador x={bx} z={bz} color="#1d411b" />
      <Marcador x={0} z={0} color="#e07a5f" r={9} />
      <group position={[m.x, 0.5, m.z]} rotation={[0, m.rot, 0]}>
        {modelo && <primitive object={modelo} />}
      </group>
      {rotulos > 0.01 && (
        <>
          <Rotulo texto="CIT · UVG" x={0} y={46} z={0} escala={13} fondo="rgba(224,122,95,0.96)" color="#ffffff" opacidad={rotulos} />
          <Rotulo texto={nombre} x={m.x} y={24} z={m.z} escala={9} opacidad={rotulos} />
          <Rotulo texto="Bodega UVGO" x={bx} y={22} z={bz} escala={8} opacidad={rotulos} />
        </>
      )}
    </ThreeCanvas>
  );
};
