import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

const Interactive3D = ({ className = '' }) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const frameRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(120, 120)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Create floating geometric shapes
    const geometry1 = new THREE.IcosahedronGeometry(0.8, 0)
    const geometry2 = new THREE.OctahedronGeometry(0.6, 0)
    const geometry3 = new THREE.TetrahedronGeometry(0.5, 0)

    const material1 = new THREE.MeshPhongMaterial({ 
      color: 0x0077B5, 
      transparent: true, 
      opacity: 0.7,
      wireframe: false
    })
    const material2 = new THREE.MeshPhongMaterial({ 
      color: 0x00A0DC, 
      transparent: true, 
      opacity: 0.6,
      wireframe: true
    })
    const material3 = new THREE.MeshPhongMaterial({ 
      color: 0x40E0D0, 
      transparent: true, 
      opacity: 0.5,
      wireframe: false
    })

    const mesh1 = new THREE.Mesh(geometry1, material1)
    const mesh2 = new THREE.Mesh(geometry2, material2)
    const mesh3 = new THREE.Mesh(geometry3, material3)

    mesh1.position.set(0, 0, 0)
    mesh2.position.set(0.5, 0.3, 0.2)
    mesh3.position.set(-0.3, -0.2, 0.1)

    scene.add(mesh1)
    scene.add(mesh2)
    scene.add(mesh3)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    
    scene.add(ambientLight)
    scene.add(directionalLight)

    camera.position.z = 3

    sceneRef.current = { scene, camera, renderer, meshes: [mesh1, mesh2, mesh3] }
    rendererRef.current = renderer

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      
      if (sceneRef.current) {
        const { meshes } = sceneRef.current
        const speed = isHovered ? 0.02 : 0.01
        
        meshes[0].rotation.x += speed
        meshes[0].rotation.y += speed * 0.7
        
        meshes[1].rotation.x -= speed * 0.8
        meshes[1].rotation.z += speed * 1.2
        
        meshes[2].rotation.y += speed * 1.5
        meshes[2].rotation.z -= speed * 0.9
        
        // Floating animation
        const time = Date.now() * 0.001
        meshes[0].position.y = Math.sin(time) * 0.1
        meshes[1].position.y = Math.sin(time + 1) * 0.15
        meshes[2].position.y = Math.sin(time + 2) * 0.12
        
        renderer.render(scene, camera)
      }
    }
    
    animate()

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [isHovered])

  return (
    <div 
      ref={mountRef} 
      className={`interactive-3d ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        width: '120px', 
        height: '120px',
        cursor: 'pointer',
        transition: 'transform 0.3s ease'
      }}
    />
  )
}

export default Interactive3D