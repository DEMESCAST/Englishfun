// city-canvas.js - Canvas Animation Layer for EnglishFun City Map
// Copyright (c) 2026 DEMESCAST. Todos os direitos reservados.

const CityCanvas = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    time: 0,
    mouseX: 0,
    mouseY: 0,
    hoveredZone: null,
    particles: [],
    running: false,

    zones: {
        learn:        { x: 0.12, y: 0.25, w: 0.12, h: 0.15, color: '#3b82f6', glow: 'rgba(59,130,246,' },
        quiz:         { x: 0.42, y: 0.12, w: 0.12, h: 0.15, color: '#a855f7', glow: 'rgba(168,85,247,' },
        dictation:    { x: 0.78, y: 0.18, w: 0.12, h: 0.15, color: '#22d3ee', glow: 'rgba(34,211,238,' },
        conversation: { x: 0.08, y: 0.52, w: 0.12, h: 0.15, color: '#8b5cf6', glow: 'rgba(139,92,246,' },
        memory:       { x: 0.80, y: 0.50, w: 0.12, h: 0.15, color: '#4ade80', glow: 'rgba(74,222,128,' },
        review:       { x: 0.15, y: 0.78, w: 0.12, h: 0.12, color: '#f97316', glow: 'rgba(249,115,22,' },
        progress:     { x: 0.75, y: 0.78, w: 0.12, h: 0.12, color: '#ffd700', glow: 'rgba(255,215,0,' }
    },

    init() {
        this.canvas = document.getElementById('city-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.checkHover();
        });
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
                this.checkHover();
            }
        }, { passive: true });
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onClick(e);
        });
        this.running = true;
        this.animate();
    },

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },

    checkHover() {
        this.hoveredZone = null;
        for (const [name, z] of Object.entries(this.zones)) {
            const zx = z.x * this.width;
            const zy = z.y * this.height;
            const zw = z.w * this.width;
            const zh = z.h * this.height;
            if (this.mouseX >= zx && this.mouseX <= zx + zw && this.mouseY >= zy && this.mouseY <= zy + zh) {
                this.hoveredZone = name;
                break;
            }
        }
    },

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0);
        const y = (e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0);
        for (const [name, z] of Object.entries(this.zones)) {
            const zx = z.x * this.width;
            const zy = z.y * this.height;
            const zw = z.w * this.width;
            const zh = z.h * this.height;
            if (x >= zx && x <= zx + zw && y >= zy && y <= zy + zh) {
                this.onZoneClick(name);
                break;
            }
        }
    },

    onZoneClick(zone) {
        const actions = {
            learn: () => typeof selectMode === 'function' && selectMode('learn'),
            quiz: () => typeof selectMode === 'function' && selectMode('quiz'),
            dictation: () => typeof selectMode === 'function' && selectMode('dictation'),
            conversation: () => typeof openConversation === 'function' && openConversation(),
            memory: () => typeof startMemoryGame === 'function' && startMemoryGame(),
            review: () => typeof selectMode === 'function' && selectMode('review'),
            progress: () => typeof openProgress === 'function' && openProgress()
        };
        if (actions[zone]) actions[zone]();
    },

    animate() {
        if (!this.running) return;
        this.time += 0.016;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawAmbientParticles();
        this.drawZoneEffects();
        this.drawCharacters();
        requestAnimationFrame(() => this.animate());
    },

    // AMBIENT PARTICLES
    drawAmbientParticles() {
        if (Math.random() < 0.04) {
            this.particles.push({
                x: Math.random() * this.width,
                y: this.height + 10,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.3 - Math.random() * 0.6,
                size: 1 + Math.random() * 2.5,
                alpha: 0.3 + Math.random() * 0.5,
                color: ['#3b82f6','#a855f7','#22d3ee','#4ade80','#ffd700'][Math.floor(Math.random()*5)],
                life: 0
            });
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life += 0.016;
            p.alpha -= 0.003;
            if (p.alpha <= 0 || p.y < -20) { this.particles.splice(i, 1); continue; }
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    },

    // ZONE EFFECTS
    drawZoneEffects() {
        for (const [name, z] of Object.entries(this.zones)) {
            const cx = (z.x + z.w / 2) * this.width;
            const cy = (z.y + z.h / 2) * this.height;
            const r = Math.min(z.w, z.h) * this.width * 0.4;
            const isHovered = this.hoveredZone === name;
            const pulse = Math.sin(this.time * 2 + Object.keys(this.zones).indexOf(name)) * 0.3 + 0.7;
            const baseAlpha = isHovered ? 0.5 : 0.15;
            const alpha = baseAlpha * pulse;

            // Outer glow ring
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            const grad = this.ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
            grad.addColorStop(0, z.glow + '0.4)');
            grad.addColorStop(0.5, z.glow + '0.15)');
            grad.addColorStop(1, z.glow + '0)');
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // Pulsing ring
            const ringR = r * (0.6 + pulse * 0.3);
            this.ctx.save();
            this.ctx.globalAlpha = alpha * 0.5;
            this.ctx.strokeStyle = z.color;
            this.ctx.lineWidth = isHovered ? 2 : 1;
            this.ctx.shadowColor = z.color;
            this.ctx.shadowBlur = isHovered ? 15 : 8;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();

            // Zone-specific animations
            if (name === 'learn') this.drawBookEffect(cx, cy, r);
            else if (name === 'quiz') this.drawTargetEffect(cx, cy, r);
            else if (name === 'dictation') this.drawMicWaves(cx, cy, r);
            else if (name === 'conversation') this.drawChatBubbles(cx, cy, r);
            else if (name === 'memory') this.drawBrainEffect(cx, cy, r);
            else if (name === 'review') this.drawCheckEffect(cx, cy, r);
            else if (name === 'progress') this.drawChartEffect(cx, cy, r);
        }
    },

    // LEARN - Book pages turning
    drawBookEffect(cx, cy, r) {
        const t = this.time * 1.5;
        const pageAngle = Math.sin(t) * 0.3;
        this.ctx.save();
        this.ctx.translate(cx, cy - r * 0.2);
        this.ctx.globalAlpha = 0.6;
        // Book body
        this.ctx.fillStyle = '#1e40af';
        this.ctx.fillRect(-12, -8, 24, 16);
        // Pages
        this.ctx.fillStyle = '#e0e7ff';
        this.ctx.save();
        this.ctx.transform(1, 0, pageAngle, 1, 0, 0);
        this.ctx.fillRect(-10, -6, 10, 12);
        this.ctx.restore();
        this.ctx.save();
        this.ctx.transform(1, 0, -pageAngle, 1, 0, 0);
        this.ctx.fillRect(0, -6, 10, 12);
        this.ctx.restore();
        this.ctx.restore();
    },

    // QUIZ - Target pulsing
    drawTargetEffect(cx, cy, r) {
        const t = this.time * 3;
        const pulse = Math.sin(t) * 0.15 + 1;
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.scale(pulse, pulse);
        this.ctx.globalAlpha = 0.5;
        // Target rings
        for (let i = 3; i >= 0; i--) {
            this.ctx.fillStyle = i % 2 === 0 ? '#a855f7' : '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, (4 - i) * 6, 0, Math.PI * 2);
            this.ctx.fill();
        }
        // Center dot
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    },

    // DICTATION - Mic sound waves
    drawMicWaves(cx, cy, r) {
        this.ctx.save();
        this.ctx.translate(cx, cy - r * 0.1);
        this.ctx.globalAlpha = 0.4;
        // Mic body
        this.ctx.fillStyle = '#22d3ee';
        this.ctx.beginPath();
        this.ctx.arc(0, -5, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillRect(-2, 1, 4, 8);
        this.ctx.fillRect(-6, 9, 12, 2);
        // Waves
        for (let i = 1; i <= 3; i++) {
            const waveAlpha = 0.3 - i * 0.08;
            const waveR = 10 + i * 8 + Math.sin(this.time * 4 + i) * 3;
            this.ctx.globalAlpha = waveAlpha;
            this.ctx.strokeStyle = '#22d3ee';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.arc(0, -5, waveR, -0.8, 0.8);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(0, -5, waveR, Math.PI - 0.8, Math.PI + 0.8);
            this.ctx.stroke();
        }
        this.ctx.restore();
    },

    // CONVERSATION - Chat bubbles
    drawChatBubbles(cx, cy, r) {
        const t = this.time;
        const bubbles = [
            { ox: -15, oy: -10, size: 8, delay: 0 },
            { ox: 10, oy: -5, size: 10, delay: 1 },
            { ox: -5, oy: 8, size: 7, delay: 2 }
        ];
        this.ctx.save();
        this.ctx.globalAlpha = 0.45;
        bubbles.forEach((b, i) => {
            const yOff = Math.sin(t * 1.5 + b.delay) * 4;
            const alpha = (Math.sin(t * 2 + b.delay) + 1) / 2 * 0.3 + 0.15;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#8b5cf6';
            this.ctx.shadowColor = '#8b5cf6';
            this.ctx.shadowBlur = 6;
            this.ctx.beginPath();
            this.ctx.arc(cx + b.ox, cy + b.oy + yOff, b.size, 0, Math.PI * 2);
            this.ctx.fill();
            // Tail
            this.ctx.beginPath();
            this.ctx.moveTo(cx + b.ox - 3, cy + b.oy + yOff + b.size);
            this.ctx.lineTo(cx + b.ox + 2, cy + b.oy + yOff + b.size + 5);
            this.ctx.lineTo(cx + b.ox + 5, cy + b.oy + yOff + b.size);
            this.ctx.fill();
        });
        this.ctx.restore();
    },

    // MEMORY - Brain with energy rays
    drawBrainEffect(cx, cy, r) {
        const t = this.time * 2;
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.globalAlpha = 0.5;
        // Brain glow
        const brainGrad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, 15);
        brainGrad.addColorStop(0, 'rgba(74,222,128,0.8)');
        brainGrad.addColorStop(1, 'rgba(74,222,128,0)');
        this.ctx.fillStyle = brainGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.fill();
        // Energy rays
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + t;
            const rayLen = 8 + Math.sin(t + i) * 4;
            this.ctx.globalAlpha = 0.3 + Math.sin(t * 3 + i) * 0.2;
            this.ctx.strokeStyle = '#4ade80';
            this.ctx.lineWidth = 1;
            this.ctx.shadowColor = '#4ade80';
            this.ctx.shadowBlur = 5;
            this.ctx.beginPath();
            this.ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
            this.ctx.lineTo(Math.cos(angle) * (8 + rayLen), Math.sin(angle) * (8 + rayLen));
            this.ctx.stroke();
        }
        this.ctx.restore();
    },

    // REVIEW - Checklist being marked
    drawCheckEffect(cx, cy, r) {
        const t = this.time;
        this.ctx.save();
        this.ctx.translate(cx - 10, cy - 12);
        this.ctx.globalAlpha = 0.45;
        for (let i = 0; i < 3; i++) {
            const y = i * 10;
            const checkPhase = (t * 0.8 + i * 0.7) % 3;
            // Checkbox
            this.ctx.strokeStyle = '#f97316';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(0, y, 7, 7);
            // Check mark
            if (checkPhase > 1) {
                const checkAlpha = Math.min(1, (checkPhase - 1) * 2);
                this.ctx.globalAlpha = 0.6 * checkAlpha;
                this.ctx.strokeStyle = '#f97316';
                this.ctx.lineWidth = 2;
                this.ctx.shadowColor = '#f97316';
                this.ctx.shadowBlur = 4;
                this.ctx.beginPath();
                this.ctx.moveTo(1, y + 4);
                this.ctx.lineTo(3, y + 6);
                this.ctx.lineTo(7, y + 1);
                this.ctx.stroke();
            }
            // Line
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#f97316';
            this.ctx.fillRect(10, y + 2, 14, 2);
        }
        this.ctx.restore();
    },

    // PROGRESS - Rising chart bars
    drawChartEffect(cx, cy, r) {
        const t = this.time;
        this.ctx.save();
        this.ctx.translate(cx - 12, cy + 8);
        this.ctx.globalAlpha = 0.45;
        const bars = [0.4, 0.6, 0.5, 0.8, 0.7];
        bars.forEach((h, i) => {
            const barH = h * 20 + Math.sin(t * 2 + i) * 3;
            const barX = i * 6;
            const grad = this.ctx.createLinearGradient(0, -barH, 0, 0);
            grad.addColorStop(0, '#ffd700');
            grad.addColorStop(1, '#b8860b');
            this.ctx.fillStyle = grad;
            this.ctx.shadowColor = '#ffd700';
            this.ctx.shadowBlur = 3;
            this.ctx.fillRect(barX, -barH, 4, barH);
        });
        // Baseline
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(-2, 0, 30, 1);
        this.ctx.restore();
    },

    // CHARACTERS - Arthur & Henrique
    drawCharacters() {
        const cx = this.width * 0.5;
        const cy = this.height * 0.5;
        const t = this.time;
        const breathe = Math.sin(t * 1.5) * 3;
        const blink = Math.sin(t * 0.5) > 0.97;

        // Arthur (left, black shirt)
        this.drawCharacter(cx - 30, cy + 20 + breathe, '#2d3748', '#e2b89b', blink, 0);
        // Henrique (right, white shirt)
        this.drawCharacter(cx + 30, cy + 20 + breathe * 0.8, '#f7fafc', '#d4a574', blink, 0.3);
    },

    drawCharacter(x, y, shirtColor, skinColor, blink, delay) {
        const t = this.time + delay;
        const sway = Math.sin(t * 0.8) * 2;
        this.ctx.save();
        this.ctx.translate(x + sway, y);
        this.ctx.globalAlpha = 0.7;

        // Body
        this.ctx.fillStyle = shirtColor;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 10, 12, 16, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Head
        this.ctx.fillStyle = skinColor;
        this.ctx.beginPath();
        this.ctx.arc(0, -10, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        if (!blink) {
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.beginPath();
            this.ctx.arc(-3, -11, 1.5, 0, Math.PI * 2);
            this.ctx.arc(3, -11, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = '#1a1a2e';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(-5, -11);
            this.ctx.lineTo(-1, -11);
            this.ctx.moveTo(1, -11);
            this.ctx.lineTo(5, -11);
            this.ctx.stroke();
        }

        // Glow
        this.ctx.globalAlpha = 0.1;
        const glow = this.ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
        glow.addColorStop(0, 'rgba(100,180,255,0.3)');
        glow.addColorStop(1, 'rgba(100,180,255,0)');
        this.ctx.fillStyle = glow;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    },

    destroy() {
        this.running = false;
    }
};
