// Mapa 3D del video: calles, manzanas, edificios extruidos (#d9d4cb como la capa fill-extrusion de
// DeliveryMap), la ruta coral (borde blanco, pendiente al 35 % y recorrido) y la moto 3D de UVGo
// (public/uvgo/moto.glb, el mismo modelo de src/assets de la web). Plano del suelo: +X = este, -Z = norte.
// La cámara se describe como en Mapbox: centro, distancia, inclinación (pitch) y rumbo (bearing).
import { useEffect, useMemo, useState, type FC } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { continueRender, delayRender, staticFile } from 'remotion';

// ---------------------------------------------------------------- ciudad

const PASO = 70; // de calle a calle
const CALLE = 14;
const CALLES = [-280, -210, -140, -70, 0, 70, 140, 210, 280];

/** Ruta por las calles: Bodega UVGO -> Edificio J. */
export const RUTA: [number, number][] = [
  [-140, 175],
  [-140, 70],
  [0, 70],
  [0, -70],
  [140, -70],
  [140, -140],
  [228, -140]
];
const largos = RUTA.slice(1).map(([x, z], i) => Math.hypot(x - RUTA[i][0], z - RUTA[i][1]));
const LARGO = largos.reduce((a, b) => a + b, 0);

/** Posición y rumbo (radianes sobre Y, 0 = +X) en la fracción t de la ruta. */
export const enRuta = (t: number) => {
  let d = Math.max(0, Math.min(1, t)) * LARGO;
  for (let i = 0; i < largos.length; i++) {
    const [x0, z0] = RUTA[i];
    const [x1, z1] = RUTA[i + 1];
    if (d <= largos[i] || i === largos.length - 1) {
      const k = Math.min(1, d / largos[i]);
      return { x: x0 + (x1 - x0) * k, z: z0 + (z1 - z0) * k, rot: Math.atan2(-(z1 - z0), x1 - x0), seg: i, k };
    }
    d -= largos[i];
  }
  return { x: RUTA[0][0], z: RUTA[0][1], rot: 0, seg: 0, k: 0 };
};

// Pseudoaleatorio estable
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type Edificio = { x: number; z: number; w: number; d: number; h: number };
const PARQUES = new Set(['1,-1', '-2,1', '2,2']);

const EDIFICIOS: Edificio[] = (() => {
  const out: Edificio[] = [];
  for (let i = -4; i < 4; i++) {
    for (let j = -4; j < 4; j++) {
      if (PARQUES.has(`${i},${j}`)) continue;
      const x0 = i * PASO + CALLE / 2 + 3;
      const z0 = j * PASO + CALLE / 2 + 3;
      const lado = PASO - CALLE - 6;
      // 2x2 edificios por manzana, con alturas variadas (más altos cerca del centro)
      for (let a = 0; a < 2; a++) {
        for (let b = 0; b < 2; b++) {
          const n = i * 31 + j * 17 + a * 7 + b * 3;
          if (rnd(n) < 0.12) continue;
          const w = lado / 2 - 3;
          const centro = 1 - Math.min(1, Math.hypot(i + 0.5, j + 0.5) / 5);
          out.push({ x: x0 + a * (lado / 2 + 3) + w / 2, z: z0 + b * (lado / 2 + 3) + w / 2, w: w * (0.8 + rnd(n + 1) * 0.2), d: w * (0.8 + rnd(n + 2) * 0.2), h: 8 + rnd(n + 3) * 20 + centro * 22 });
        }
      }
    }
  }
  return out;
})();

const Cinta: FC<{ a: [number, number]; b: [number, number]; ancho: number; y: number; color: string; opacity?: number }> = ({ a, b, ancho, y, color, opacity = 1 }) => {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const largo = Math.hypot(dx, dz);
  if (largo < 0.01) return null;
  return (
    <mesh position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[-Math.PI / 2, 0, Math.atan2(-dz, dx)]}>
      <planeGeometry args={[largo + ancho, ancho]} />
      <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} depthWrite={false} />
    </mesh>
  );
};

