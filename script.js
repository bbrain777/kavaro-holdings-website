const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const counters = document.querySelectorAll('.stat-value');

navToggle?.addEventListener('click', () => {
  siteNav?.classList.toggle('nav-open');
});

function animateCounters() {
  counters.forEach((counter) => {
    const target = Number(counter.getAttribute('data-count')) || 0;
    const duration = 1600;
    const startTime = performance.now();

    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      counter.textContent = Math.floor(progress * target);
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        counter.textContent = target;
      }
    };

    requestAnimationFrame(updateValue);
  });
}

function handleScrollAnimations() {
  const statsSection = document.querySelector('#statistics');
  if (!statsSection) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(statsSection);
}

window.addEventListener('DOMContentLoaded', handleScrollAnimations);
