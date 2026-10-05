'use strict';

const gate = document.getElementById('gate');

if (gate) {
  const gateButton = document.getElementById('gateOpen');
  const welcomePanel = document.getElementById('welcomePanel');
  const secondsDisplay = document.getElementById('welcomeSeconds');
  const viewCountDisplay = document.getElementById('gateViewCount');
  const progressBar = document.querySelector('.welcome-progress');
  const welcomeCard = document.querySelector('.welcome-card');
  const canvas = document.getElementById('gateFx');
  const context = canvas?.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const active = gate.dataset.active === 'true';
  const edition = gate.dataset.edition || '1';
  const countdownSeconds = Math.max(1, Number(gate.dataset.seconds) || 15);
  const maxViews = Math.max(1, Math.floor(Number(gate.dataset.maxViews) || 2));
  const storageKey = `inauguracion-jj-views-${edition}`;
  const colors = ['#1f5fbf', '#c9a24a', '#ffffff', '#7ad7f0', '#a78bfa', '#e9d18f'];
  const embedded = window.parent !== window;
  let particles = [];
  let animationRunning = false;
  let countdownTimer;
  let closeTimer;
  let revealTimer;
  let burstTimers = [];
  let viewsUsed = 0;

  function notifyParent() {
    if (!embedded) return;
    const targetOrigin = window.location.protocol === 'file:' ? '*' : window.location.origin;
    window.parent.postMessage({ type: 'inauguracion:close' }, targetOrigin);
  }

  function leaveStandalonePage() {
    if (!embedded) window.location.replace('index.html');
  }

  function removeGate() {
    gate.remove();
    notifyParent();
    leaveStandalonePage();
  }

  function closeGate() {
    window.clearInterval(countdownTimer);
    window.clearTimeout(closeTimer);
    burstTimers.forEach(timer => window.clearTimeout(timer));
    gate.classList.add('done');
    closeTimer = window.setTimeout(removeGate, 1800);
  }

  function resizeCanvas() {
    if (!canvas || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawParticles() {
    if (!canvas || !context) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter(particle => particle.life > 0);

    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.12;
      particle.vx *= 0.99;
      particle.life -= 0.009;
      particle.rotation += particle.spin;

      context.globalAlpha = Math.max(particle.life, 0);
      context.fillStyle = particle.color;
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      if (particle.square) {
        context.fillRect(-particle.radius, -particle.radius / 2, particle.radius * 2, particle.radius);
      } else {
        context.beginPath();
        context.arc(0, 0, particle.radius / 1.4, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    });

    context.globalAlpha = 1;
    if (particles.length) {
      window.requestAnimationFrame(drawParticles);
    } else {
      animationRunning = false;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function scheduleParticles(callback, delay) {
    burstTimers.push(window.setTimeout(callback, delay));
  }

  function addBurst(x, y, count) {
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        radius: 3 + Math.random() * 4,
        color: colors[index % colors.length],
        life: 1,
        rotation: Math.random() * 6,
        spin: Math.random() * 0.4 - 0.2,
        square: Math.random() < 0.5,
      });
    }

    if (!animationRunning) {
      animationRunning = true;
      window.requestAnimationFrame(drawParticles);
    }
  }

  function celebrate() {
    if (!canvas || !context || reducedMotion.matches) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    addBurst(width / 2, height / 2, 140);

    [300, 700, 1100, 1500, 1900, 2300].forEach(delay => {
      scheduleParticles(() => {
        addBurst(width * (0.15 + Math.random() * 0.7), height * (0.15 + Math.random() * 0.4), 90);
      }, delay);
    });

    for (let burst = 0; burst < 5; burst += 1) {
      scheduleParticles(() => {
        for (let index = 0; index < 30; index += 1) {
          particles.push({
            x: Math.random() * width,
            y: -10,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 3,
            radius: 3 + Math.random() * 3,
            color: ['#1f5fbf', '#c9a24a', '#fff'][index % 3],
            life: 1.6,
            rotation: 0,
            spin: Math.random() * 0.3,
            square: true,
          });
        }
        if (!animationRunning) {
          animationRunning = true;
          window.requestAnimationFrame(drawParticles);
        }
      }, 600 + burst * 500);
    }
  }

  function startWelcome() {
    gate.classList.add('cut');
    celebrate();
    revealTimer = window.setTimeout(() => {
      welcomePanel?.classList.add('on');
      welcomeCard?.focus({ preventScroll: true });

      let secondsRemaining = countdownSeconds;
      if (progressBar) {
        progressBar.max = countdownSeconds;
        progressBar.value = countdownSeconds;
      }
      if (secondsDisplay) secondsDisplay.textContent = String(secondsRemaining);
      countdownTimer = window.setInterval(() => {
        secondsRemaining -= 1;
        if (secondsDisplay) secondsDisplay.textContent = String(Math.max(secondsRemaining, 0));
        if (progressBar) progressBar.value = Math.max(secondsRemaining, 0);
        if (secondsRemaining <= 0) closeGate();
      }, 1000);
    }, reducedMotion.matches ? 0 : 1400);
  }

  try {
    const storedViews = Number(window.localStorage.getItem(storageKey) || 0);
    viewsUsed = Number.isSafeInteger(storedViews) && storedViews >= 0 ? storedViews : 0;
  } catch (error) {
    console.error('No se pudo consultar el límite local de la bienvenida; se omitirá para no bloquear el sitio.', error);
    removeGate();
  }

  if (!active || viewsUsed >= maxViews) {
    removeGate();
  } else if (gate.isConnected) {
    viewsUsed += 1;
    try {
      window.localStorage.setItem(storageKey, String(viewsUsed));
    } catch (error) {
      console.error('No se pudo actualizar el contador local de la bienvenida; se omitirá para no bloquear el sitio.', error);
      removeGate();
    }
  }

  if (active && viewsUsed > 0 && viewsUsed <= maxViews && gate.isConnected) {
    if (viewCountDisplay) {
      viewCountDisplay.textContent = `Vistas disponibles en este navegador: ${maxViews - viewsUsed} de ${maxViews}`;
    }
    gate.hidden = false;
    document.body.classList.add('gate-open');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    gateButton?.focus({ preventScroll: true });

    gateButton?.addEventListener('click', () => {
      startWelcome();
    }, { once: true });
  }
}
