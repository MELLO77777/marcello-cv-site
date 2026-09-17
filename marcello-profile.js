(() => {
  'use strict';
  const chapters = [...document.querySelectorAll('.chapter')];
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const navigation = document.querySelector('.chapter-nav');
  const menu = document.querySelector('.menu-toggle');
  const progress = document.querySelector('.progress');
  const dialog = document.getElementById('resume');
  let returnFocus = null;

  document.querySelectorAll('[data-open-resume]').forEach(button => button.addEventListener('click', () => {
    returnFocus = button;
    dialog.showModal();
  }));
  document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { if (returnFocus) returnFocus.focus(); });
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => {
    if (dialog.open) dialog.close();
    window.print();
  }));
  document.getElementById('download-resume').addEventListener('click', () => {
    const text = ['MARCELLO CUCINIELLO', document.querySelector('.resume-role').textContent,
      'https://www.linkedin.com/in/marcello-cuciniello-b900892b8/',
      ...[...document.querySelectorAll('.resume-block')].map(block => block.innerText)].join('\n\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Marcello-Cuciniello-profilo.txt';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
  function closeMenu() {
    navigation.classList.remove('mobile-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.textContent = 'Menu +';
  }
  menu.addEventListener('click', () => {
    const open = navigation.classList.toggle('mobile-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Chiudi −' : 'Menu +';
  });
  links.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('mobile-open')) { closeMenu(); menu.focus(); }
  });

  // Locally generated point sculpture: six forms, no external dependencies.
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const motionButton = document.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, active = 0, width = 0, height = 0, frame = 0, phase = 0, previous = 0, queued = false;
  let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0;
  const points = [], count = 1700, golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - i / (count - 1) * 2, radius = Math.sqrt(1 - y * y), angle = golden * i;
    points.push({ x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius,
      col: (i % 42) / 41 * 2 - 1, row: Math.floor(i / 42) / 40 * 2 - 1, a: i / count * Math.PI * 36 });
  }
  const shapes = points.map(p => {
    const m = Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
    return [
      [p.x, p.y, p.z],
      [p.x * (1 + .13 * Math.sin(p.y * 12)), p.y, p.z * (1 + .13 * Math.sin(p.y * 12))],
      [p.col * 1.2, .24 * Math.sin(p.col * 4 + p.row * 3) + .11 * Math.cos(p.row * 8), p.row * 1.2],
      [p.x / m * .78, p.y / m * .78, p.z / m * .78],
      [(1 + .24 * Math.cos(p.a * 5)) * Math.cos(p.a), .24 * Math.sin(p.a * 5), (1 + .24 * Math.cos(p.a * 5)) * Math.sin(p.a)],
      [p.x * (.7 + .25 * (p.y + 1)), p.y, p.z * (.7 + .25 * (p.y + 1))]
    ];
  });
  const positions = shapes.map(s => [...s[0]]);
  function updateMotion() {
    motionButton.textContent = 'Movimento · ' + (paused ? 'OFF' : 'ON');
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Animazioni: attiva movimento' : 'Animazioni: disattiva movimento');
  }
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); requestDraw(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); requestDraw(); });
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio; canvas.height = height * ratio;
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    updateScroll(); requestDraw();
  }
  function updateScroll() {
    queued = false;
    let next = 0;
    const mark = innerHeight * .47;
    chapters.forEach((section, index) => { if (section.getBoundingClientRect().top <= mark) next = index; });
    active = next;
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (distance > 0 ? Math.min(100, Math.max(0, scrollY / distance * 100)) : 100) + '%';
    requestDraw();
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  addEventListener('resize', resize);
  addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' && !paused) { pointerX = (event.clientX / width - .5) * .25; pointerY = (event.clientY / height - .5) * .2; }
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    else requestDraw();
  });
  function requestDraw() { if (ctx && !frame && !document.hidden) frame = requestAnimationFrame(draw); }
  function draw(timestamp) {
    frame = 0;
    const elapsed = previous ? Math.min(timestamp - previous, 45) : 16;
    previous = timestamp;
    if (!paused) phase += elapsed * .00009;
    currentX += (pointerX - currentX) * .035; currentY += (pointerY - currentY) * .035;
    ctx.clearRect(0, 0, width, height);
    const mobile = width <= 720;
    const centerX = width * (mobile ? .68 : .77);
    const centerY = mobile ? (active === 0 ? Math.min(height * .77, 650) : height * .49) : height * .48;
    const scale = mobile ? Math.min(width * .52, 220) : Math.min(width * .265, height * .40);
    const theta = phase + (paused ? 0 : currentX), tilt = -.22 + (paused ? 0 : currentY);
    const cs = Math.cos(theta), sn = Math.sin(theta), ct = Math.cos(tilt), st = Math.sin(tilt);
    const projected = [], interpolation = paused ? 1 : 1 - Math.exp(-elapsed * .004);
    const halo = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 1.55);
    halo.addColorStop(0, 'rgba(24,65,160,.12)'); halo.addColorStop(.65, 'rgba(16,51,146,.06)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, width, height);
    const sceneIndex = Number(chapters[active].dataset.scene);
    for (let i = 0; i < count; i++) {
      const p = positions[i], target = shapes[i][sceneIndex] || shapes[i][0];
      for (let n = 0; n < 3; n++) p[n] += (target[n] - p[n]) * interpolation;
      const rx = p[0] * cs + p[2] * sn, rz = -p[0] * sn + p[2] * cs;
      const ry = p[1] * ct - rz * st, z = p[1] * st + rz * ct, perspective = 3.6 / (3.6 - z);
      projected.push({ x: centerX + rx * scale * perspective, y: centerY + ry * scale * perspective, z, size: Math.max(.5, (z + 1.8) * .62), i });
    }
    ctx.lineWidth = .45;
    for (let i = 0; i < count; i += 3) {
      const p = projected[i], q = projected[(i + 34) % count], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < scale * .24 && p.z > -.2 && q.z > -.2) {
        ctx.strokeStyle = 'rgba(75,124,255,' + (.12 * (1 - d / (scale * .24))) + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
    projected.sort((a, b) => a.z - b.z);
    for (const p of projected) {
      const light = Math.max(.12, Math.min(1, (p.z + 1.4) / 2.5));
      ctx.fillStyle = 'rgba(' + Math.round(65 + light * 65) + ',' + Math.round(105 + light * 75) + ',255,' + (light * .9) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      if (p.i % 91 === 0 && p.z > .2) { ctx.fillStyle = 'rgba(160,192,255,.13)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2); ctx.fill(); }
    }
    if (!mobile) { ctx.strokeStyle = 'rgba(117,148,211,.18)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.ellipse(centerX, centerY, scale * 1.35, scale * .33, -.3, 0, Math.PI * 2); ctx.stroke(); }
    if (!paused) requestDraw();
  }
  updateMotion(); resize();
  if (!ctx) motionButton.hidden = true;
})();
