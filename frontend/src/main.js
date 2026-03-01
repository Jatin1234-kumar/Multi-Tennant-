// Landing bootstrap block: runs initial progress and reveal animations.
const hero = document.querySelector('#hero');
const progressBar = document.querySelector('#progress-bar');
const ctaForm = document.querySelector('#cta-form');

// Progress animation block: simple startup loading indicator.
let progress = 0;
const timer = window.setInterval(() => {
  progress = Math.min(progress + 8, 100);
  progressBar.style.width = `${progress}%`;

  if (progress >= 100) {
    window.clearInterval(timer);
    hero.classList.add('is-ready');
  }
}, 45);

// CTA behavior block: keeps interaction minimal and clear.
ctaForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = ctaForm.querySelector('button');
  button.textContent = 'REQUEST SENT';
});
