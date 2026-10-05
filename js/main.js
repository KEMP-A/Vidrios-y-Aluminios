'use strict';

const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
let videoPage = 0;
let videoItems = [];

videos.forEach(video => {
  video.classList.remove('reveal');
  if (!video.parentElement.classList.contains('play-wrap')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'play-wrap';
    video.parentNode.insertBefore(wrapper, video);
    wrapper.appendChild(video);
  }
  videoItems.push(video.parentElement);

  const playButton = document.createElement('button');
  playButton.className = 'play-btn';
  playButton.type = 'button';
  playButton.setAttribute('aria-label', 'Reproducir video');
  playButton.addEventListener('click', () => {
    video.play().catch(() => {
      playButton.classList.remove('hide');
    });
  });
  video.parentElement.appendChild(playButton);
  video.addEventListener('play', () => playButton.classList.add('hide'));
  video.addEventListener('pause', () => playButton.classList.remove('hide'));
  video.addEventListener('ended', () => playButton.classList.remove('hide'));
});

function getVideosPerPage() {
  return videosPerPageQuery.matches ? 1 : 2;
}

function getVideoPageCount() {
  return Math.max(1, Math.ceil(videoItems.length / getVideosPerPage()));
}

function showVideoPage(index) {
  if (!videoTrack || !videoItems.length) return;
  const pageCount = getVideoPageCount();
  videoPage = (index + pageCount) % pageCount;
  const firstItem = videoItems[videoPage * getVideosPerPage()];
  const offset = firstItem.getBoundingClientRect().left - videoTrack.getBoundingClientRect().left;
  videoTrack.style.transform = `translateX(-${offset}px)`;

  if (videoPrevious) videoPrevious.disabled = pageCount < 2;
  if (videoNext) videoNext.disabled = pageCount < 2;

}

function pauseVisibleVideos() {
  const firstVisible = videoPage * getVideosPerPage();
  videos.forEach((video, index) => {
    if (index >= firstVisible && index < firstVisible + getVideosPerPage()) video.pause();
  });
}

if (videoTrack && videos.length) {
  if (videoPrevious) videoPrevious.addEventListener('click', () => {
    pauseVisibleVideos();
    showVideoPage(videoPage - 1);
  });
  if (videoNext) videoNext.addEventListener('click', () => {
    pauseVisibleVideos();
    showVideoPage(videoPage + 1);
  });

  let previousVideosPerPage = getVideosPerPage();
  const updateVideoLayout = () => {
    const nextVideosPerPage = getVideosPerPage();
    if (nextVideosPerPage !== previousVideosPerPage) {
      videoPage = Math.floor((videoPage * previousVideosPerPage) / nextVideosPerPage);
      previousVideosPerPage = nextVideosPerPage;
    }
    showVideoPage(videoPage);
  };
  if (videosPerPageQuery.addEventListener) {
    videosPerPageQuery.addEventListener('change', updateVideoLayout);
  } else {
    videosPerPageQuery.addListener(updateVideoLayout);
  }
  window.addEventListener('resize', updateVideoLayout, { passive: true });
  showVideoPage(0);
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
