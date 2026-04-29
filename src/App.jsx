import { useCallback, useEffect, useRef, useState } from "react";

const LED_FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

const LED_MESSAGES = ["HAPPY BIRTHDAY", "LINDA", "PUTRI", "RAHAYU"];
const LED_GLYPH_SPACING = 2;
const MAX_LED_COLUMNS = Math.max(...LED_MESSAGES.map(getMessageColumns));
const BACKGROUND_MUSIC_SRC = `${import.meta.env.BASE_URL}audio/about-you.mp3`;
const BOUQUET_MODEL_SRC = `${import.meta.env.BASE_URL}assets/flower_bouquet.glb`;
const FIREWORKS = [
  { id: "fw-a", left: "12%", top: "18%", size: "11rem", hue: 128, delay: "0s", duration: "4.8s" },
  { id: "fw-b", left: "26%", top: "10%", size: "9rem", hue: 188, delay: "1.3s", duration: "4.2s" },
  { id: "fw-c", left: "78%", top: "16%", size: "12rem", hue: 42, delay: "0.8s", duration: "5.2s" },
  { id: "fw-d", left: "86%", top: "34%", size: "10rem", hue: 328, delay: "2s", duration: "4.6s" },
  { id: "fw-e", left: "18%", top: "58%", size: "8.5rem", hue: 104, delay: "2.6s", duration: "4.4s" },
  { id: "fw-f", left: "74%", top: "60%", size: "10.5rem", hue: 210, delay: "3.1s", duration: "5s" },
];

function App() {
  const { currentMessage, visibleCount, phase } = useLedTypewriter(LED_MESSAGES);
  const ledDots = buildLedDots(currentMessage, visibleCount, phase);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isCandleBlown, setIsCandleBlown] = useState(false);
  const [isBouquetVisible, setIsBouquetVisible] = useState(false);
  const [closeNotice, setCloseNotice] = useState("");

  const handleEnvelopeOpen = () => {
    setIsEnvelopeOpen(true);
    setIsCandleBlown(false);
    setIsBouquetVisible(false);
    setCloseNotice("");
  };

  const handleEnvelopeClose = () => {
    if (!isCandleBlown) {
      setCloseNotice("Silakan tiup lilinnya dulu");
      return;
    }

    setIsEnvelopeOpen(false);
    setIsBouquetVisible(true);
    setCloseNotice("");
  };

  const handleBlowCandle = () => {
    setIsCandleBlown(true);
    setCloseNotice("");
  };

  useEffect(() => {
    if (!closeNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCloseNotice(""), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [closeNotice]);

  useEffect(() => {
    if (!isEnvelopeOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleEnvelopeClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCandleBlown, isEnvelopeOpen]);

  return (
    <main
      className={`scene${isEnvelopeOpen ? " scene-envelope-open" : ""}`}
      aria-label={`Kipas 3D dengan tulisan ${currentMessage}`}
    >
      <div className="scene-shell">
        <FireworksBackdrop />
        <div className="scene-vignette" aria-hidden="true" />
        <div className="scene-aura scene-aura-left" aria-hidden="true" />
        <div className="scene-aura scene-aura-right" aria-hidden="true" />
        <div className="scene-floor" aria-hidden="true" />
        <FanDisplay ledDots={ledDots} currentMessage={currentMessage} />
      </div>

      <EnvelopeFeature
        isOpen={isEnvelopeOpen}
        isCandleBlown={isCandleBlown}
        closeNotice={closeNotice}
        onOpen={handleEnvelopeOpen}
        onClose={handleEnvelopeClose}
        onBlowCandle={handleBlowCandle}
      />
      <BouquetReveal isVisible={isBouquetVisible && !isEnvelopeOpen} />
      <BackgroundMusic />
    </main>
  );
}

function BackgroundMusic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudioError, setHasAudioError] = useState(false);
  const [shouldShowFallback, setShouldShowFallback] = useState(false);

  const startMusic = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || hasAudioError) {
      return;
    }

    audio.volume = 0.54;

    try {
      await audio.play();
      setIsPlaying(true);
      setShouldShowFallback(false);
    } catch {
      setIsPlaying(false);
      setShouldShowFallback(true);
    }
  }, [hasAudioError]);

  const handleStartMusic = () => {
    const audio = audioRef.current;

    if (!audio || hasAudioError) {
      return;
    }

    void startMusic();
  };

  useEffect(() => {
    void startMusic();
  }, [startMusic]);

  useEffect(() => {
    if (isPlaying) {
      return undefined;
    }

    const handleFirstInteraction = () => {
      void startMusic();
    };

    const pointerOptions = { once: true, passive: true };
    const keyOptions = { once: true };

    window.addEventListener("pointerdown", handleFirstInteraction, pointerOptions);
    window.addEventListener("touchstart", handleFirstInteraction, pointerOptions);
    window.addEventListener("keydown", handleFirstInteraction, keyOptions);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction, pointerOptions);
      window.removeEventListener("touchstart", handleFirstInteraction, pointerOptions);
      window.removeEventListener("keydown", handleFirstInteraction, keyOptions);
    };
  }, [isPlaying, startMusic]);

  return (
    <div className="background-music">
      <audio
        ref={audioRef}
        src={BACKGROUND_MUSIC_SRC}
        loop
        preload="auto"
        autoPlay
        playsInline
        onPlay={() => {
          setIsPlaying(true);
          setShouldShowFallback(false);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setHasAudioError(true);
          setIsPlaying(false);
          setShouldShowFallback(true);
        }}
      />
      {shouldShowFallback || hasAudioError ? (
        <button
          type="button"
          className="music-control is-visible"
          onClick={handleStartMusic}
          aria-label={hasAudioError ? "Audio gagal dimuat" : "Mulai musik"}
          disabled={hasAudioError}
        >
          <span className="music-control-icon" aria-hidden="true">
            {hasAudioError ? "!" : ">"}
          </span>
          <span>{hasAudioError ? "Audio gagal" : "Mulai musik"}</span>
        </button>
      ) : null}
    </div>
  );
}

