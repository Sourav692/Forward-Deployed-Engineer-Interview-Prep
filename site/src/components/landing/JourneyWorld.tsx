'use client'

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import styles from './landing.module.css'

const COMPONENTS = [
  { name: 'Identity', detail: 'Check who is asking and which sources they are allowed to use.', position: [-2.1, 0, 0] },
  { name: 'Retrieval', detail: 'Find relevant information inside that user’s permission boundary.', position: [0, 0, -1.65] },
  { name: 'Model', detail: 'Use the retrieved context to produce an answer with evidence.', position: [2.1, 0, 0] },
  { name: 'Evaluation', detail: 'Check correctness, access control, and failure cases before release.', position: [0, 0, 1.65] },
] as const

type Palette = ReturnType<typeof usePalette>
type WorldProps = {
  progress: RefObject<number>
  onInvalidate: (render: (() => void) | null) => void
  onReady: () => void
  onUnavailable: () => void
}

function usePalette() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const update = () => setDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return {
    base: dark ? '#302c40' : '#f1edf9',
    surface: dark ? '#514760' : '#ffffff',
    accent: dark ? '#b8a0f2' : '#7954c9',
    muted: dark ? '#8b809d' : '#c3b6d6',
    text: dark ? '#f4eefb' : '#3a2c4f',
    ink: dark ? '#252031' : '#f1edf9',
  }
}

function Box({ position, size, color, ...props }: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  castShadow?: boolean
  receiveShadow?: boolean
}) {
  return <mesh position={position} {...props}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
}

