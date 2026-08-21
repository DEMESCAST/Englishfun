// city-canvas.js - Professional Game Menu Canvas Layer
// Copyright (c) 2026 DEMESCAST. Todos os direitos reservados.

const CityCanvas = {
    canvas: null, ctx: null, width: 0, height: 0, time: 0,
    mouseX: 0, mouseY: 0, smoothMouseX: 0, smoothMouseY: 0,
    hoveredZone: null, fireflies: [], running: false,
    transitioning: false, transProgress: 0, transTarget: null,

    zones: {
        learn:        { x: 0.10, y: 0.22, w: 0.14, h: 0.18, color: '#3b82f6', glow: 'rgba(59,130,246,' },
        quiz:         { x: 0.40, y: 0.10, w: 0.14, h: 0.16, color: '#a855f7', glow: 'rgba(168,85,247,' },
        dictation:    { x: 0.76, y: 0.16, w: 0.14, h: 0.16, color: '#22d3ee', glow: 'rgba(34,211,238,' },
        conversation: { x: 0.06, y: 0.50, w: 0.14, h: 0.16, color: '#8b5cf6', glow: 'rgba(139,92,246,' },
        memory:       { x: 0.78, y: 0.48, w: 0.14, h: 0.16, color: '#4ade80', glow: 'rgba(74,222,128,' },
        review:       { x: 0.12, y: 0.76, w: 0.14, h: 0.14, color: '#f97316', glow: 'rgba(249,115,22,' },
        progress:     { x: 0.74, y: 0.76, w: 0.14, h: 0.14, color: '#ffd700', glow: 'rgba(255,215,0,' }
    },

    init() {
        this.canvas = document.getElementById('city-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => { this.mouseX = e.clientX; this.mouseY = e.clientY; });
        this.canvas.addEventListener('mouseleave', () => { this.mouseX = this.width / 2; this.mouseY = this.height / 2; });
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) { this.mouseX = e.touches[0].clientX; this.mouseY = e.touches[0].clientY; }
        }, { passive: true });
        this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.onClick(e); });
        for (let i = 0; i < 25; i++) this.spawnFirefly();
        this.running = true;
        this.animate();
    },

    resize() { this.width = window.innerWidth; this.height = window.innerHeight; this.canvas.width = this.width; this.canvas.height = this.height; },

    spawnFirefly() {
        this.fireflies.push({
            x: Math.random() * this.width, y: Math.random() * this.height * 0.7,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2,
            size: 1 + Math.random() * 2.5, alpha: Math.random(), alphaDir: 0.01 + Math.random() * 0.02,
            color: ['#3b82f6','#a855f7','#22d3ee','#4ade80','#ffd700','#f97316'][Math.floor(Math.random()*6)]
        });
    },

    checkHover() {
        this.hoveredZone = null;
        for (const [name, z] of Object.entries(this.zones)) {
            const zx = z.x * this.width, zy = z.y * this.height, zw = z.w * this.width, zh = z.h * this.height;
            if (this.mouseX >= zx && this.mouseX <= zx + zw && this.mouseY >= zy && this.mouseY <= zy + zh) { this.hoveredZone = name; break; }
        }
    },

    animate() {
        if (!this.running) return;
        this.time += 0.016;
        this.smoothMouseX += (this.mouseX - this.smoothMouseX) * 0.05;
        this.smoothMouseY += (this.mouseY - this.smoothMouseY) * 0.05;
        this.checkHover();
        this.ctx.clearRect(0, 0, this.width, this.height);
        const px = (this.smoothMouseX - this.width / 2) * 0.008;
        const py = (this.smoothMouseY - this.height / 2) * 0.005;
        this.ctx.save();
        this.ctx.translate(px, py);
        this.drawAmbientGlow();
        this.drawFireflies();
        this.drawZoneEffects();
        this.drawCharacters();
        this.ctx.restore();
        if (this.transitioning) this.drawTransition();
        this.canvas.style.cursor = this.transitioning ? 'default' : (this.hoveredZone ? 'pointer' : 'default');
        requestAnimationFrame(() => this.animate());
    },
    // AMBIENT NIGHT GLOW
    drawAmbientGlow() {
        const t = this.time, cx = this.width / 2, cy = this.height * 0.4;
        const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, this.width * 0.5);
        grad.addColorStop(0, 'rgba(30,60,120,0.08)'); grad.addColorStop(0.5, 'rgba(20,40,80,0.04)'); grad.addColorStop(1, 'rgba(10,20,40,0)');
        this.ctx.fillStyle = grad; this.ctx.fillRect(0, 0, this.width, this.height);
        const lx = cx + Math.sin(t * 0.3) * 200, ly = cy + Math.cos(t * 0.2) * 100;
        const lg = this.ctx.createRadialGradient(lx, ly, 0, lx, ly, 200);
        lg.addColorStop(0, 'rgba(80,140,255,0.04)'); lg.addColorStop(1, 'rgba(80,140,255,0)');
        this.ctx.fillStyle = lg; this.ctx.fillRect(0, 0, this.width, this.height);
    },

    // FIREFLIES
    drawFireflies() {
        for (let i = this.fireflies.length - 1; i >= 0; i--) {
            const f = this.fireflies[i];
            f.x += f.vx + Math.sin(this.time + i) * 0.1;
            f.y += f.vy + Math.cos(this.time * 0.7 + i) * 0.08;
            f.alpha += f.alphaDir;
            if (f.alpha > 1 || f.alpha < 0.1) f.alphaDir *= -1;
            if (f.x < -20 || f.x > this.width + 20 || f.y < -20 || f.y > this.height + 20) {
                f.x = Math.random() * this.width; f.y = this.height * 0.3 + Math.random() * this.height * 0.5;
            }
            this.ctx.save(); this.ctx.globalAlpha = f.alpha * 0.6; this.ctx.fillStyle = f.color;
            this.ctx.shadowColor = f.color; this.ctx.shadowBlur = 10;
            this.ctx.beginPath(); this.ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.restore();
        }
    },

    // ZONE EFFECTS
    drawZoneEffects() {
        const zoneNames = Object.keys(this.zones);
        for (const [name, z] of Object.entries(this.zones)) {
            const cx = (z.x + z.w / 2) * this.width, cy = (z.y + z.h / 2) * this.height;
            const r = Math.min(z.w, z.h) * this.width * 0.45;
            const isHovered = this.hoveredZone === name;
            const pulse = Math.sin(this.time * 2 + zoneNames.indexOf(name) * 0.9) * 0.3 + 0.7;

            if (isHovered) {
                this.ctx.save(); this.ctx.globalAlpha = 0.25 * pulse;
                const hg = this.ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.2);
                hg.addColorStop(0, z.glow + '0.5)'); hg.addColorStop(0.5, z.glow + '0.2)'); hg.addColorStop(1, z.glow + '0)');
                this.ctx.fillStyle = hg; this.ctx.beginPath(); this.ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.restore();
            }

            this.ctx.save(); this.ctx.globalAlpha = (isHovered ? 0.4 : 0.12) * pulse;
            this.ctx.strokeStyle = z.color; this.ctx.lineWidth = isHovered ? 2 : 1;
            this.ctx.shadowColor = z.color; this.ctx.shadowBlur = isHovered ? 18 : 8;
            this.ctx.beginPath(); this.ctx.arc(cx, cy, r * (0.5 + pulse * 0.3), 0, Math.PI * 2); this.ctx.stroke();
            this.ctx.restore();

            const scale = isHovered ? 1.05 : 1;
            this.ctx.save(); this.ctx.translate(cx, cy); this.ctx.scale(scale, scale); this.ctx.translate(-cx, -cy);
            if (name === 'learn') this.drawBookEffect(cx, cy, r);
            else if (name === 'quiz') this.drawTargetEffect(cx, cy, r);
            else if (name === 'dictation') this.drawMicWaves(cx, cy, r);
            else if (name === 'conversation') this.drawChatBubbles(cx, cy, r);
            else if (name === 'memory') this.drawBrainEffect(cx, cy, r);
            else if (name === 'review') this.drawCheckEffect(cx, cy, r);
            else if (name === 'progress') this.drawChartEffect(cx, cy, r);
            this.ctx.restore();
        }
    },
    // LEARN - Book with turning pages + blue light + floating letters
    drawBookEffect(cx, cy, r) {
        const t = this.time * 1.2, pageAngle = Math.sin(t) * 0.35;
        this.ctx.save(); this.ctx.translate(cx, cy - r * 0.15); this.ctx.globalAlpha = 0.55;
        const glow = this.ctx.createRadialGradient(0, 10, 2, 0, 10, 30);
        glow.addColorStop(0, 'rgba(59,130,246,0.3)'); glow.addColorStop(1, 'rgba(59,130,246,0)');
        this.ctx.fillStyle = glow; this.ctx.fillRect(-30, -5, 60, 40);
        this.ctx.fillStyle = '#1e3a8a'; this.ctx.fillRect(-2, -10, 4, 22);
        this.ctx.save(); this.ctx.transform(1, 0, pageAngle * 0.5, 1, 0, 0);
        this.ctx.fillStyle = '#dbeafe'; this.ctx.fillRect(-18, -8, 16, 18);
        this.ctx.fillStyle = '#93c5fd';
        for (let i = 0; i < 3; i++) this.ctx.fillRect(-15, -4 + i * 5, 10 - i * 2, 1.5);
        this.ctx.restore();
        this.ctx.save(); this.ctx.transform(1, 0, -pageAngle, 1, 0, 0);
        this.ctx.fillStyle = '#eff6ff'; this.ctx.fillRect(2, -8, 16, 18);
        this.ctx.fillStyle = '#93c5fd';
        for (let i = 0; i < 3; i++) this.ctx.fillRect(5, -4 + i * 5, 10 - i * 2, 1.5);
        this.ctx.restore();
        ['A','B','C','E'].forEach((l, i) => {
            this.ctx.globalAlpha = 0.3 + Math.sin(t * 2 + i) * 0.15;
            this.ctx.fillStyle = '#60a5fa'; this.ctx.font = '8px Arial';
            this.ctx.fillText(l, -8 + i * 6, -20 - Math.sin(t + i * 1.2) * 8);
        });
        this.ctx.restore();
    },

    // QUIZ - Target with trophy + light sweep
    drawTargetEffect(cx, cy, r) {
        const t = this.time * 2.5, pulse = Math.sin(t) * 0.12 + 1;
        this.ctx.save(); this.ctx.translate(cx, cy);
        this.ctx.globalAlpha = 0.3 + Math.sin(t * 0.8) * 0.15;
        const tg = this.ctx.createRadialGradient(0, -18, 2, 0, -18, 12);
        tg.addColorStop(0, 'rgba(255,215,0,0.6)'); tg.addColorStop(1, 'rgba(255,215,0,0)');
        this.ctx.fillStyle = tg; this.ctx.beginPath(); this.ctx.arc(0, -18, 12, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.globalAlpha = 0.5; this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath(); this.ctx.arc(0, -18, 5, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillRect(-1, -13, 2, 4);
        this.ctx.scale(pulse, pulse); this.ctx.globalAlpha = 0.45;
        for (let i = 3; i >= 0; i--) {
            this.ctx.fillStyle = i % 2 === 0 ? '#a855f7' : '#f5f3ff';
            this.ctx.beginPath(); this.ctx.arc(0, 0, (4 - i) * 7, 0, Math.PI * 2); this.ctx.fill();
        }
        this.ctx.fillStyle = '#fbbf24'; this.ctx.beginPath(); this.ctx.arc(0, 0, 3.5, 0, Math.PI * 2); this.ctx.fill();
        const sweep = Math.sin(t * 0.5) * 20;
        this.ctx.globalAlpha = 0.15; this.ctx.fillStyle = '#fff';
        this.ctx.beginPath(); this.ctx.ellipse(sweep, 0, 4, 25, 0, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.restore();
    },

    // DICTATION - Mic with pulsing light + sound waves
    drawMicWaves(cx, cy, r) {
        const t = this.time * 3;
        this.ctx.save(); this.ctx.translate(cx, cy - r * 0.05); this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = '#0e7490'; this.ctx.beginPath(); this.ctx.arc(0, -6, 7, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#155e75'; this.ctx.fillRect(-2.5, 1, 5, 9); this.ctx.fillRect(-7, 10, 14, 2);
        this.ctx.globalAlpha = 0.3 + Math.sin(t) * 0.2; this.ctx.fillStyle = '#22d3ee';
        this.ctx.shadowColor = '#22d3ee'; this.ctx.shadowBlur = 10;
        this.ctx.beginPath(); this.ctx.arc(0, -6, 3, 0, Math.PI * 2); this.ctx.fill(); this.ctx.shadowBlur = 0;
        for (let i = 1; i <= 4; i++) {
            const waveR = 12 + i * 9 + Math.sin(t + i * 0.8) * 4;
            this.ctx.globalAlpha = 0.35 - i * 0.07; this.ctx.strokeStyle = '#22d3ee'; this.ctx.lineWidth = 1.5;
            this.ctx.beginPath(); this.ctx.arc(0, -6, waveR, -0.7, 0.7); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.arc(0, -6, waveR, Math.PI - 0.7, Math.PI + 0.7); this.ctx.stroke();
        }
        this.ctx.restore();
    },

    // CONVERSATION - Chat bubbles with dots
    drawChatBubbles(cx, cy, r) {
        const t = this.time;
        const bubbles = [
            { ox: -18, oy: -12, size: 9, delay: 0, tail: 'left' },
            { ox: 12, oy: -6, size: 11, delay: 1.2, tail: 'right' },
            { ox: -6, oy: 10, size: 8, delay: 2.4, tail: 'left' }
        ];
        this.ctx.save();
        bubbles.forEach((b) => {
            const appear = (Math.sin(t * 0.8 + b.delay) + 1) / 2;
            const yOff = Math.sin(t * 1.2 + b.delay) * 4;
            this.ctx.globalAlpha = appear * 0.5; this.ctx.fillStyle = '#8b5cf6';
            this.ctx.shadowColor = '#8b5cf6'; this.ctx.shadowBlur = 8;
            this.ctx.beginPath(); this.ctx.arc(cx + b.ox, cy + b.oy + yOff, b.size, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath();
            if (b.tail === 'left') {
                this.ctx.moveTo(cx + b.ox - 4, cy + b.oy + yOff + b.size - 2);
                this.ctx.lineTo(cx + b.ox - 8, cy + b.oy + yOff + b.size + 6);
                this.ctx.lineTo(cx + b.ox + 2, cy + b.oy + yOff + b.size);
            } else {
                this.ctx.moveTo(cx + b.ox + 4, cy + b.oy + yOff + b.size - 2);
                this.ctx.lineTo(cx + b.ox + 8, cy + b.oy + yOff + b.size + 6);
                this.ctx.lineTo(cx + b.ox - 2, cy + b.oy + yOff + b.size);
            }
            this.ctx.fill(); this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#c4b5fd'; this.ctx.globalAlpha = appear * 0.4;
            for (let d = 0; d < 3; d++) {
                this.ctx.beginPath(); this.ctx.arc(cx + b.ox - 4 + d * 4, cy + b.oy + yOff, 1.2, 0, Math.PI * 2); this.ctx.fill();
            }
        });
        this.ctx.restore();
    },

    // MEMORY - Brain with dome glow + energy rays
    drawBrainEffect(cx, cy, r) {
        const t = this.time * 1.8;
        this.ctx.save(); this.ctx.translate(cx, cy);
        this.ctx.globalAlpha = 0.2 + Math.sin(t * 0.6) * 0.1;
        const dome = this.ctx.createRadialGradient(0, 0, 5, 0, 0, 22);
        dome.addColorStop(0, 'rgba(74,222,128,0.5)'); dome.addColorStop(0.6, 'rgba(74,222,128,0.15)'); dome.addColorStop(1, 'rgba(74,222,128,0)');
        this.ctx.fillStyle = dome; this.ctx.beginPath(); this.ctx.arc(0, 0, 22, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.globalAlpha = 0.5; this.ctx.fillStyle = '#166534';
        this.ctx.beginPath(); this.ctx.arc(-4, -2, 8, 0, Math.PI * 2); this.ctx.arc(4, -2, 8, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#22c55e'; this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath(); this.ctx.arc(-4, -2, 5, 0, Math.PI * 2); this.ctx.arc(4, -2, 5, 0, Math.PI * 2); this.ctx.fill();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + t * 0.5, rayLen = 10 + Math.sin(t * 2 + i) * 5;
            this.ctx.globalAlpha = 0.25 + Math.sin(t * 3 + i) * 0.15; this.ctx.strokeStyle = '#4ade80';
            this.ctx.lineWidth = 1; this.ctx.shadowColor = '#4ade80'; this.ctx.shadowBlur = 6;
            this.ctx.beginPath(); this.ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
            this.ctx.lineTo(Math.cos(angle) * (10 + rayLen), Math.sin(angle) * (10 + rayLen)); this.ctx.stroke();
        }
        this.ctx.globalAlpha = 0.2 + Math.sin(t * 2) * 0.15; this.ctx.fillStyle = '#86efac';
        this.ctx.beginPath(); this.ctx.arc(0, -2, 3 + Math.sin(t * 2) * 1.5, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.restore();
    },
    // REVIEW - Checklist being marked with correction effect
    drawCheckEffect(cx, cy, r) {
        const t = this.time;
        this.ctx.save(); this.ctx.translate(cx - 14, cy - 14); this.ctx.globalAlpha = 0.5;
        for (let i = 0; i < 3; i++) {
            const y = i * 11, checkPhase = (t * 0.7 + i * 0.8) % 3;
            this.ctx.strokeStyle = '#f97316'; this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(0, y, 8, 8);
            if (checkPhase > 1) {
                const a = Math.min(1, (checkPhase - 1) * 2);
                this.ctx.globalAlpha = 0.6 * a; this.ctx.strokeStyle = '#f97316'; this.ctx.lineWidth = 2;
                this.ctx.shadowColor = '#f97316'; this.ctx.shadowBlur = 4;
                this.ctx.beginPath(); this.ctx.moveTo(1, y + 4); this.ctx.lineTo(3, y + 7); this.ctx.lineTo(8, y + 1); this.ctx.stroke();
            }
            this.ctx.globalAlpha = 0.3; this.ctx.fillStyle = '#f97316'; this.ctx.fillRect(11, y + 3, 14, 2);
        }
        // Correction sparkle
        const sparkle = Math.sin(t * 4) > 0.8;
        if (sparkle) {
            this.ctx.globalAlpha = 0.4; this.ctx.fillStyle = '#fbbf24';
            this.ctx.shadowColor = '#fbbf24'; this.ctx.shadowBlur = 6;
            const sx = 20 + Math.sin(t * 8) * 3, sy = -5 + Math.cos(t * 6) * 3;
            this.ctx.beginPath();
            for (let p = 0; p < 4; p++) {
                const a = (p / 4) * Math.PI * 2;
                this.ctx.moveTo(sx, sy);
                this.ctx.lineTo(sx + Math.cos(a) * 4, sy + Math.sin(a) * 4);
            }
            this.ctx.stroke();
        }
        this.ctx.restore();
    },

    // PROGRESS - Rising chart bars with celebration lights
    drawChartEffect(cx, cy, r) {
        const t = this.time;
        this.ctx.save(); this.ctx.translate(cx - 14, cy + 8); this.ctx.globalAlpha = 0.5;
        const bars = [0.4, 0.6, 0.5, 0.8, 0.7];
        bars.forEach((h, i) => {
            const barH = h * 22 + Math.sin(t * 2 + i) * 3;
            const grad = this.ctx.createLinearGradient(0, -barH, 0, 0);
            grad.addColorStop(0, '#ffd700'); grad.addColorStop(1, '#b8860b');
            this.ctx.fillStyle = grad; this.ctx.shadowColor = '#ffd700'; this.ctx.shadowBlur = 3;
            this.ctx.fillRect(i * 6, -barH, 4, barH);
        });
        this.ctx.globalAlpha = 0.3; this.ctx.fillStyle = '#ffd700'; this.ctx.fillRect(-2, 0, 32, 1);
        // Celebration particles
        for (let i = 0; i < 3; i++) {
            const px = i * 10, py = -25 - Math.abs(Math.sin(t * 3 + i * 2)) * 8;
            this.ctx.globalAlpha = 0.3 + Math.sin(t * 4 + i) * 0.2;
            this.ctx.fillStyle = '#ffd700'; this.ctx.shadowColor = '#ffd700'; this.ctx.shadowBlur = 4;
            this.ctx.beginPath(); this.ctx.arc(px, py, 1.5, 0, Math.PI * 2); this.ctx.fill();
        }
        this.ctx.restore();
    },

    // CHARACTERS - Arthur & Henrique with breathing, blinking, mouse reaction
    drawCharacters() {
        const cx = this.width * 0.5, cy = this.height * 0.5, t = this.time;
        const breathe = Math.sin(t * 1.5) * 3;
        const blink = Math.sin(t * 0.7) > 0.95;
        // Mouse proximity reaction
        const dx = this.smoothMouseX - cx, dy = this.smoothMouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const lookX = dist < 200 ? dx * 0.003 : 0;
        const lookY = dist < 200 ? dy * 0.002 : 0;
        const excitement = dist < 200 ? Math.sin(t * 6) * 2 : 0;

        this.drawCharacter(cx - 30, cy + 20 + breathe, '#2d3748', '#e2b89b', blink, 0, lookX, lookY, excitement);
        this.drawCharacter(cx + 30, cy + 20 + breathe * 0.8, '#f7fafc', '#d4a574', blink, 0.3, lookX, lookY, excitement);
    },

    drawCharacter(x, y, shirtColor, skinColor, blink, delay, lookX, lookY, excitement) {
        const t = this.time + delay, sway = Math.sin(t * 0.8) * 2;
        this.ctx.save(); this.ctx.translate(x + sway, y); this.ctx.globalAlpha = 0.7;
        // Glow
        const glow = this.ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
        glow.addColorStop(0, 'rgba(100,180,255,0.15)'); glow.addColorStop(1, 'rgba(100,180,255,0)');
        this.ctx.fillStyle = glow; this.ctx.beginPath(); this.ctx.arc(0, 0, 30, 0, Math.PI * 2); this.ctx.fill();
        // Body
        this.ctx.fillStyle = shirtColor; this.ctx.beginPath();
        this.ctx.ellipse(0, 10, 12, 16 + excitement * 0.5, 0, 0, Math.PI * 2); this.ctx.fill();
        // Head
        this.ctx.fillStyle = skinColor; this.ctx.beginPath(); this.ctx.arc(0, -10, 10, 0, Math.PI * 2); this.ctx.fill();
        // Hair
        this.ctx.fillStyle = '#1a1a2e'; this.ctx.beginPath();
        this.ctx.ellipse(0, -15, 10, 5, 0, Math.PI, Math.PI * 2); this.ctx.fill();
        // Eyes
        if (!blink) {
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.beginPath(); this.ctx.arc(-3 + lookX, -11 + lookY, 1.5, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(3 + lookX, -11 + lookY, 1.5, 0, Math.PI * 2); this.ctx.fill();
            // Eye shine
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath(); this.ctx.arc(-2.5 + lookX, -11.5 + lookY, 0.5, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(3.5 + lookX, -11.5 + lookY, 0.5, 0, Math.PI * 2); this.ctx.fill();
        } else {
            this.ctx.strokeStyle = '#1a1a2e'; this.ctx.lineWidth = 1;
            this.ctx.beginPath(); this.ctx.moveTo(-5, -11); this.ctx.lineTo(-1, -11); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.moveTo(1, -11); this.ctx.lineTo(5, -11); this.ctx.stroke();
        }
        // Smile
        this.ctx.strokeStyle = '#1a1a2e'; this.ctx.lineWidth = 0.8;
        this.ctx.beginPath(); this.ctx.arc(0, -8, 3, 0.2, Math.PI - 0.2); this.ctx.stroke();
        this.ctx.restore();
    },

    // CLICK TRANSITION
    onClick(e) {
        if (this.transitioning) return;
        const x = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
        const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;
        for (const [name, z] of Object.entries(this.zones)) {
            const zx = z.x * this.width, zy = z.y * this.height, zw = z.w * this.width, zh = z.h * this.height;
            if (x >= zx && x <= zx + zw && y >= zy && y <= zy + zh) {
                this.transitioning = true; this.transProgress = 0; this.transTarget = name;
                break;
            }
        }
    },

    drawTransition() {
        this.transProgress += 0.03;
        const p = this.transProgress;
        // Zoom effect
        const scale = 1 + p * 0.5;
        const alpha = p;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
        if (p >= 1) {
            this.transitioning = false; this.transProgress = 0;
            const actions = {
                learn: () => typeof selectMode === 'function' && selectMode('learn'),
                quiz: () => typeof selectMode === 'function' && selectMode('quiz'),
                dictation: () => typeof selectMode === 'function' && selectMode('dictation'),
                conversation: () => typeof openConversation === 'function' && openConversation(),
                memory: () => typeof startMemoryGame === 'function' && startMemoryGame(),
                review: () => typeof selectMode === 'function' && selectMode('review'),
                progress: () => typeof openProgress === 'function' && openProgress()
            };
            if (actions[this.transTarget]) actions[this.transTarget]();
        }
    },

    destroy() { this.running = false; }
};