function BouquetReveal({ isVisible }) {
  return (
    <div
      className={`bouquet-reveal${isVisible ? " is-visible" : ""}`}
      role="img"
      aria-label="Seikat bunga ulang tahun"
      aria-hidden={!isVisible}
    >
      <div className="bouquet-glow" aria-hidden="true" />
      <div className="bouquet-bundle" aria-hidden="true">
        <BouquetModelCanvas isVisible={isVisible} modelSrc={BOUQUET_MODEL_SRC} />
        <span className="bouquet-petal bouquet-petal-a" />
        <span className="bouquet-petal bouquet-petal-b" />
        <span className="bouquet-petal bouquet-petal-c" />
        <span className="bouquet-petal bouquet-petal-d" />
        <span className="bouquet-sparkle bouquet-sparkle-a" />
        <span className="bouquet-sparkle bouquet-sparkle-b" />
        <span className="bouquet-sparkle bouquet-sparkle-c" />
      </div>
    </div>
  );
}

function BouquetModelCanvas({ isVisible, modelSrc }) {
  const mountRef = useRef(null);
  const isVisibleRef = useRef(isVisible);
  const [isDragging, setIsDragging] = useState(false);
  const [modelStatus, setModelStatus] = useState("idle");

  useEffect(() => {
    isVisibleRef.current = isVisible;

    if (!isVisible) {
      setIsDragging(false);
      setModelStatus("idle");
    }
  }, [isVisible]);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount || !isVisible) {
      return undefined;
    }

    let isDisposed = false;
    let cleanupScene = () => {};

    setModelStatus("loading");

    const setupScene = async () => {
      const [THREE, { OrbitControls }, { GLTFLoader }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/controls/OrbitControls.js"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
      ]);

      if (isDisposed || !mountRef.current) {
        return;
      }

      const activeMount = mountRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: import.meta.env.DEV,
      });
      const clock = new THREE.Clock();
      let frameId = 0;
      let mixer = null;
      const interaction = { active: false, resumeAt: 0 };
      const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      activeMount.dataset.model = "loading";
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.domElement.className = "bouquet-model-canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      activeMount.appendChild(renderer.domElement);

      const hemisphereLight = new THREE.HemisphereLight(0xfffbf0, 0x3f4b69, 2.3);
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      const rimLight = new THREE.DirectionalLight(0xff8eb0, 1.45);
      const fillLight = new THREE.DirectionalLight(0xa7e7ff, 1.1);

      keyLight.position.set(-2.5, 4, 3.5);
      rimLight.position.set(3, 2.4, -2.5);
      fillLight.position.set(0.6, 1.8, 4);
      scene.add(hemisphereLight, keyLight, rimLight, fillLight);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.35, 64),
        new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
        }),
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -0.015;
      scene.add(shadow);

      const bouquetRoot = new THREE.Group();
      bouquetRoot.rotation.y = -0.22;
      scene.add(bouquetRoot);

      const placeholderBouquet = createFallbackBouquet(THREE);
      placeholderBouquet.visible = false;
      bouquetRoot.add(placeholderBouquet);
      normalizeObjectToHeight(THREE, placeholderBouquet, 3.1);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.rotateSpeed = 0.72;
      controls.autoRotateSpeed = -4.0;
      controls.minPolarAngle = Math.PI * 0.08;
      controls.maxPolarAngle = Math.PI * 0.92;
      frameObject(THREE, placeholderBouquet, camera, controls);

      controls.addEventListener("start", () => {
        interaction.active = true;
        controls.autoRotate = false;

        if (!isDisposed) {
          setIsDragging(true);
        }
      });
      controls.addEventListener("end", () => {
        interaction.active = false;
        interaction.resumeAt = performance.now() + 1200;

        if (!isDisposed) {
          setIsDragging(false);
        }
      });

      const resizeRenderer = () => {
        const nextWidth = Math.max(1, Math.floor(activeMount.clientWidth));
        const nextHeight = Math.max(1, Math.floor(activeMount.clientHeight));

        renderer.setSize(nextWidth, nextHeight, false);
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
      };

      const resizeObserver = new ResizeObserver(resizeRenderer);
      resizeObserver.observe(activeMount);
      resizeRenderer();

      const loader = new GLTFLoader();
      loader.load(
        modelSrc,
        (gltf) => {
          if (isDisposed) {
            return;
          }

          bouquetRoot.remove(placeholderBouquet);
          disposeThreeObject(placeholderBouquet);
          const customBouquet = gltf.scene;
          bouquetRoot.add(customBouquet);
          normalizeObjectToHeight(THREE, customBouquet, 3.25);
          frameObject(THREE, customBouquet, camera, controls);
          activeMount.dataset.model = "custom";
          setModelStatus("custom");

          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(customBouquet);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
          }
        },
        undefined,
        () => {
          placeholderBouquet.visible = true;
          activeMount.dataset.model = "fallback";
          setModelStatus("fallback");
          frameObject(THREE, placeholderBouquet, camera, controls);
        },
      );

      const animate = (timestamp = 0) => {
        if (isDisposed) {
          return;
        }

        const shouldAutoRotate =
          isVisibleRef.current &&
          !interaction.active &&
          timestamp > interaction.resumeAt &&
          !reducedMotionQuery.matches;

        controls.autoRotate = shouldAutoRotate;
        const delta = clock.getDelta();

        if (mixer && isVisibleRef.current) {
          mixer.update(delta);
        }

        controls.update();
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };

      frameId = window.requestAnimationFrame(animate);

      cleanupScene = () => {
        isDisposed = true;
        window.cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        controls.dispose();
        mixer?.stopAllAction();
        disposeThreeObject(scene);
        renderer.renderLists.dispose();
        renderer.dispose();

        if (renderer.domElement.parentNode === activeMount) {
          activeMount.removeChild(renderer.domElement);
        }

        delete activeMount.dataset.model;
      };
    };

    void setupScene();

    return () => {
      isDisposed = true;
      cleanupScene();
    };
  }, [isVisible, modelSrc]);

  return (
    <div
      ref={mountRef}
      className={`bouquet-model-shell${isDragging ? " is-dragging" : ""}`}
    >
      {modelStatus === "loading" ? (
        <p className="bouquet-loading" role="status" aria-live="polite">
          tunggu yaa, bunga sedang disiapkan🙏🏻
        </p>
      ) : null}
    </div>
  );
}