const Ruta: FC<{ progreso: number }> = ({ progreso }) => {
  const p = enRuta(progreso);
  const recorrido: [number, number][] = [...RUTA.slice(0, p.seg + 1), [p.x, p.z]];
  return (
    <group>
      {RUTA.slice(1).map((b, i) => (
        <Cinta key={`c${i}`} a={RUTA[i]} b={b} ancho={10} y={0.25} color="#ffffff" />
      ))}
      {RUTA.slice(1).map((b, i) => (
        <Cinta key={`r${i}`} a={RUTA[i]} b={b} ancho={5} y={0.3} color="#e07a5f" opacity={0.35} />
      ))}
      {recorrido.slice(1).map((b, i) => (
        <Cinta key={`t${i}`} a={recorrido[i]} b={b} ancho={5} y={0.35} color="#e07a5f" />
      ))}
    </group>
  );
};

const Marcador: FC<{ x: number; z: number; color: string }> = ({ x, z, color }) => (
  <group position={[x, 0.4, z]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[7, 32]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <circleGeometry args={[5, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  </group>
);

const Ciudad: FC<{ altura: number }> = ({ altura }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1400, 1400]} />
      <meshLambertMaterial color="#efeae2" />
    </mesh>
    {/* agua al sureste */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[330, 0.05, 260]}>
      <circleGeometry args={[150, 48]} />
      <meshLambertMaterial color="#bcd9ee" />
    </mesh>
    {/* parques */}
    {[...PARQUES].map((k) => {
      const [i, j] = k.split(',').map(Number);
      return (
        <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[i * PASO + PASO / 2, 0.08, j * PASO + PASO / 2]}>
          <planeGeometry args={[PASO - CALLE, PASO - CALLE]} />
          <meshLambertMaterial color="#cfe5c4" />
        </mesh>
      );
    })}
    {/* calles */}
    {CALLES.map((c) => (
      <group key={c}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[c, 0.12, 0]}>
          <planeGeometry args={[CALLE, 1400]} />
          <meshLambertMaterial color="#ffffff" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, c]}>
          <planeGeometry args={[1400, CALLE]} />
          <meshLambertMaterial color="#ffffff" />
        </mesh>
      </group>
    ))}
    {/* edificios extruidos */}
    {altura > 0.001 &&
      EDIFICIOS.map((e, n) => {
        const h = Math.max(0.1, e.h * altura);
        return (
          <mesh key={n} position={[e.x, h / 2, e.z]} castShadow receiveShadow>
            <boxGeometry args={[e.w, h, e.d]} />
            <meshLambertMaterial color="#d9d4cb" />
          </mesh>
        );
      })}
  </group>
);

// ---------------------------------------------------------------- moto

/** Entorno de estudio de uvgoMoto.js (createEnvironment) para los reflejos de la pintura. */
const Entorno: FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const env = new THREE.Scene();
    const geo = new THREE.SphereGeometry(50, 48, 24);
    const pos = geo.attributes.position;
    const cols: number[] = [];
    const top = new THREE.Color('#FFFFFF');
    const mid = new THREE.Color('#C9D6CE');
    const low = new THREE.Color('#4A544E');
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i) / 50;
      const c = t > 0 ? mid.clone().lerp(top, Math.min(1, t * 1.6)) : mid.clone().lerp(low, Math.min(1, -t * 2.5));
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    env.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(env, 0.03).texture;
    pm.dispose();
    scene.environment = tex;
    return () => tex.dispose();
  }, [gl, scene]);
  return null;
};

const MOTO_LARGO = 18;

/**
 * Carga public/uvgo/moto.glb fuera del lienzo 3D (con delayRender de Remotion) y lo deja listo:
 * escalado a MOTO_LARGO y apoyado en el suelo. Devuelve el modelo o el error.
 */
