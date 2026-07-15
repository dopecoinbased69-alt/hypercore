// ===== HYPERCORE · three-template.js =====
// Default THREE.js template code (used as starter buffer)

        const DEFAULT_THREE_CODE = `<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
    <style>
        body { margin: 0; overflow: hidden; background: #000000; }
        canvas { width: 100%; height: 100% }
    </style>
</head>
<body>
    <script>
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0x0047AB, wireframe: true });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pLight = new THREE.PointLight(0xffffff, 1);
        pLight.position.set(5, 5, 5);
        scene.add(pLight);

        camera.position.z = 4;
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        function animate() {
            requestAnimationFrame(animate);
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();
    <\/script>
</body>
</html>`;