function createFallbackBouquet(THREE) {
  const bouquet = new THREE.Group();
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x3e8d5b, roughness: 0.58 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x58ad68, roughness: 0.64 });
  const wrapMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd9e3,
    roughness: 0.78,
    side: THREE.DoubleSide,
  });
  const wrapAccentMaterial = new THREE.MeshStandardMaterial({
    color: 0xff95b2,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  const tieMaterial = new THREE.MeshStandardMaterial({ color: 0xd84f7f, roughness: 0.48 });
  const stemBase = new THREE.Vector3(0, 0.46, 0);
  const bloomSpecs = [
    { position: new THREE.Vector3(-0.48, 2.32, 0), color: 0xff6f9f, scale: 1 },
    { position: new THREE.Vector3(0.02, 2.54, 0.08), color: 0xffd166, scale: 1.08 },
    { position: new THREE.Vector3(0.46, 2.28, -0.02), color: 0xf15bb5, scale: 0.98 },
    { position: new THREE.Vector3(-0.16, 2.08, 0.2), color: 0x9bdeac, scale: 0.88 },
    { position: new THREE.Vector3(0.22, 2.02, -0.16), color: 0xff8fab, scale: 0.9 },
  ];

  bloomSpecs.forEach((bloom, index) => {
    const stemEnd = bloom.position.clone().add(new THREE.Vector3(0, -0.2, 0));
    const stem = createStemBetween(THREE, stemBase, stemEnd, 0.022, stemMaterial);
    bouquet.add(stem);

    if (index < 4) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 10), leafMaterial);
      leaf.scale.set(1.4, 0.38, 0.58);
      leaf.position.copy(stemBase).lerp(stemEnd, 0.52);
      leaf.rotation.set(0.35, index * 0.72, index % 2 === 0 ? -0.75 : 0.75);
      bouquet.add(leaf);
    }

    const bloomHead = createFallbackBloom(THREE, bloom.color);
    bloomHead.position.copy(bloom.position);
    bloomHead.rotation.set(-0.08, index * 0.62, 0.06);
    bloomHead.scale.multiplyScalar(bloom.scale);
    bouquet.add(bloomHead);
  });

  const wrapBack = new THREE.Mesh(new THREE.ConeGeometry(0.82, 1.5, 5, 1, true), wrapMaterial);
  wrapBack.position.set(0, 0.78, -0.06);
  wrapBack.rotation.set(Math.PI, Math.PI * 0.1, 0);
  wrapBack.scale.set(1.04, 1, 0.36);
  bouquet.add(wrapBack);

  const wrapFront = new THREE.Mesh(new THREE.ConeGeometry(0.74, 1.28, 5, 1, true), wrapAccentMaterial);
  wrapFront.position.set(0, 0.63, 0.15);
  wrapFront.rotation.set(Math.PI, -Math.PI * 0.04, 0);
  wrapFront.scale.set(0.9, 1, 0.25);
  bouquet.add(wrapFront);

  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 12, 42), tieMaterial);
  tie.position.set(0, 0.56, 0.23);
  tie.rotation.x = Math.PI / 2;
  tie.scale.set(1, 0.42, 0.24);
  bouquet.add(tie);

  return bouquet;
}

