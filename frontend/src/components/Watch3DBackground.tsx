'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Watch3DBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // -------------------------------------------------------------
    // 1. Three.js Scene, Camera, WebGL Renderer
    // -------------------------------------------------------------
    const isInitialMobile = mount.clientWidth < 640;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = isInitialMobile ? 32 : 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // Watch Master Group
    const watchGroup = new THREE.Group();
    scene.add(watchGroup);

    // -------------------------------------------------------------
    // 2. High-Resolution Classic Luxury Dial Canvas (1024 x 1024)
    // -------------------------------------------------------------
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const faceTexture = new THREE.CanvasTexture(canvas);
    faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const drawLuxuryDial = () => {
      const now = new Date();
      const dateNum = now.getDate();
      const dateStr = String(dateNum).padStart(2, '0');

      ctx.clearRect(0, 0, 1024, 1024);

      // Deep Emerald-Noir Sunburst Dial Base
      const bgGrad = ctx.createRadialGradient(512, 512, 40, 512, 512, 500);
      bgGrad.addColorStop(0, '#064e3b'); // Rich royal emerald malachite center
      bgGrad.addColorStop(0.45, '#022c22'); // Deep bottle green
      bgGrad.addColorStop(0.85, '#0a100d'); // Dark obsidian emerald
      bgGrad.addColorStop(1, '#050807'); // Jet black perimeter rim
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(512, 512, 498, 0, Math.PI * 2);
      ctx.fill();

      // Sunburst Guilloché Radial Rays (120 fine rays)
      ctx.save();
      ctx.translate(512, 512);
      for (let i = 0; i < 120; i++) {
        const angle = (i * Math.PI) / 60;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 490, Math.sin(angle) * 490);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(52, 211, 153, 0.07)' : 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();

      // Outer Gold Concentric Trim
      ctx.strokeStyle = '#d4af37'; // Warm champagne gold
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(512, 512, 488, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#927822';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(512, 512, 476, 0, Math.PI * 2);
      ctx.stroke();

      // Railway Minute Chapter Ring (60 Ticks)
      for (let i = 0; i < 60; i++) {
        const rad = (i * Math.PI) / 30 - Math.PI / 2;
        const isFiveMin = i % 5 === 0;
        const outerR = 472;
        const innerR = isFiveMin ? 444 : 456;

        ctx.beginPath();
        ctx.moveTo(512 + Math.cos(rad) * innerR, 512 + Math.sin(rad) * innerR);
        ctx.lineTo(512 + Math.cos(rad) * outerR, 512 + Math.sin(rad) * outerR);
        ctx.strokeStyle = isFiveMin ? '#fef08a' : 'rgba(212, 175, 55, 0.55)';
        ctx.lineWidth = isFiveMin ? 3.5 : 1.5;
        ctx.stroke();

        // 5-Minute Arabic Numbers (05, 10, 15... 60)
        if (isFiveMin) {
          const num = i === 0 ? '60' : String(i).padStart(2, '0');
          const numR = 422;
          const nx = 512 + Math.cos(rad) * numR;
          const ny = 512 + Math.sin(rad) * numR;
          ctx.save();
          ctx.translate(nx, ny);
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 19px "Cinzel", "Times New Roman", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(num, 0, 0);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // Haute Horology Branding
      // -------------------------------------------------------------
      // 12 o'clock Brand Crest & Typography
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 44px "Cinzel", "Times New Roman", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '6px';
      ctx.fillText('MONO TIME', 512, 270);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 15px "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('CHRONOMETER', 512, 305);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('OFFICIALLY CERTIFIED', 512, 325);

      // Lower Inscription (above 6 o'clock)
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 15px "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('AUTOMATIC', 512, 595);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('300m / 1000ft', 512, 618);

      // Swiss Heritage at 6 o'clock
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('SWISS', 430, 482);
      ctx.fillText('HERITAGE', 594, 482);

      // -------------------------------------------------------------
      // 3 o'clock Date Aperture Window
      // -------------------------------------------------------------
      const dwX = 738;
      const dwY = 482;
      const dwW = 88;
      const dwH = 60;

      // Beveled Gold Date Window Frame
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(dwX, dwY, dwW, dwH);

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.strokeRect(dwX, dwY, dwW, dwH);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dwX + 3, dwY + 3, dwW - 6, dwH - 6);

      // White Date Disc Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(dwX + 6, dwY + 6, dwW - 12, dwH - 12);

      // Date Text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0px';
      ctx.fillText(dateStr, dwX + dwW / 2, dwY + dwH / 2 + 12);

      // -------------------------------------------------------------
      // 6 o'clock Openwork Tourbillon Subdial Ring
      // -------------------------------------------------------------
      const subX = 512;
      const subY = 725;
      const subR = 105;

      // Sunken subdial cavity
      const subGrad = ctx.createRadialGradient(subX, subY, 20, subX, subY, subR);
      subGrad.addColorStop(0, '#021812');
      subGrad.addColorStop(0.8, '#04221a');
      subGrad.addColorStop(1, '#0d1512');
      ctx.fillStyle = subGrad;
      ctx.beginPath();
      ctx.arc(subX, subY, subR, 0, Math.PI * 2);
      ctx.fill();

      // Concentric Azuré Guilloché rings
      for (let r = 25; r < subR; r += 16) {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(subX, subY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Subdial Outer Gold Border & Ticks
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(subX, subY, subR, 0, Math.PI * 2);
      ctx.stroke();

      for (let s = 0; s < 12; s++) {
        const sRad = (s * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(subX + Math.cos(sRad) * (subR - 10), subY + Math.sin(sRad) * (subR - 10));
        ctx.lineTo(subX + Math.cos(sRad) * subR, subY + Math.sin(sRad) * subR);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.textAlign = 'center';
      ctx.fillText('TOURBILLON', subX, subY - subR + 24);

      faceTexture.needsUpdate = true;
    };

    drawLuxuryDial();

    // -------------------------------------------------------------
    // 3. Luxurious PVD & Stainless Steel Materials
    // -------------------------------------------------------------
    // Mirror-Polished Platinum-Steel
    const mirrorPlatinumMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.96,
      roughness: 0.1,
    });

    // Satin Brushed Case Steel
    const brushedSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8d0d8,
      metalness: 0.88,
      roughness: 0.32,
    });

    // Champagne 18K Yellow Gold Material
    const champagneGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      metalness: 0.94,
      roughness: 0.14,
    });

    // Blued Cobalt Horology Steel (for hands & screws)
    const bluedSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.92,
      roughness: 0.12,
    });

    // Synthetic Ruby Jewel Bearing
    const rubyJewelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      emissive: 0x9f1239,
      emissiveIntensity: 0.4,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.5,
    });

    // Dial Surface Material
    const dialSurfaceMaterial = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.25,
      metalness: 0.35,
    });

    // Anti-Reflective Domed Sapphire Crystal
    const sapphireCrystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      opacity: 0.28,
      transparent: true,
      roughness: 0.03,
      ior: 1.77, // Real sapphire index
      reflectivity: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    // -------------------------------------------------------------
    // 4. Classic Round Luxury Watch Case & Lugs
    // -------------------------------------------------------------
    const caseRadius = 5.2;
    const caseThickness = 1.35;

    // Main Cylindrical Case Barrel
    const caseGeo = new THREE.CylinderGeometry(caseRadius, caseRadius * 0.97, caseThickness, 64);
    const caseMesh = new THREE.Mesh(caseGeo, mirrorPlatinumMaterial);
    caseMesh.rotation.x = Math.PI / 2;
    watchGroup.add(caseMesh);

    // Brushed Mid-case ring flank
    const midCaseGeo = new THREE.CylinderGeometry(caseRadius * 1.01, caseRadius * 1.01, caseThickness * 0.65, 64);
    const midCaseMesh = new THREE.Mesh(midCaseGeo, brushedSteelMaterial);
    midCaseMesh.rotation.x = Math.PI / 2;
    watchGroup.add(midCaseMesh);

    // 4 Sculpted Ergonomic Curved Lugs
    const createLug = (xDir: number, yDir: number) => {
      const lugShape = new THREE.Shape();
      lugShape.moveTo(0, 0);
      lugShape.lineTo(0.9, 0);
      lugShape.lineTo(0.65, 2.5);
      lugShape.lineTo(-0.1, 2.3);
      lugShape.closePath();

      const extrudeSettings = {
        depth: 0.9,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.12,
        bevelThickness: 0.12,
      };

      const lugGeo = new THREE.ExtrudeGeometry(lugShape, extrudeSettings);
      lugGeo.center();
      const lugMesh = new THREE.Mesh(lugGeo, mirrorPlatinumMaterial);

      const xPos = xDir * 3.65;
      const yPos = yDir * 5.35;
      lugMesh.position.set(xPos, yPos, -0.15);
      lugMesh.rotation.z = yDir > 0 ? (xDir > 0 ? -0.12 : 0.12) : (xDir > 0 ? Math.PI + 0.12 : Math.PI - 0.12);
      lugMesh.rotation.x = yDir > 0 ? 0.2 : -0.2;
      watchGroup.add(lugMesh);
    };

    createLug(1, 1);
    createLug(-1, 1);
    createLug(1, -1);
    createLug(-1, -1);

    // -------------------------------------------------------------
    // 5. Iconic Luxury Fluted Bezel (Coin-edge 64-facet ring)
    // -------------------------------------------------------------
    const bezelBaseGeo = new THREE.TorusGeometry(caseRadius * 0.92, 0.35, 16, 64);
    const bezelBaseMesh = new THREE.Mesh(bezelBaseGeo, mirrorPlatinumMaterial);
    bezelBaseMesh.position.z = caseThickness / 2 + 0.18;
    watchGroup.add(bezelBaseMesh);

    // Fluted Bezel Facet Serrations
    const flutedGroup = new THREE.Group();
    const fluteCount = 72;
    const fluteRadius = caseRadius * 0.93;
    const toothGeo = new THREE.ConeGeometry(0.12, 0.45, 4);
    toothGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < fluteCount; i++) {
      const angle = (i * Math.PI * 2) / fluteCount;
      const fluteMesh = new THREE.Mesh(toothGeo, champagneGoldMaterial);
      fluteMesh.position.set(
        Math.cos(angle) * fluteRadius,
        Math.sin(angle) * fluteRadius,
        caseThickness / 2 + 0.28
      );
      fluteMesh.rotation.z = angle;
      flutedGroup.add(fluteMesh);
    }
    watchGroup.add(flutedGroup);

    // -------------------------------------------------------------
    // 6. Luxury Dial Plate & Applied 3D Faceted Hour Batons
    // -------------------------------------------------------------
    const dialGeo = new THREE.CircleGeometry(caseRadius * 0.88, 64);
    const dialMesh = new THREE.Mesh(dialGeo, dialSurfaceMaterial);
    dialMesh.position.z = caseThickness / 2 + 0.22;
    watchGroup.add(dialMesh);

    // Applied 3D Gold Baton Markers
    const batonGeo = new THREE.BoxGeometry(0.24, 0.75, 0.14);
    const markerRadius = caseRadius * 0.72;

    for (let h = 1; h <= 12; h++) {
      // Shortened marker at 3 o'clock for date window
      if (h === 3) continue;

      const angle = (h * Math.PI) / 6 - Math.PI / 2;
      const x = Math.cos(angle) * markerRadius;
      const y = -Math.sin(angle) * markerRadius;

      if (h === 12) {
        // Double Baton Marker at 12 o'clock
        const batonL = new THREE.Mesh(batonGeo, champagneGoldMaterial);
        batonL.position.set(x - 0.18, y, caseThickness / 2 + 0.32);
        watchGroup.add(batonL);

        const batonR = new THREE.Mesh(batonGeo, champagneGoldMaterial);
        batonR.position.set(x + 0.18, y, caseThickness / 2 + 0.32);
        watchGroup.add(batonR);
      } else {
        const baton = new THREE.Mesh(batonGeo, champagneGoldMaterial);
        baton.position.set(x, y, caseThickness / 2 + 0.32);
        baton.rotation.z = -angle - Math.PI / 2;
        watchGroup.add(baton);
      }
    }

    // -------------------------------------------------------------
    // 7. Mechanical Hands (Faceted Dauphine Hour & Minute + Sweeping Seconds)
    // -------------------------------------------------------------
    const handsZ = caseThickness / 2 + 0.42;

    // Hour Hand (Dauphine Faceted)
    const hourHandGroup = new THREE.Group();
    hourHandGroup.position.set(0, 0, handsZ);
    watchGroup.add(hourHandGroup);

    const hourHandShape = new THREE.Shape();
    hourHandShape.moveTo(0, -0.4);
    hourHandShape.lineTo(-0.24, 0);
    hourHandShape.lineTo(-0.18, 1.4);
    hourHandShape.lineTo(0, 2.4);
    hourHandShape.lineTo(0.18, 1.4);
    hourHandShape.lineTo(0.24, 0);
    hourHandShape.closePath();

    const hourGeo = new THREE.ExtrudeGeometry(hourHandShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    hourGeo.center();
    const hourMesh = new THREE.Mesh(hourGeo, champagneGoldMaterial);
    hourMesh.position.y = 1.0;
    hourHandGroup.add(hourMesh);

    // Minute Hand (Elongated Dauphine Faceted)
    const minuteHandGroup = new THREE.Group();
    minuteHandGroup.position.set(0, 0, handsZ + 0.08);
    watchGroup.add(minuteHandGroup);

    const minuteHandShape = new THREE.Shape();
    minuteHandShape.moveTo(0, -0.5);
    minuteHandShape.lineTo(-0.2, 0);
    minuteHandShape.lineTo(-0.14, 2.2);
    minuteHandShape.lineTo(0, 3.45);
    minuteHandShape.lineTo(0.14, 2.2);
    minuteHandShape.lineTo(0.2, 0);
    minuteHandShape.closePath();

    const minuteGeo = new THREE.ExtrudeGeometry(minuteHandShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    minuteGeo.center();
    const minuteMesh = new THREE.Mesh(minuteGeo, champagneGoldMaterial);
    minuteMesh.position.y = 1.5;
    minuteHandGroup.add(minuteMesh);

    // Sweeping Seconds Hand (Fine Needle with Counterbalance)
    const secondsHandGroup = new THREE.Group();
    secondsHandGroup.position.set(0, 0, handsZ + 0.16);
    watchGroup.add(secondsHandGroup);

    // Needle blade
    const needleGeo = new THREE.CylinderGeometry(0.025, 0.05, 4.2, 16);
    needleGeo.translate(0, 1.5, 0);
    const needleMesh = new THREE.Mesh(needleGeo, bluedSteelMaterial);
    secondsHandGroup.add(needleMesh);

    // Tail counterbalance circle
    const tailRingGeo = new THREE.TorusGeometry(0.25, 0.05, 12, 24);
    tailRingGeo.translate(0, -0.8, 0);
    const tailRingMesh = new THREE.Mesh(tailRingGeo, bluedSteelMaterial);
    secondsHandGroup.add(tailRingMesh);

    // Center Arbor Pinion Cap
    const arborGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 32);
    const arborMesh = new THREE.Mesh(arborGeo, champagneGoldMaterial);
    arborMesh.rotation.x = Math.PI / 2;
    arborMesh.position.set(0, 0, handsZ + 0.2);
    watchGroup.add(arborMesh);

    // Center Ruby in Arbor
    const arborRubyGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const arborRubyMesh = new THREE.Mesh(arborRubyGeo, rubyJewelMaterial);
    arborRubyMesh.position.set(0, 0, handsZ + 0.32);
    watchGroup.add(arborRubyMesh);

    // -------------------------------------------------------------
    // 8. 6 o'clock Live Rotating Tourbillon Escapement Mechanism
    // -------------------------------------------------------------
    const tourbillonGroup = new THREE.Group();
    tourbillonGroup.position.set(0, -2.15, caseThickness / 2 + 0.28);
    watchGroup.add(tourbillonGroup);

    // 3-Spoke Gold Balance Wheel
    const balanceRimGeo = new THREE.TorusGeometry(0.85, 0.045, 12, 36);
    const balanceRimMesh = new THREE.Mesh(balanceRimGeo, champagneGoldMaterial);
    tourbillonGroup.add(balanceRimMesh);

    for (let s = 0; s < 3; s++) {
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.85, 0.03);
      const spokeMesh = new THREE.Mesh(spokeGeo, champagneGoldMaterial);
      spokeMesh.rotation.z = (s * Math.PI * 2) / 3;
      tourbillonGroup.add(spokeMesh);
    }

    // Ruby Center Jewel on Tourbillon Bridge
    const tourbillonRuby = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      rubyJewelMaterial
    );
    tourbillonRuby.position.z = 0.06;
    tourbillonGroup.add(tourbillonRuby);

    // Blued Tourbillon Bridge Screws
    const screwGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16);
    screwGeo.rotateX(Math.PI / 2);
    const screwL = new THREE.Mesh(screwGeo, bluedSteelMaterial);
    screwL.position.set(-0.65, 0, 0.05);
    tourbillonGroup.add(screwL);

    const screwR = new THREE.Mesh(screwGeo, bluedSteelMaterial);
    screwR.position.set(0.65, 0, 0.05);
    tourbillonGroup.add(screwR);

    // -------------------------------------------------------------
    // 9. Luxury Winding Crown & Sculpted Guards (at 3 o'clock)
    // -------------------------------------------------------------
    const crownX = caseRadius + 0.35;
    const crownGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.65, 24);
    crownGeo.rotateZ(Math.PI / 2);
    const crownMesh = new THREE.Mesh(crownGeo, champagneGoldMaterial);
    crownMesh.position.set(crownX, 0, 0);
    watchGroup.add(crownMesh);

    // Emerald Jewel Cabochon on Crown tip
    const cabochonGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const cabochonMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.1,
      metalness: 0.3,
      emissive: 0x047857,
      emissiveIntensity: 0.3,
    });
    const cabochonMesh = new THREE.Mesh(cabochonGeo, cabochonMat);
    cabochonMesh.position.set(crownX + 0.38, 0, 0);
    watchGroup.add(cabochonMesh);

    // Fluted Ribs on Crown
    const crownRingGeo = new THREE.TorusGeometry(0.56, 0.06, 8, 24);
    crownRingGeo.rotateY(Math.PI / 2);
    const crownRingMesh = new THREE.Mesh(crownRingGeo, mirrorPlatinumMaterial);
    crownRingMesh.position.set(crownX - 0.12, 0, 0);
    watchGroup.add(crownRingMesh);

    // -------------------------------------------------------------
    // 10. Classic 5-Link Luxury Jubilee Metal Bracelet
    // -------------------------------------------------------------
    const createJubileeSegment = (isTop: boolean) => {
      const group = new THREE.Group();
      const linkCount = 7;
      const yDir = isTop ? 1 : -1;
      const startY = yDir * 5.4;

      for (let i = 0; i < linkCount; i++) {
        const linkY = startY + yDir * (i * 0.95);
        const taper = 1 - i * 0.045; // Subtle ergonomic wrist taper
        const curveZ = -0.4 - Math.pow(i, 1.45) * 0.45; // Curving backwards around wrist
        const tiltX = yDir * (-0.12 - i * 0.08);

        // Outer Left Link (Satin Brushed)
        const outerLeft = new THREE.Mesh(
          new THREE.BoxGeometry(1.2 * taper, 0.85, 0.3),
          brushedSteelMaterial
        );
        outerLeft.position.set(-1.85 * taper, linkY, curveZ);
        outerLeft.rotation.x = tiltX;
        group.add(outerLeft);

        // Outer Right Link (Satin Brushed)
        const outerRight = new THREE.Mesh(
          new THREE.BoxGeometry(1.2 * taper, 0.85, 0.3),
          brushedSteelMaterial
        );
        outerRight.position.set(1.85 * taper, linkY, curveZ);
        outerRight.rotation.x = tiltX;
        group.add(outerRight);

        // Center 3 Links (Mirror-Polished 18K Champagne Gold Jubilee Rows)
        for (let c = -1; c <= 1; c++) {
          const centerLink = new THREE.Mesh(
            new THREE.BoxGeometry(0.72 * taper, 0.88, 0.34),
            champagneGoldMaterial
          );
          centerLink.position.set(c * (0.82 * taper), linkY, curveZ + 0.04);
          centerLink.rotation.x = tiltX;
          group.add(centerLink);
        }
      }

      return group;
    };

    watchGroup.add(createJubileeSegment(true));  // Upper bracelet drape
    watchGroup.add(createJubileeSegment(false)); // Lower bracelet drape

    // -------------------------------------------------------------
    // 11. Anti-Reflective Domed Sapphire Crystal Lens
    // -------------------------------------------------------------
    const crystalGeo = new THREE.CylinderGeometry(
      caseRadius * 0.89,
      caseRadius * 0.9,
      0.15,
      64
    );
    const crystalMesh = new THREE.Mesh(crystalGeo, sapphireCrystalMaterial);
    crystalMesh.rotation.x = Math.PI / 2;
    crystalMesh.position.z = caseThickness / 2 + 0.58;
    watchGroup.add(crystalMesh);

    // Initial Watch Orientation & Spatial Staging
    watchGroup.rotation.x = 0.16;
    watchGroup.rotation.y = -0.22;
    watchGroup.position.set(2.8, 0, 0); // Elegantly positioned beside hero typography

    // -------------------------------------------------------------
    // 12. Studio & Haute Horology Lighting
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Key Studio Light (Warm Champagne Highlights on Gold & Platinum)
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
    keyLight.position.set(14, 20, 22);
    scene.add(keyLight);

    // Fill Studio Light (Cool Platinum Reflections)
    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.4);
    fillLight.position.set(-16, -12, 18);
    scene.add(fillLight);

    // Vibrant Emerald Rim Light for luxury atmospheric halo
    const emeraldRimLight = new THREE.PointLight(0x10b981, 4.0, 45);
    emeraldRimLight.position.set(9, -7, 10);
    scene.add(emeraldRimLight);

    // Top Specular Accent for Fluted Bezel Glints
    const glintLight = new THREE.PointLight(0xfef08a, 3.2, 35);
    glintLight.position.set(-8, 14, 12);
    scene.add(glintLight);

    // Luminous Micro-Particles floating in atmospheric background
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 50;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 36;
      posArray[i + 1] = (Math.random() - 0.5) * 36;
      posArray[i + 2] = (Math.random() - 0.5) * 22;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      color: 0x34d399,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // -------------------------------------------------------------
    // 13. Interactive Mouse Parallax Tracking
    // -------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.16;
    let targetRotationY = -0.22;
    let currentRotationX = 0.16;
    let currentRotationY = -0.22;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX;
      mouseY = normY;

      targetRotationY = -0.22 + mouseX * 0.45;
      targetRotationX = 0.16 - mouseY * 0.35;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const normX = (touch.clientX / window.innerWidth) * 2 - 1;
        const normY = -(touch.clientY / window.innerHeight) * 2 + 1;
        mouseX = normX;
        mouseY = normY;
        targetRotationY = -0.22 + mouseX * 0.45;
        targetRotationX = 0.16 - mouseY * 0.35;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      if (!mount) return;
      const isMobile = mount.clientWidth < 640;
      camera.position.z = isMobile ? 32 : 24;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // 14. High-Precision Mechanical Animation Loop
    // -------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let lastDateDay = -1;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Real-time Clock Angles
      const now = new Date();
      const currentDay = now.getDate();
      if (currentDay !== lastDateDay) {
        lastDateDay = currentDay;
        drawLuxuryDial();
      }

      const ms = now.getMilliseconds();
      const sec = now.getSeconds() + ms / 1000;
      const min = now.getMinutes() + sec / 60;
      const hr = (now.getHours() % 12) + min / 60;

      // Real-time sweeping mechanical hands (clockwise)
      secondsHandGroup.rotation.z = -sec * (Math.PI / 30);
      minuteHandGroup.rotation.z = -min * (Math.PI / 30);
      hourHandGroup.rotation.z = -hr * (Math.PI / 6);

      // Rapid Tourbillon Escapement Oscillation (8Hz mechanical balance)
      tourbillonGroup.rotation.z = Math.sin(elapsedTime * 16) * 0.75 + elapsedTime * 0.5;

      // Smooth mouse/touch follow (slerp)
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      // Subtle breathing floating motion
      watchGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 0.5) * 0.025;
      watchGroup.rotation.y = currentRotationY + Math.cos(elapsedTime * 0.5) * 0.025;

      particles.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      faceTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
