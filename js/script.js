/* Crea8ive Minds — shared behavior */
document.addEventListener('DOMContentLoaded', function () {

  /* ---- Custom cursor ring (desktop / fine-pointer only) ---- */
  if (window.matchMedia('(pointer: fine)').matches) {
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.innerHTML = '<span></span>';
    document.body.appendChild(ring);
    var ringLabel = ring.querySelector('span');

    var mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    (function tick() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    })();

    var magneticSelector = 'a, button, .pill-btn, .circle-btn, .filter-btn, .work-card, .tile, input, textarea, select';
    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest(magneticSelector);
      if (!target) return;
      ring.classList.add('grow');
      ringLabel.textContent = target.getAttribute('data-cursor') || (target.classList.contains('work-card') ? 'View' : '');
    });
    document.addEventListener('mouseout', function (e) {
      var target = e.target.closest(magneticSelector);
      if (!target) return;
      ring.classList.remove('grow');
      ringLabel.textContent = '';
    });
  }

  /* ---- Splash screen (home page only) ---- */
  var splash = document.querySelector('.splash');
  if (splash) {
    var finishSplash = function () {
      splash.classList.add('hide');
      document.body.style.overflow = '';
    };
    document.body.style.overflow = 'hidden';
    if (sessionStorage.getItem('cm_splash_seen')) {
      splash.classList.add('hide');
      document.body.style.overflow = '';
    } else {
      window.addEventListener('load', function () {
        setTimeout(function () {
          finishSplash();
          sessionStorage.setItem('cm_splash_seen', '1');
        }, 1900);
      });
      // fail-safe in case load event is delayed
      setTimeout(finishSplash, 3500);
    }
  }

  /* ---- Sticky header state ---- */
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');
  var overlay = document.querySelector('.nav-overlay');
  function closeMenu() {
    toggle && toggle.classList.remove('open');
    panel && panel.classList.remove('open');
    overlay && overlay.classList.remove('open');
  }
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      overlay && overlay.classList.toggle('open', isOpen);
    });
    overlay && overlay.addEventListener('click', closeMenu);
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var counted = new WeakSet();
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !counted.has(entry.target)) {
          counted.add(entry.target);
          animateCount(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased * 10) / 10;
      el.textContent = (Number.isInteger(target) ? Math.round(value) : value) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---- Progress bars ---- */
  var bars = document.querySelectorAll('[data-progress]');
  if ('IntersectionObserver' in window && bars.length) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.getAttribute('data-progress') + '%';
          pio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (el) { pio.observe(el); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- Work filter (portfolio page) ---- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var workCards = document.querySelectorAll('[data-category]');
  if (filterBtns.length && workCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        workCards.forEach(function (card) {
          var show = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---- Set active nav link ---- */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Contact form (Sends email & redirects to WhatsApp) ---- */
  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var name = document.querySelector('#name').value;
      var phone = document.querySelector('#phone').value;
      var email = document.querySelector('#email').value;
      var service = document.querySelector('#service').value;
      var message = document.querySelector('#message').value;
      var note = document.querySelector('#form-note');
      
      if (note) {
        note.textContent = 'Sending your enquiry...';
        note.style.color = '#ffa500';
      }

      // 1. Send Email using FormSubmit (AJAX)
      fetch('https://formsubmit.co/ajax/crea8ivemindsad@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Name: name,
          Phone: phone,
          Email: email,
          Service: service,
          Message: message
        })
      })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (note) {
          note.textContent = 'Enquiry sent successfully via Email! Opening WhatsApp to connect directly...';
          note.style.color = '#4caf50';
        }
      })
      .catch(function (error) {
        console.error('Error sending email:', error);
        if (note) {
          note.textContent = 'Email dispatch paused, opening WhatsApp to continue your enquiry...';
          note.style.color = '#ff9800';
        }
      });

      // 2. Open WhatsApp Enquiry
      var whatsappNumber = '918548882878';
      var whatsappText = 'Hello Crea8ive Minds, I would like to make an enquiry:\n\n' +
        '*Name:* ' + name + '\n' +
        '*Phone:* ' + phone + '\n' +
        '*Email:* ' + email + '\n' +
        '*Service:* ' + service + '\n' +
        '*Message:* ' + message;
        
      var whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(whatsappText);
      
      // Delay opening WhatsApp slightly to allow fetch request to start
      setTimeout(function () {
        window.open(whatsappUrl, '_blank');
        form.reset();
      }, 1000);
    });
  }

});