function createFallbackBloom(THREE, petalColor) {
  const bloom = new THREE.Group();
  const petalMaterial = new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.48 });
  const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xfff0a3, roughness: 0.35 });
  const petalGeometry = new THREE.SphereGeometry(0.14, 18, 12);

  Array.from({ length: 7 }).forEach((_, index) => {
    const angle = (index / 7) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);

    petal.position.set(Math.cos(angle) * 0.14, Math.sin(angle) * 0.12, 0);
    petal.rotation.z = angle;
    petal.scale.set(1.08, 0.7, 0.4);
    bloom.add(petal);
  });

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 12), centerMaterial);
  center.position.z = 0.045;
  bloom.add(center);
  bloom.scale.setScalar(1.18);

  return bloom;
}

function createStemBetween(THREE, start, end, radius, material) {
  const direction = end.clone().sub(start);
  const length = direction.length();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 10), material);

  stem.position.copy(start).add(end).multiplyScalar(0.5);
  stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

  return stem;
}

function normalizeObjectToHeight(THREE, object, targetHeight) {
  object.updateMatrixWorld(true);
  const initialBox = new THREE.Box3().setFromObject(object);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  const initialMaxAxis = Math.max(initialSize.x, initialSize.y, initialSize.z);

  if (!Number.isFinite(initialMaxAxis) || initialMaxAxis === 0) {
    return;
  }

  object.scale.multiplyScalar(targetHeight / initialMaxAxis);
  object.updateMatrixWorld(true);

  const centeredBox = new THREE.Box3().setFromObject(object);
  const center = centeredBox.getCenter(new THREE.Vector3());
  object.position.sub(center);
  object.updateMatrixWorld(true);

  const groundedBox = new THREE.Box3().setFromObject(object);
  object.position.y -= groundedBox.min.y;
  object.updateMatrixWorld(true);
}

