/**
 * Interactive 3D Holo-Viewer Container
 * Supports standard <model-viewer> tags, Three.js WebGL rendering with interactive
 * 360-degree orbital rotation, particle systems, wireframes, and animated hero cores.
 */

class HeroViewer3D {
  constructor(containerElement) {
    this.container = containerElement;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.meshGroup = null;
    this.particles = null;
    this.animationFrameId = null;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = true;
    this.isWireframe = true;
    this.currentCharacter = null;
    this.rotationSpeed = 0.005;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';

    // Create Canvas for Three.js / WebGL
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'holo-canvas';
    this.container.appendChild(this.canvas);

    // Setup Three.js if available globally, otherwise setup lightweight native 3D WebGL/Canvas
    if (typeof THREE !== 'undefined') {
      this.initThreeJS();
    } else {
      this.initFallback3D();
    }

    this.attachControls();
  }

  initThreeJS() {
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 450;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 18;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xe23636, 2.5, 50);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);

    this.meshGroup = new THREE.Group();
    this.scene.add(this.meshGroup);

    this.animateThreeJS();
  }

  animateThreeJS() {
    this.animationFrameId = requestAnimationFrame(() => this.animateThreeJS());

    if (this.meshGroup) {
      if (this.autoRotate && !this.isDragging) {
        this.meshGroup.rotation.y += this.rotationSpeed;
      }
      // Gentle floating oscillation
      this.meshGroup.position.y = Math.sin(Date.now() * 0.002) * 0.3;
    }

    if (this.particles) {
      this.particles.rotation.y -= 0.002;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  loadCharacterModel(character) {
    this.currentCharacter = character;
    const modelConfig = character.modelConfig || {};
    const themeColorHex = modelConfig.themeColor || '#e23636';
    const wireframeColorHex = modelConfig.wireframeColor || '#00f0ff';
    const accentColorHex = modelConfig.accentColor || '#ffd700';

    // Check if external GLB/GLTF model is provided
    if (modelConfig.glbModelUrl && typeof customElements !== 'undefined') {
      this.container.innerHTML = `
        <model-viewer 
          src="${modelConfig.glbModelUrl}" 
          alt="${character.alias} 3D Model"
          auto-rotate
          camera-controls
          shadow-intensity="1"
          exposure="1.2"
          ar>
        </model-viewer>
      `;
      return;
    }

    // If using Three.js:
    if (this.scene && this.meshGroup && typeof THREE !== 'undefined') {
      // Clear previous meshes
      while (this.meshGroup.children.length > 0) {
        const obj = this.meshGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
        this.meshGroup.remove(obj);
      }

      const primaryColor = new THREE.Color(themeColorHex);
      const wireColor = new THREE.Color(wireframeColorHex);
      const accentColor = new THREE.Color(accentColorHex);

      // Build specialized Hero Holographic Core
      const heroSymbol = modelConfig.symbol || 'CORE';

      if (heroSymbol === 'ARC_REACTOR') {
        // Iron Man - Concentric Arc Reactor Rings & Glowing Core
        const coreGeo = new THREE.CylinderGeometry(2, 2, 0.6, 32);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0x111111,
          metalness: 0.9,
          roughness: 0.1
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.rotation.x = Math.PI / 2;
        this.meshGroup.add(core);

        const ringGeo = new THREE.TorusGeometry(3.5, 0.3, 16, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: accentColor,
          wireframe: this.isWireframe,
          emissive: accentColor,
          emissiveIntensity: 0.6
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        this.meshGroup.add(ring);

        const outerTorusGeo = new THREE.TorusGeometry(5, 0.2, 16, 64);
        const outerMat = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true });
        const outerRing = new THREE.Mesh(outerTorusGeo, outerMat);
        this.meshGroup.add(outerRing);

      } else if (heroSymbol === 'SPIDER') {
        // Spider-Man - Dodecahedron Geodesic Web Orb
        const sphereGeo = new THREE.IcosahedronGeometry(4.5, 2);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: primaryColor,
          wireframe: this.isWireframe,
          emissive: primaryColor,
          emissiveIntensity: 0.4
        });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        this.meshGroup.add(mesh);

        const innerGeo = new THREE.OctahedronGeometry(2.5, 1);
        const innerMat = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        this.meshGroup.add(inner);

      } else if (heroSymbol === 'CLAWS') {
        // Wolverine - Adamantium Triple Blade Prism Structure
        const clawGroup = new THREE.Group();
        for (let i = -1; i <= 1; i++) {
          const bladeGeo = new THREE.ConeGeometry(0.5, 8, 4);
          const bladeMat = new THREE.MeshStandardMaterial({
            color: 0xd1d5db,
            metalness: 0.95,
            roughness: 0.1,
            wireframe: this.isWireframe
          });
          const blade = new THREE.Mesh(bladeGeo, bladeMat);
          blade.position.x = i * 2.2;
          blade.rotation.z = -i * 0.12;
          clawGroup.add(blade);
        }
        this.meshGroup.add(clawGroup);

      } else if (heroSymbol === 'LIGHTNING') {
        // Storm - Atmospheric Torus Vortex with Gyro Rings
        const vortexGeo = new THREE.TorusKnotGeometry(3.5, 0.9, 100, 16);
        const vortexMat = new THREE.MeshStandardMaterial({
          color: wireColor,
          wireframe: this.isWireframe,
          emissive: wireColor,
          emissiveIntensity: 0.6
        });
        const vortex = new THREE.Mesh(vortexGeo, vortexMat);
        this.meshGroup.add(vortex);

      } else if (heroSymbol === 'EYE_OF_AGAMOTTO') {
        // Doctor Strange - Mystic Mandala Polyhedron
        const mandalaGeo = new THREE.DodecahedronGeometry(4.2, 1);
        const mandalaMat = new THREE.MeshStandardMaterial({
          color: accentColor,
          wireframe: this.isWireframe,
          emissive: accentColor,
          emissiveIntensity: 0.5
        });
        const mandala = new THREE.Mesh(mandalaGeo, mandalaMat);
        this.meshGroup.add(mandala);

        const eyeRings = new THREE.TorusGeometry(5.2, 0.15, 16, 64);
        const eyeMat = new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true });
        const eye = new THREE.Mesh(eyeRings, eyeMat);
        eye.rotation.x = Math.PI / 4;
        this.meshGroup.add(eye);

      } else {
        // Thanos / Cosmic - Hexagonal Cosmic Cube / Infinity Prism
        const boxGeo = new THREE.BoxGeometry(5, 5, 5);
        const boxMat = new THREE.MeshStandardMaterial({
          color: primaryColor,
          wireframe: this.isWireframe,
          emissive: primaryColor,
          emissiveIntensity: 0.5
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        this.meshGroup.add(box);

        const gemGeo = new THREE.OctahedronGeometry(3, 0);
        const gemMat = new THREE.MeshBasicMaterial({ color: accentColor, wireframe: true });
        const gem = new THREE.Mesh(gemGeo, gemMat);
        this.meshGroup.add(gem);
      }

      // Add Ambient Particle Cloud
      this.createParticles(themeColorHex);

      // Reset orientation
      this.meshGroup.rotation.set(0.3, 0, 0);
    } else {
      this.drawFallbackFrame();
    }
  }

  createParticles(colorHex) {
    if (this.particles) {
      this.scene.remove(this.particles);
      if (this.particles.geometry) this.particles.geometry.dispose();
      if (this.particles.material) this.particles.material.dispose();
    }

    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 22;
      positions[i + 1] = (Math.random() - 0.5) * 22;
      positions[i + 2] = (Math.random() - 0.5) * 22;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(colorHex),
      size: 0.25,
      transparent: true,
      opacity: 0.7
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  attachControls() {
    let isDown = false;
    let startX = 0;
    let startY = 0;

    const onMouseDown = (e) => {
      isDown = true;
      this.isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      if (this.meshGroup) {
        this.meshGroup.rotation.y += deltaX * 0.01;
        this.meshGroup.rotation.x += deltaY * 0.01;
      }

      startX = clientX;
      startY = clientY;
    };

    const onMouseUp = () => {
      isDown = false;
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    this.canvas.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Zoom on wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.camera) {
        this.camera.position.z += e.deltaY * 0.02;
        this.camera.position.z = Math.max(8, Math.min(30, this.camera.position.z));
      }
    }, { passive: false });

    // Window resize
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    if (this.currentCharacter) {
      this.loadCharacterModel(this.currentCharacter);
    }
    return this.isWireframe;
  }

  resetOrientation() {
    if (this.meshGroup) {
      this.meshGroup.rotation.set(0.3, 0, 0);
      if (this.camera) this.camera.position.z = 18;
    }
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  }

  initFallback3D() {
    // Elegant Canvas 2.5D wireframe fallback if WebGL or Three is disabled
    const ctx = this.canvas.getContext('2d');
    let angle = 0;

    const render = () => {
      const w = this.canvas.width = this.container.clientWidth || 380;
      const h = this.canvas.height = this.container.clientHeight || 420;
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Rotating Hologram Rings
      const themeColor = this.currentCharacter?.modelConfig?.themeColor || '#e23636';
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 2;

      for (let r = 50; r <= 140; r += 30) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.45, angle + (r * 0.02), 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = themeColor;
      ctx.font = '700 16px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((this.currentCharacter?.alias || 'HERO ARCHIVE').toUpperCase(), 0, 5);

      ctx.restore();
      angle += 0.02;
      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

window.HeroViewer3D = HeroViewer3D;
