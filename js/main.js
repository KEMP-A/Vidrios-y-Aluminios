'use strict';

const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const welcomeFrame = document.getElementById('welcomeFrame');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

window.addEventListener('message', event => {
  if (!welcomeFrame || event.source !== welcomeFrame.contentWindow) return;
  if (event.data?.type === 'inauguracion:close') welcomeFrame.remove();
});

function updateHeader() {
  if (header) header.classList.toggle('scrolled', window.scrollY > 50);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

function closeNavigation() {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

if (menuToggle && navLinks) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNavigation);
  });

  document.addEventListener('click', event => {
    if (header && !header.contains(event.target)) closeNavigation();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeNavigation();
  });
}

document.querySelectorAll('.reveal').forEach(element => {
  if (!('IntersectionObserver' in window) || prefersReducedMotion.matches) {
    element.classList.add('visible');
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  observer.observe(element);
});

const gallery = document.getElementById('carousel');
const gallerySlides = gallery ? Array.from(gallery.querySelectorAll('.slide')) : [];
let galleryIndex = Math.max(0, gallerySlides.findIndex(slide => slide.classList.contains('active')));
let galleryTimer;

function showGallerySlide(index) {
  if (!gallerySlides.length) return;
  galleryIndex = (index + gallerySlides.length) % gallerySlides.length;
  gallerySlides.forEach((slide, slideIndex) => {
    const active = slideIndex === galleryIndex;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.tabIndex = active ? 0 : -1;
  });
}

function restartGalleryTimer() {
  window.clearInterval(galleryTimer);
  if (gallerySlides.length > 1 && !prefersReducedMotion.matches) {
    galleryTimer = window.setInterval(() => showGallerySlide(galleryIndex + 1), 5000);
  }
}

if (gallerySlides.length) {
  showGallerySlide(galleryIndex);
  const previous = document.getElementById('carPrev');
  const next = document.getElementById('carNext');

  if (previous) previous.addEventListener('click', () => {
    showGallerySlide(galleryIndex - 1);
    restartGalleryTimer();
  });
  if (next) next.addEventListener('click', () => {
    showGallerySlide(galleryIndex + 1);
    restartGalleryTimer();
  });
  restartGalleryTimer();
}

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lbImg');
const closeLightboxButton = document.getElementById('closeLb');
let previousBodyOverflow = '';
let previousFocusedElement = null;

function closeLightbox() {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = previousBodyOverflow;
  if (previousFocusedElement instanceof HTMLElement) previousFocusedElement.focus();
}

function openLightbox(image) {
  if (!lightbox || !lightboxImage) return;
  previousBodyOverflow = document.body.style.overflow;
  previousFocusedElement = image;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || 'Proyecto ampliado';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (closeLightboxButton) closeLightboxButton.focus();
}

gallerySlides.forEach(image => {
  image.addEventListener('click', () => openLightbox(image));
  image.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

if (lightbox) {
  lightbox.setAttribute('aria-hidden', lightbox.classList.contains('open') ? 'false' : 'true');
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target === closeLightboxButton) closeLightbox();
  });
}
if (closeLightboxButton) closeLightboxButton.addEventListener('click', closeLightbox);

const videoTrack = document.getElementById('vcarTrack');
const videos = videoTrack ? Array.from(videoTrack.querySelectorAll('video')) : [];
const videoPrevious = document.getElementById('vPrev');
const videoNext = document.getElementById('vNext');
const videosPerPageQuery = window.matchMedia('(max-width: 850px)');
let videoItems = [];
let videoTransitioning = false;