function frameObject(THREE, object, camera, controls) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 1);
  const distance = (maxDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2))) * 1.34;

  controls.target.set(center.x, center.y + size.y * 0.06, center.z);
  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 100;
  camera.position.set(center.x + maxDimension * 0.12, center.y + size.y * 0.08, center.z + distance);
  camera.updateProjectionMatrix();
  controls.minDistance = distance * 0.72;
  controls.maxDistance = distance * 1.7;
  controls.update();
}

function disposeThreeObject(object) {
  object.traverse?.((child) => {
    child.geometry?.dispose();

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    materials.forEach((material) => {
      if (!material) {
        return;
      }

      Object.values(material).forEach((value) => {
        if (value?.isTexture) {
          value.dispose();
        }
      });

      material.dispose?.();
    });
  });
}

function FireworksBackdrop() {
  return (
    <div className="fireworks-layer" aria-hidden="true">
      {FIREWORKS.map((firework) => (
        <div
          key={firework.id}
          className="firework"
          style={{
            "--left": firework.left,
            "--top": firework.top,
            "--size": firework.size,
            "--hue": firework.hue,
            "--delay": firework.delay,
            "--duration": firework.duration,
          }}
        >
          <div className="firework-trail" />
          <div className="firework-ring" />
          <div className="firework-core" />
          <div className="firework-burst">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={`${firework.id}-spark-${index}`}
                className="firework-spark"
                style={{
                  "--rotation": `${index * 30}deg`,
                  "--spark-delay": `${(index % 4) * 0.03}s`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FanDisplay({ ledDots, currentMessage }) {
  return (
    <section
      className="fan-display"
      aria-label={`Kipas portabel dengan baling-baling berputar dan tulisan ${currentMessage}`}
    >
      <div className="depth-ring depth-ring-back" aria-hidden="true" />
      <div className="depth-ring depth-ring-front" aria-hidden="true" />

      <div className="fan-device">
        <div className="fan-head">
          <div className="head-shell head-shell-back" aria-hidden="true" />
          <div className="fan-grill fan-grill-back" aria-hidden="true" />
          <div className="fan-rim" aria-hidden="true" />
          <div className="led-haze" aria-hidden="true" />

          <div className="rotor" aria-hidden="true">
            <div className="rotor-spin rotor-spin-primary">
              <span className="blade blade-a" />
              <span className="blade blade-b" />
              <span className="blade blade-c" />
            </div>

            <div className="rotor-spin rotor-spin-secondary">
              <span className="blade blade-a" />
              <span className="blade blade-b" />
              <span className="blade blade-c" />
            </div>
          </div>

          <div className="led-display-ring" aria-hidden="true">
            <svg viewBox="0 0 240 240" className="led-svg">
              <defs>
                <filter id="led-dot-glow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="blurred" />
                  <feColorMatrix
                    in="blurred"
                    type="matrix"
                    values="0.6 0 0 0 0
                            0 1.4 0 0 0
                            0 0.25 0.08 0 0
                            0 0 0 22 -7"
                    result="glow"
                  />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g className="led-dot-glow-layer" filter="url(#led-dot-glow)">
                {ledDots.map((dot) => (
                  <circle
                    className={`led-dot led-dot-glow${dot.fresh ? " led-dot-fresh" : ""}`}
                    cx={dot.x}
                    cy={dot.y}
                    r="1.95"
                    key={`g-${dot.id}`}
                  />
                ))}
              </g>

              <g className="led-dot-core-layer">
                {ledDots.map((dot) => (
                  <circle
                    className={`led-dot led-dot-core${dot.fresh ? " led-dot-fresh-core" : ""}`}
                    cx={dot.x}
                    cy={dot.y}
                    r="1.12"
                    key={`c-${dot.id}`}
                  />
                ))}
              </g>
            </svg>
          </div>

          <div className="fan-grill fan-grill-front" aria-hidden="true" />
        </div>

        <div className="yoke yoke-left" aria-hidden="true" />
        <div className="yoke yoke-right" aria-hidden="true" />
        <div className="head-joint" aria-hidden="true" />
        <div className="neck" aria-hidden="true" />
        <div className="handle" aria-hidden="true">
          <span className="handle-shine" />
          <span className="grip-slot" />
          <span className="handle-basecap" />
        </div>
        <div className="power-button" aria-hidden="true" />
        <div className="lanyard" aria-hidden="true" />
        <div className="shadow" aria-hidden="true" />
      </div>
    </section>
  );
}

function EnvelopeFeature({ isOpen, isCandleBlown, closeNotice, onOpen, onClose, onBlowCandle }) {
  const letterPaperRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!isOpen) {
        onOpen();
      }
    }
  };

  useEffect(() => {
    const letterPaper = letterPaperRef.current;

    if (!letterPaper) {
      return undefined;
    }

    letterPaper.scrollTop = 0;

    if (!isOpen) {
      return undefined;
    }

    let frameId = 0;
    let startTime;
    const delayId = window.setTimeout(() => {
      const maxScroll = letterPaper.scrollHeight - letterPaper.clientHeight;

      if (maxScroll <= 0) {
        return;
      }

      const duration = Math.min(4200, Math.max(1800, maxScroll * 14));

      const animateScroll = (timestamp) => {
        if (startTime === undefined) {
          startTime = timestamp;
        }

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        letterPaper.scrollTop = maxScroll * easedProgress;

        if (progress < 1) {
          frameId = window.requestAnimationFrame(animateScroll);
        }
      };

      frameId = window.requestAnimationFrame(animateScroll);
    }, 1080);

    return () => {
      window.clearTimeout(delayId);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={`envelope-backdrop${isOpen ? " is-visible" : ""}`}
        aria-label="Tutup surat"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />

      <div className={`envelope-stage${isOpen ? " is-open" : ""}`}>
        <div className="envelope-arrows" aria-hidden="true">
          <div className="envelope-arrow envelope-arrow-left">
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                key={`left-arrow-${index}`}
                style={{ "--arrow-delay": `${index * 0.18}s`, "--arrow-hue": `${index * 72}deg` }}
              />
            ))}
          </div>

          <div className="envelope-arrow envelope-arrow-right">
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                key={`right-arrow-${index}`}
                style={{ "--arrow-delay": `${index * 0.18}s`, "--arrow-hue": `${index * 72 + 36}deg` }}
              />
            ))}
          </div>
        </div>

        <div
          className="envelope-card"
          role={isOpen ? "dialog" : "button"}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Surat ucapan terbuka" : "Buka amplop ucapan"}
          aria-modal={isOpen ? "true" : undefined}
          tabIndex={0}
          onClick={isOpen ? undefined : onOpen}
          onKeyDown={handleKeyDown}
        >
          <div className="envelope-outer-shadow" aria-hidden="true" />
          <div className="envelope-back-panel" aria-hidden="true" />

          <article className="letter-sheet" aria-label="Isi surat ucapan">
            <div className="letter-paper" ref={letterPaperRef}>
              <p>
                How was your day lindaa?. kulihat kamu selalu ceria, kuharap kamu selalu bahagia
                sebagaimana yang kulihat. Aku tau kecil kemungkinan bahkan mustahil untuk kita
                bersama lagi, tapi aku yakin di dunia lain ada kita yang bersama. aku mengirim pesan
                ini sama sekali tidak bermaksud melukai dan menggangumu lagi, aku hanya ingin orang
                yang pernah ku cinta baik baik saja dan bisa selalu bahagia tanpaku.
              </p>
              <p>
                walau yang kulihat kamu selalu tampak bahagia tapi pasti kamu ada masalah
                tersembunyi yang sedang kamu selesaikan, kalau kamu butuh bantuan kamu masih bisa
                minta tolong ke aku lindaa. disini aku selalu mendoakan yang terbaik untukmu lindaa.
              </p>
              <p>
                oh ya btw aku lihat postingan ulang atau story kamu linda dan ntah kenapa hati ini
                selalu denial dan menganggap itu untuk aku, padahal tentunya itu bukan untukku tapi
                pria barumu😞.
              </p>
              <p>🎂🥳Happy birthday to the person I still hope will come back again.🎉</p>
              <p>
                maaf hanya bisa memberimu bunga dan kue virtual, aku hanya pria miskin yang dulu tak
                sempat membalas kebaikanmu dihari ulang tahunmu😞.
              </p>
            </div>
          </article>

          <div className="envelope-flap" aria-hidden="true" />
          <div className="envelope-front" aria-hidden="true" />
          <div className="envelope-seal" aria-hidden="true">
            <span />
          </div>
          {!isOpen ? <p className="envelope-hint">Tap to open</p> : null}
        </div>

        <BirthdayCake isVisible={isOpen} isCandleBlown={isCandleBlown} onBlowCandle={onBlowCandle} />

        {isOpen ? (
          <button type="button" className="letter-close" onClick={onClose}>
            Tutup
          </button>
        ) : null}
      </div>

      <div
        className={`envelope-toast${closeNotice ? " is-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {closeNotice}
      </div>
    </>
  );
}

function BirthdayCake({ isVisible, isCandleBlown, onBlowCandle }) {
  return (
    <div className={`cake-stage${isVisible ? " is-visible" : ""}`} aria-hidden={!isVisible}>
      {!isCandleBlown ? <p className="cake-instruction">Tap api untuk tiup lilin</p> : null}

      <div className="birthday-cake" aria-label="Kue ulang tahun dengan lilin menyala">
        <div className="cake-glow" aria-hidden="true" />
        <div className="cake-plate" aria-hidden="true" />

        <div className="cake-body" aria-hidden="true">
          <div className="cake-top-icing" />
          <div className="cake-side-icing cake-side-icing-left" />
          <div className="cake-side-icing cake-side-icing-center" />
          <div className="cake-side-icing cake-side-icing-right" />
          <div className="cake-ribbon" />

          <div className="cake-candle">
            <span className="cake-candle-stick" />
            <span className="cake-candle-wick" />
            <button
              type="button"
              className={`candle-flame${isCandleBlown ? " is-out" : ""}`}
              aria-label={isCandleBlown ? "Lilin sudah padam" : "Tap api untuk tiup lilin"}
              onClick={onBlowCandle}
              disabled={isCandleBlown || !isVisible}
              tabIndex={isVisible && !isCandleBlown ? 0 : -1}
            >
              <span className="candle-flame-core" aria-hidden="true" />
              <span className="candle-smoke" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function useLedTypewriter(messages) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState("typing");
  const currentMessage = messages[messageIndex];

  useEffect(() => {
    const isComplete = visibleCount >= currentMessage.length;
    const isEmpty = visibleCount === 0;
    let timeoutId;

    if (phase === "typing") {
      if (isComplete) {
        timeoutId = window.setTimeout(() => setPhase("holding"), 1100);
      } else {
        const nextCharacter = currentMessage[visibleCount];
        const stepDelay = nextCharacter === " " ? 120 : 92;
        timeoutId = window.setTimeout(() => setVisibleCount((count) => count + 1), stepDelay);
      }
    } else if (phase === "holding") {
      timeoutId = window.setTimeout(() => setPhase("erasing"), 900);
    } else if (isEmpty) {
      timeoutId = window.setTimeout(() => {
        setMessageIndex((index) => (index + 1) % messages.length);
        setPhase("typing");
      }, 240);
    } else {
      timeoutId = window.setTimeout(() => setVisibleCount((count) => count - 1), 42);
    }

    return () => window.clearTimeout(timeoutId);
  }, [currentMessage, messageIndex, messages.length, phase, visibleCount]);

  return { currentMessage, visibleCount, phase };
}

function buildLedDots(text, visibleCount, phase) {
  const chars = [...text.toUpperCase()];
  const rowSpacing = 3.35;
  const startAngle = 191;
  const endAngle = -11;
  const centerX = 120;
  const centerY = 122;
  const baseRadius = 95;
  const messageColumns = getMessageColumns(text);
  const leadingColumns = (MAX_LED_COLUMNS - messageColumns) / 2;

  const dots = [];
  let cursor = 0;

  chars.forEach((char, charIndex) => {
    const glyph = LED_FONT[char] ?? LED_FONT[" "];
    const isVisible = charIndex < visibleCount;
    const isFresh = phase === "typing" && charIndex === visibleCount - 1;

    glyph.forEach((row, rowIndex) => {
      [...row].forEach((cell, columnIndex) => {
        if (cell !== "1" || !isVisible) {
          return;
        }

        const progress = (leadingColumns + cursor + columnIndex + 0.5) / MAX_LED_COLUMNS;
        const angle = toRadians(startAngle + progress * (endAngle - startAngle));
        const radialOffset = ((glyph.length - 1) / 2 - rowIndex) * rowSpacing;
        const radius = baseRadius + radialOffset;

        dots.push({
          id: `${charIndex}-${rowIndex}-${columnIndex}`,
          fresh: isFresh,
          x: centerX + Math.cos(angle) * radius,
          y: centerY - Math.sin(angle) * radius,
        });
      });
    });

    cursor += glyph[0].length + LED_GLYPH_SPACING;
  });

  return dots;
}

function getMessageColumns(text) {
  const chars = [...text.toUpperCase()];

  return chars.reduce((sum, char, index) => {
    const glyph = LED_FONT[char] ?? LED_FONT[" "];
    const spacing = index === chars.length - 1 ? 0 : LED_GLYPH_SPACING;
    return sum + glyph[0].length + spacing;
  }, 0);
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export default App;