export const useModeloMoto = () => {
  const [estado, setEstado] = useState<{ modelo: THREE.Object3D | null; error: string | null }>({ modelo: null, error: null });
  const [handle] = useState(() => delayRender('Cargando moto.glb'));
  useEffect(() => {
    new GLTFLoader().load(
      staticFile('uvgo/moto.glb'),
      (gltf) => {
        const obj = gltf.scene;
        obj.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) o.castShadow = true;
        });
        obj.updateMatrixWorld(true);
        const caja = new THREE.Box3().setFromObject(obj);
        const size = caja.getSize(new THREE.Vector3());
        const centro = caja.getCenter(new THREE.Vector3());
        const s = MOTO_LARGO / Math.max(size.x, size.z);
        const envoltura = new THREE.Group();
        obj.position.set(-centro.x, -caja.min.y, -centro.z);
        envoltura.add(obj);
        envoltura.scale.setScalar(s);
        setEstado({ modelo: envoltura, error: null });
        continueRender(handle);
      },
      undefined,
      (err) => {
        setEstado({ modelo: null, error: String(err) });
        continueRender(handle);
      }
    );
  }, [handle]);
  return estado;
};

const Moto: FC<{ x: number; z: number; rot: number; modelo: THREE.Object3D | null }> = ({ x, z, rot, modelo }) => (
  <group position={[x, 0.4, z]} rotation={[0, rot, 0]}>
    {modelo && <primitive object={modelo} />}
  </group>
);

// ---------------------------------------------------------------- cámara

export type Vista = { cx: number; cz: number; dist: number; pitch: number; bearing: number };

const Camara: FC<{ v: Vista }> = ({ v }) => {
  const { camera } = useThree();
  const p = THREE.MathUtils.degToRad(Math.max(0.5, v.pitch));
  const b = THREE.MathUtils.degToRad(v.bearing);
  const suelo = v.dist * Math.sin(p);
  camera.position.set(v.cx - Math.sin(b) * suelo, v.dist * Math.cos(p), v.cz + Math.cos(b) * suelo);
  // Vista cenital: el norte del rumbo queda arriba; al inclinar, el "arriba" pasa a ser el cielo
  camera.up.set(Math.sin(b) * Math.cos(p), Math.sin(p), -Math.cos(b) * Math.cos(p)).normalize();
  camera.lookAt(v.cx, 0, v.cz);
  camera.updateProjectionMatrix();
  return null;
};

export const Mapa3D: FC<{ width: number; height: number; vista: Vista; progreso: number; altura: number; modelo: THREE.Object3D | null }> = ({ width, height, vista, progreso, altura, modelo }) => {
  const moto = enRuta(progreso);
  const fin = RUTA[RUTA.length - 1];
  const sombra = useMemo(() => ({ size: 2048 }), []);
  return (
    <ThreeCanvas width={width} height={height} dpr={2} camera={{ fov: 36, near: 1, far: 3000 }} shadows gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
      <color attach="background" args={['#eef0ec']} />
      <fog attach="fog" args={['#eef0ec', 520, 1500]} />
      <Entorno />
      <Camara v={vista} />
      <hemisphereLight args={['#ffffff', '#c9c2b6', 1.25]} />
      <directionalLight
        position={[-220, 380, 260]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[sombra.size, sombra.size]}
        shadow-camera-left={-360}
        shadow-camera-right={360}
        shadow-camera-top={360}
        shadow-camera-bottom={-360}
        shadow-camera-far={1200}
        shadow-bias={-0.0005}
      />
      <Ciudad altura={altura} />
      <Ruta progreso={progreso} />
      <Marcador x={RUTA[0][0]} z={RUTA[0][1]} color="#1d411b" />
      <Marcador x={fin[0]} z={fin[1]} color="#e07a5f" />
      <Moto x={moto.x} z={moto.z} rot={moto.rot} modelo={modelo} />
    </ThreeCanvas>
  );
};