function addVideoPlayButton(video, isFeatured = false) {
  video.controls = false;
  video.playsInline = true;
  video.muted = false;
  video.volume = 1;
  video.classList.remove('reveal');
  if (!video.parentElement.classList.contains('play-wrap')) {
    const wrapper = document.createElement('div');
    wrapper.className = isFeatured ? 'play-wrap video-featured-wrap' : 'play-wrap';
    video.parentNode.insertBefore(wrapper, video);
    wrapper.appendChild(video);
  }

  const playButton = document.createElement('button');
  playButton.className = 'play-btn';
  playButton.type = 'button';
  playButton.setAttribute('aria-label', 'Reproducir video');
  const videoWrapper = video.parentElement;
  const timeline = document.createElement('div');
  timeline.className = 'video-timeline';
  const elapsedTime = document.createElement('span');
  elapsedTime.className = 'video-time';
  elapsedTime.textContent = '0:00';
  const seekBar = document.createElement('input');
  seekBar.className = 'video-seek';
  seekBar.type = 'range';
  seekBar.min = '0';
  seekBar.max = '0';
  seekBar.step = '0.1';
  seekBar.value = '0';
  seekBar.setAttribute('aria-label', 'Posición del video');
  const volumeControl = document.createElement('div');
  volumeControl.className = 'video-volume-control';
  const volumeButton = document.createElement('button');
  volumeButton.className = 'video-volume-button';
  volumeButton.type = 'button';
  const volumeBar = document.createElement('input');
  volumeBar.className = 'video-volume';
  volumeBar.type = 'range';
  volumeBar.min = '0';
  volumeBar.max = '1';
  volumeBar.step = '0.01';
  volumeBar.value = String(video.muted ? 0 : video.volume);
  volumeBar.setAttribute('aria-label', 'Volumen del video');
  volumeControl.append(volumeButton, volumeBar);
  const totalTime = document.createElement('span');
  totalTime.className = 'video-time';
  totalTime.textContent = '0:00';
  timeline.append(elapsedTime, seekBar, totalTime, volumeControl);

  const formatVideoTime = seconds => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const wholeSeconds = Math.floor(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = String(wholeSeconds % 60).padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };
  const updateTimeline = () => {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    seekBar.max = String(duration);
    seekBar.value = String(Math.min(currentTime, duration));
    elapsedTime.textContent = formatVideoTime(currentTime);
    totalTime.textContent = formatVideoTime(duration);
    seekBar.setAttribute('aria-valuetext', `${formatVideoTime(currentTime)} de ${formatVideoTime(duration)}`);
  };
  const updateVolumeControl = () => {
    const muted = video.muted || video.volume === 0;
    volumeButton.textContent = muted ? '🔇' : '🔊';
    volumeButton.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar video');
    volumeButton.setAttribute('aria-pressed', String(muted));
    volumeBar.value = String(muted ? 0 : video.volume);
  };
  let pointerStart = null;
  let previousVolume = video.volume || 1;
  const playVideo = () => {
    video.play().catch(() => {
      playButton.classList.remove('hide');
    });
  };
  const togglePlayback = () => {
    if (video.paused || video.ended) playVideo();
    else video.pause();
  };
  playButton.addEventListener('click', togglePlayback);
  videoWrapper.append(playButton, timeline);
  seekBar.addEventListener('input', () => {
    const seekTime = Number(seekBar.value);
    if (Number.isFinite(seekTime) && Number.isFinite(video.duration)) {
      video.currentTime = Math.min(Math.max(seekTime, 0), video.duration);
    }
    updateTimeline();
  });
  volumeBar.addEventListener('input', () => {
    const volume = Number(volumeBar.value);
    if (!Number.isFinite(volume)) return;
    video.volume = Math.min(Math.max(volume, 0), 1);
    video.muted = video.volume === 0;
    if (video.volume > 0) previousVolume = video.volume;
    updateVolumeControl();
  });
  volumeButton.addEventListener('click', () => {
    if (video.muted || video.volume === 0) {
      video.volume = previousVolume;
      video.muted = false;
    } else {
      previousVolume = video.volume;
      video.muted = true;
    }
    updateVolumeControl();
  });
  video.addEventListener('volumechange', updateVolumeControl);
  ['durationchange', 'loadedmetadata', 'seeked', 'timeupdate'].forEach(eventName => {
    video.addEventListener(eventName, updateTimeline);
  });
  updateTimeline();
  updateVolumeControl();
  videoWrapper.addEventListener('pointerdown', event => {
    if (!event.isPrimary) return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  videoWrapper.addEventListener('pointerup', event => {
    const start = pointerStart;
    pointerStart = null;
    if (!start || !event.isPrimary || event.pointerId !== start.id) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) return;
    if (event.target instanceof Element && event.target.closest('.play-btn')) return;
    if (event.target instanceof Element && event.target.closest('.video-timeline')) return;

    const bounds = video.getBoundingClientRect();
    if (video.controls && event.clientY >= bounds.bottom - 56) return;
    togglePlayback();
  });
  video.addEventListener('play', () => {
    videoWrapper.classList.add('is-playing');
    playButton.classList.add('hide');
  });
  video.addEventListener('pause', () => {
    videoWrapper.classList.remove('is-playing');
    playButton.classList.remove('hide');
  });
  video.addEventListener('ended', () => {
    videoWrapper.classList.remove('is-playing');
    playButton.classList.remove('hide');
  });
}

const featuredVideo = document.querySelector('.video-destacado');
if (featuredVideo) addVideoPlayButton(featuredVideo, true);

videos.forEach(video => {
  addVideoPlayButton(video);
  videoItems.push(video.parentElement);
});

function getVideosPerPage() {
  return videosPerPageQuery.matches ? 1 : 2;
}

function pauseVisibleVideos() {
  videoItems.slice(0, getVideosPerPage()).forEach(item => {
    item.querySelector('video')?.pause();
  });
}

function moveVideo(direction) {
  if (!videoTrack || videoItems.length < 2 || videoTransitioning) return;
  videoTransitioning = true;
  pauseVisibleVideos();
  const itemsToMove = Math.min(getVideosPerPage(), videoItems.length);
  const distance = videoItems[0].getBoundingClientRect().width * itemsToMove;
  let transitionFallback;
  if (direction < 0) {
    const previousItems = videoItems.splice(-itemsToMove, itemsToMove);
    const firstRemainingItem = videoItems[0] || null;
    videoItems.unshift(...previousItems);
    previousItems.forEach(item => videoTrack.insertBefore(item, firstRemainingItem));
    videoTrack.style.transition = 'none';
    videoTrack.style.transform = `translateX(-${distance}px)`;
  }

  const finishMove = () => {
    if (direction > 0) {
      const nextItems = videoItems.splice(0, itemsToMove);
      nextItems.forEach(item => videoTrack.appendChild(item));
      videoItems.push(...nextItems);
    }
    videoTrack.removeEventListener('transitionend', handleTransitionEnd);
    window.clearTimeout(transitionFallback);
    videoTrack.style.transition = 'none';
    videoTrack.style.transform = 'translateX(0)';
    void videoTrack.offsetWidth;
    videoTrack.style.transition = '';
    videoTransitioning = false;
  };
  const handleTransitionEnd = event => {
    if (event.target === videoTrack && event.propertyName === 'transform') finishMove();
  };

  if (prefersReducedMotion.matches) {
    finishMove();
    return;
  }
  if (direction < 0) void videoTrack.offsetWidth;
  videoTrack.addEventListener('transitionend', handleTransitionEnd);
  transitionFallback = window.setTimeout(finishMove, 600);
  videoTrack.style.transition = '';
  videoTrack.style.transform = direction < 0 ? 'translateX(0)' : `translateX(-${distance}px)`;
}

if (videoTrack && videos.length) {
  if (videoPrevious) videoPrevious.addEventListener('click', () => moveVideo(-1));
  if (videoNext) videoNext.addEventListener('click', () => moveVideo(1));

  const updateVideoLayout = () => {
    videoTrack.style.transition = 'none';
    videoTrack.style.transform = 'translateX(0)';
    void videoTrack.offsetWidth;
    videoTrack.style.transition = '';
  };
  if (videosPerPageQuery.addEventListener) {
    videosPerPageQuery.addEventListener('change', updateVideoLayout);
  } else {
    videosPerPageQuery.addListener(updateVideoLayout);
  }
  window.addEventListener('resize', updateVideoLayout, { passive: true });
  if (videoPrevious) videoPrevious.disabled = videos.length < 2;
  if (videoNext) videoNext.disabled = videos.length < 2;
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLightbox();
});

