// --- START OF FILE animation.js ---

// Wait exactly 100ms to ensure the browser has fully painted the injected HTML
setTimeout(() => {
  
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

  // Force GSAP to recalculate the exact positions of all dynamic elements
  ScrollTrigger.refresh();

  // --- FEATURE 1: 3D MECHANICAL CARD ANIMATIONS ---
  // Selects cards, panels, and the new mission logs
  const cards = gsap.utils.toArray('.card, .panel, .mission-log');
  cards.forEach(card => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 95%', // Triggers slightly earlier for a smoother feel
        toggleActions: 'restart none none none',
      },
      duration: 0.8,
      opacity: 0,
      y: 40,
      rotationX: -15,
      ease: 'power3.out',
      stagger: 0.1
    });
  });

  // --- FEATURE 2: TITLE "DATA-STREAM" REVEAL ---
  const titles = gsap.utils.toArray('.section__title, .display-sm, .display-md, .display-lg');
  titles.forEach(title => {
    // Only apply SplitText if the element actually has text content
    if(title.textContent.trim().length > 0) {
        const split = new SplitText(title, { type: 'chars, words' });
        
        gsap.from(split.chars, {
          scrollTrigger: {
            trigger: title,
            start: 'top 90%',
            toggleActions: 'restart none none none',
          },
          duration: 0.6,
          opacity: 0,
          y: 20,
          scale: 1.2,
          ease: 'back.out(1.7)',
          stagger: 0.03,
        });
    }
  });

  // --- FEATURE 3: LIVE TELEMETRY LOG ---
  const telemetrySection = document.querySelector('#telemetry');
  if (telemetrySection) { // Safety check in case we are on a page without telemetry
      const telemetryLines = gsap.utils.toArray('.telemetry-line');
      
      gsap.from(telemetryLines, {
        scrollTrigger: {
          trigger: telemetrySection,
          start: 'top 85%',
          toggleActions: 'restart none none none',
        },
        opacity: 0,
        x: -20,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.15,
      });
  }

  // --- FEATURE 4: RESOURCE ALLOCATION SCAN-IN ---
  const budgetTable = document.querySelector('table');
  if (budgetTable) {
      const budgetRows = gsap.utils.toArray('table tbody tr');

      gsap.from(budgetRows, {
        scrollTrigger: {
          trigger: budgetTable,
          start: 'top 85%',
          toggleActions: 'restart none none none',
        },
        duration: 0.8,
        opacity: 0,
        stagger: 0.2,
        onComplete: () => {
          gsap.to('.text-orange', {
              duration: 1,
              scrambleText: { text: "¥1,000 / mo", chars: "0123456789,.¥/", speed: 0.3 },
              ease: "none"
          });
        }
      });
  }

  // One final refresh just to be absolutely certain everything is locked in
  ScrollTrigger.refresh();

}, 100);