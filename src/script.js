import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from '/shader/vertex.glsl'
import testFragmentShader from '/shader/fragment.glsl'

/**
 * Base
*/

// Cursor
const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

// Debug
const gui = new dat.GUI({ width: 200 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

let dpr = window.devicePixelRatio

canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr
canvas.style.maxWidth = window.innerWidth + "px"
canvas.style.maxHeight = window.innerHeight + "px"

const cw = canvas.width
const ch = canvas.height
const cw2 = cw/2
const ch2 = ch/2

let time = 0


 /**
 * Textures
 */
const manager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(manager)

const texture = textureLoader.load('/textures/paint.jpeg')

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1.5, 1.5, 512, 512)

// Color
debugObject.depthColor = "#a20101"
debugObject.surfaceColor = "#d8db00"

// Material
const material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    // wireframe: true,
    uniforms: {
        uTime: { value: 0 },
        rez: { value: [cw, ch] },
        mouse: { value: cursor },
        texture: { value: texture },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5 },
    },
    side: THREE.DoubleSide
})


/**
 * GUI
 */
gui.addColor(debugObject, 'depthColor').onChange(() => {
    material.uniforms.uDepthColor.value.set(debugObject.depthColor)
})
gui.addColor(debugObject, 'surfaceColor').onChange(() => {
    material.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
})


gui.add(material.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(material.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(material.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(material.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')


gui.add(material.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(material.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(material.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(material.uniforms.uSmallWavesIterations, 'value').min(0).max(5).step(1).name('uSmallWavesIterations')


gui.add(material.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(material.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')


// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 5)
camera.position.set(-0.75, -0.25, 1.5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()
const tick = () =>
{
    // Update controls
    controls.update()
    let elapsedTime = clock.getElapsedTime()

    
    material.uniforms.uTime.value = elapsedTime
    material.uniforms.mouse.value = cursor

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()