const form = document.getElementById('formContacto');
const formMessage = document.getElementById('formMsg');

if (form && formMessage) {
  const submitButton = form.querySelector('[type="submit"]');
  const getValue = id => {
    const field = document.getElementById(id);
    return field ? field.value.trim() : '';
  };
  const setFormMessage = (message, success = false) => {
    formMessage.textContent = message;
    formMessage.classList.toggle('ok', success);
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    setFormMessage('');

    const honeypot = document.getElementById('fEmpresa');
    if (honeypot && honeypot.value) return;

    const nombre = getValue('fNombre');
    const telefono = getValue('fTelefono');
    const correo = getValue('fCorreo');
    const tipo = getValue('fTipo');
    const mensaje = getValue('fMensaje');

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]{2,80}$/.test(nombre)) {
      setFormMessage('Ingresa un nombre válido.');
      return;
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(telefono)) {
      setFormMessage('Ingresa un teléfono válido.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo) || correo.length > 100) {
      setFormMessage('Ingresa un correo electrónico válido.');
      return;
    }
    if (!tipo) {
      setFormMessage('Selecciona el tipo de proyecto.');
      return;
    }
    if (mensaje.length < 10 || mensaje.length > 1000) {
      setFormMessage('El mensaje debe tener entre 10 y 1000 caracteres.');
      return;
    }

    let lastSubmission;
    try {
      lastSubmission = Number(window.localStorage.getItem('vmUltimoEnvio') || 0);
    } catch {
      setFormMessage('No se pudo validar el envío en este navegador. Escríbenos por WhatsApp.');
      return;
    }
    if (Date.now() - lastSubmission < 60000) {
      setFormMessage('Espera un momento antes de enviar otra solicitud.');
      return;
    }

    if (submitButton) submitButton.disabled = true;
    try {
      const response = await fetch('https://formspree.io/f/xwlpgzld', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          nombre,
          telefono,
          correo,
          tipo,
          mensaje,
          _subject: `Cotización - ${tipo} - ${nombre}`
        })
      });

      if (!response.ok) {
        setFormMessage('No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp.');
        return;
      }

      form.reset();
      setFormMessage('Gracias. Tu solicitud fue enviada correctamente.', true);
      try {
        window.localStorage.setItem('vmUltimoEnvio', String(Date.now()));
      } catch {
        setFormMessage('Solicitud enviada. No se pudo activar la pausa entre envíos en este navegador.', true);
      }
    } catch {
      setFormMessage('Error de conexión. Revisa tu internet e inténtalo de nuevo.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const whatsappButton = document.getElementById('waFloat');
const whatsappMenu = document.getElementById('waMenu');
const whatsappWrap = document.getElementById('waWrap');

function setWhatsAppMenuOpen(open) {
  if (!whatsappButton || !whatsappMenu) return;
  whatsappMenu.classList.toggle('open', open);
  whatsappButton.setAttribute('aria-expanded', String(open));
}

if (whatsappButton && whatsappMenu) {
  whatsappButton.setAttribute('aria-expanded', 'false');
  whatsappButton.addEventListener('click', () => {
    setWhatsAppMenuOpen(!whatsappMenu.classList.contains('open'));
  });
  document.addEventListener('click', event => {
    if (whatsappWrap && !whatsappWrap.contains(event.target)) setWhatsAppMenuOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setWhatsAppMenuOpen(false);
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.getElementById(id.slice(1));
    if (!target) return;

    event.preventDefault();
    const headerOffset = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
    });
    window.history.replaceState(null, '', id);
  });
});