/** Locally drawn labels keep the scene independent of fonts, models, and image hosts. */
function Label({ text, position, color, width = 1.8, fontSize = 46 }: { text: string; position: [number, number, number]; color: string; width?: number; fontSize?: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const context = canvas.getContext('2d')!
    context.fillStyle = color
    context.font = `600 ${fontSize}px system-ui, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, 256, 64)
    const result = new CanvasTexture(canvas)
    result.colorSpace = SRGBColorSpace
    return result
  }, [text, color, fontSize])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, width / 4]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Platform({ palette, title }: { palette: Palette; title: string }) {
  return (
    <group>
      <Box position={[0, 0, 0]} size={[8.4, 0.32, 6.4]} color={palette.base} receiveShadow />
      <Box position={[0, -0.2, 0]} size={[8.2, 0.12, 6.2]} color={palette.muted} />
      <Label text={title} position={[0, 0.17, 2.65]} color={palette.text} width={4.4} />
      {[-3, -2, -1, 0, 1, 2, 3].map((x) => <Box key={x} position={[x, 0.165, 0]} size={[0.012, 0.005, 4.8]} color={palette.muted} />)}
      {[-2, -1, 0, 1, 2].map((z) => <Box key={z} position={[0, 0.165, z]} size={[7.2, 0.005, 0.012]} color={palette.muted} />)}
    </group>
  )
}

function Person({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow><coneGeometry args={[0.25, 0.65, 12]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
      <mesh position={[0, 1.05, 0]} castShadow><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
    </group>
  )
}

function Discovery({ palette }: { palette: Palette }) {
  return (
    <group>
      <Platform palette={palette} title="01 / DISCOVERY" />
      <Box position={[0, 1.1, 0]} size={[3.6, 0.18, 2.1]} color={palette.accent} castShadow receiveShadow />
      {[-1.4, 1.4].flatMap((x) => [-0.7, 0.7].map((z) => <Box key={`${x}:${z}`} position={[x, 0.6, z]} size={[0.12, 0.9, 0.12]} color={palette.muted} castShadow />))}
      {[[-0.8, -0.35], [0, 0.35], [0.8, -0.2]].map(([x, z], index) => (
        <group key={index} position={[x, 1.205, z]} rotation={[0, index * 0.18 - 0.15, 0]}>
          <Box position={[0, 0, 0]} size={[0.72, 0.018, 0.55]} color={palette.surface} />
          {[-0.12, 0, 0.12].map((line) => <Box key={line} position={[0, 0.012, line]} size={[0.45, 0.006, 0.024]} color={palette.accent} />)}
        </group>
      ))}
      <Box position={[-1.5, 1.8, -2.1]} size={[2.5, 1.7, 0.12]} color={palette.surface} castShadow />
      <Box position={[-2.4, 0.7, -2.1]} size={[0.09, 1.1, 0.09]} color={palette.muted} />
      <Box position={[-0.6, 0.7, -2.1]} size={[0.09, 1.1, 0.09]} color={palette.muted} />
      {[-0.45, 0, 0.45].map((y) => <Box key={y} position={[-1.5, 1.8 + y, -2.02]} size={[1.8, 0.1, 0.025]} color={palette.accent} />)}
      <Person position={[-2.25, 0.17, 0.25]} color={palette.accent} />
      <Person position={[0.4, 0.17, 1.6]} color={palette.muted} />
      <Person position={[2.35, 0.17, -0.5]} color={palette.accent} />
    </group>
  )
}

function Connection({ start, end, color }: { start: readonly number[]; end: readonly number[]; color: string }) {
  const dx = end[0] - start[0]
  const dz = end[2] - start[2]
  return (
    <mesh position={[(start[0] + end[0]) / 2, 0.25, (start[2] + end[2]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
      <boxGeometry args={[Math.hypot(dx, dz), 0.04, 0.06]} /><meshStandardMaterial color={color} />
    </mesh>
  )
}

function Architecture({ palette, selected, onSelect }: { palette: Palette; selected: number | null; onSelect: (index: number) => void }) {
  return (
    <group position={[12, 0, 0]}>
      <Platform palette={palette} title="02 / ARCHITECTURE" />
      {COMPONENTS.map((component, index) => (
        <Connection key={component.name} start={component.position} end={COMPONENTS[(index + 1) % COMPONENTS.length].position} color={palette.accent} />
      ))}
      {COMPONENTS.map((component, index) => (
        <group key={component.name} position={[...component.position]} scale={selected === index ? 1.07 : 1}>
          <mesh
            position={[0, 0.75, 0]}
            castShadow receiveShadow
            onPointerOver={(event) => { event.stopPropagation(); onSelect(index) }}
            onClick={(event) => { event.stopPropagation(); onSelect(index) }}
          >
            <boxGeometry args={[1.25, 1.1, 1]} />
            <meshStandardMaterial color={selected === index || index === 2 ? palette.accent : palette.surface} roughness={0.65} />
          </mesh>
          <Label text={component.name} position={[0, 1.315, 0]} color={selected === index || index === 2 ? palette.ink : palette.text} width={1.6} fontSize={64} />
          {[0, 1, 2].map((line) => <Box key={line} position={[0, 0.5 + line * 0.2, 0.51]} size={[0.6, 0.05, 0.02]} color={palette.muted} />)}
        </group>
      ))}
    </group>
  )
}

function Camera({ progress, onReady }: Pick<WorldProps, 'progress' | 'onReady'>) {
  const started = useRef(false)
  useFrame(({ camera, gl }) => {
    const p = Math.max(0, Math.min(1, progress.current))
    const travel = 12 * p * p * (3 - 2 * p)
    camera.position.set(travel + 7.8, 7.8 + Math.sin(p * Math.PI) * 1.2, 10.5 - p * 1.5)
    camera.lookAt(travel, 0.45, 0)
    gl.domElement.dataset.cameraX = camera.position.x.toFixed(3)
    gl.domElement.dataset.rendered = 'true'
    if (!started.current) { started.current = true; onReady() }
  })
  return null
}

function ContextEvents({ onInvalidate, onUnavailable }: Pick<WorldProps, 'onInvalidate' | 'onUnavailable'>) {
  const { gl, invalidate } = useThree()
  useEffect(() => {
    onInvalidate(invalidate)
    const handleLost = (event: Event) => { event.preventDefault(); onUnavailable() }
    gl.domElement.addEventListener('webglcontextlost', handleLost)
    return () => {
      onInvalidate(null)
      gl.domElement.removeEventListener('webglcontextlost', handleLost)
    }
  }, [gl, invalidate, onInvalidate, onUnavailable])
  return null
}

export default function JourneyWorld({ progress, onInvalidate, onReady, onUnavailable }: WorldProps) {
  const palette = usePalette()
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <div className={styles.worldStage} data-testid="journey-world">
      <div className={styles.worldCanvas} aria-hidden="true">
        <Canvas
          frameloop="demand" dpr={[1, 1.5]} shadows="soft"
          camera={{ position: [7.8, 7.8, 10.5], fov: 36, near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          fallback="Explore the static journey."
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 12, 6]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={22} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.001} />
          <directionalLight position={[-5, 4, -5]} intensity={0.6} color="#c4b4ed" />
          <Camera progress={progress} onReady={onReady} />
          <ContextEvents onInvalidate={onInvalidate} onUnavailable={onUnavailable} />
          <Discovery palette={palette} />
          <Architecture palette={palette} selected={selected} onSelect={setSelected} />
          {Array.from({ length: 7 }, (_, i) => <Box key={i} position={[4.5 + i * 0.5, -0.02, 0]} size={[0.28, 0.06, 0.16]} color={palette.accent} />)}
        </Canvas>
      </div>
      <div className={styles.worldInspector}>
        <div role="group" aria-label="Explore architecture components" className={styles.componentButtons}>
          {COMPONENTS.map((component, index) => (
            <button key={component.name} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} onFocus={() => setSelected(index)}>{component.name}</button>
          ))}
        </div>
        <p className="mt-2 min-h-10 text-xs leading-relaxed text-muted" aria-live="polite">
          {selected === null ? 'Hover over a block, or choose a component to see its role.' : COMPONENTS[selected].detail}
        </p>
      </div>
    </div>
  )
}
