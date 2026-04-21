/*
  AAA static rebuild (no CMS)
  - Accessible tabs
  - Accessible accordions
  - Small progressive enhancements
*/


(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Tabs (ARIA + keyboard)
document.querySelectorAll('[data-tabs]').forEach((tabsEl) => {
  const tabButtons = Array.from(tabsEl.querySelectorAll('[role="tab"]'));
  const panels = tabButtons
    .map((btn) => document.getElementById(btn.getAttribute('aria-controls')))
    .filter(Boolean);

  function activateTab(nextBtn, { focus = true } = {}) {
    tabButtons.forEach((btn) => {
      const selected = btn === nextBtn;
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      btn.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });

    if (focus) nextBtn.focus();

    // opzionale: aggiorna hash (#tab-xxx) senza saltare la pagina
    if (nextBtn.id) history.replaceState(null, '', `#${nextBtn.id}`);
  }

  // init: mostra il pannello del tab selezionato (o il primo)
  const initiallySelected =
    tabButtons.find((b) => b.getAttribute('aria-selected') === 'true') || tabButtons[0];

  // se URL contiene #tab-..., attivalo
  const hash = window.location.hash.replace('#', '');
  const hashBtn = tabButtons.find((b) => b.id === hash);
  activateTab(hashBtn || initiallySelected, { focus: false });

  tabButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => activateTab(btn));

    btn.addEventListener('keydown', (e) => {
      const key = e.key;

      // frecce: navigazione tra tab
      if (key === 'ArrowRight' || key === 'ArrowLeft') {
        e.preventDefault();
        const dir = key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (idx + dir + tabButtons.length) % tabButtons.length;
        activateTab(tabButtons[nextIndex]);
      }

      // Home/End
      if (key === 'Home') {
        e.preventDefault();
        activateTab(tabButtons[0]);
      }
      if (key === 'End') {
        e.preventDefault();
        activateTab(tabButtons[tabButtons.length - 1]);
      }
    });
  });
});

  // Accordion: toggle panels using aria-expanded + hidden
document.querySelectorAll('[data-accordion]').forEach((acc) => {
  const headers = acc.querySelectorAll('.acc-header');

  headers.forEach((btn) => {
    const panel = btn.nextElementSibling;
    if (!panel) return;

    // stato iniziale: se aria-expanded non è true, nascondo
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    panel.hidden = !expanded;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  });
});


  // Basic contact form validation (client-side only)
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const required = $$('[required]', form);
      const invalid = required.filter(el => !String(el.value || '').trim());

      // Clear previous errors
      $$('[data-error]', form).forEach(el => (el.textContent = ''));
      required.forEach(el => el.classList.remove('is-invalid'));

      if (invalid.length) {
        invalid.forEach(el => {
          el.classList.add('is-invalid');
          const err = $(`[data-error-for="${el.name}"]`, form);
          if (err) err.textContent = 'This field is required.';
        });
        invalid[0].focus();
        return;
      }

      // Demo-only: show a success message
      const success = $('#contact-success');
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.reset();
    });
  }

  // Map: members by European country
  const mapEl = document.getElementById('members-europe-map');
  if (mapEl && window.L) {
    const map = L.map(mapEl, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([50.0, 10.0], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const createPinIcon = (color) => L.divIcon({
      className: 'map-pin-wrapper',
      html: `<span class="map-pin" style="--pin:${color}"><span class="map-pin-core"></span></span>`,
      iconSize: [22, 30],
      iconAnchor: [11, 30],
      popupAnchor: [0, -26]
    });

    const countryMembers = [
      {
        country: 'United Kingdom',
        coords: [54.5, -2.5],
        color: '#2E7D32',
        institutions: [
          { name: 'Business Connect / Innovate UK', url: 'https://iuk-business-connect.org.uk/' },
          { name: 'Durham University', url: 'https://www.durham.ac.uk/' },
          { name: 'Edge Hill University', url: 'https://www.edgehill.ac.uk/' },
          { name: 'Ulster University', url: 'https://www.ulster.ac.uk/' }
        ]
      },
      {
        country: 'Italy',
        coords: [42.5, 12.5],
        color: '#C62828',
        institutions: [
          { name: 'Universita della Calabria', url: 'https://www.unical.it/' },
          { name: 'Universita degli Studi di Salerno', url: 'https://www.unisa.it/' }
        ]
      },
      {
        country: 'Greece',
        coords: [39.1, 22.9],
        color: '#1565C0',
        institutions: [
          { name: 'Euro Academy of Active Learning', url: 'https://eaal.edu.gr/en/' }
        ]
      },
      {
        country: 'Spain',
        coords: [40.3, -3.7],
        color: '#EF6C00',
        institutions: [
          { name: 'Libelium Lab', url: 'https://libelium.com/' }
        ]
      }
    ];

    const bounds = L.latLngBounds(countryMembers.map(({ coords }) => coords));
    map.fitBounds(bounds.pad(0.8), { maxZoom: 4 });

    countryMembers.forEach(({ country, coords, institutions, color }) => {
      const uniqueInstitutions = Array.from(
        new Map(institutions.map((item) => [item.name, item])).values()
      );
      const institutionsList = uniqueInstitutions
        .map(({ name, url }) => `<li><a href="${url}" target="_blank" rel="noreferrer noopener">${name}</a></li>`)
        .join('');

      L.marker(coords, { icon: createPinIcon(color) })
        .addTo(map)
        .bindPopup(`<strong>${country}</strong><ul class="map-popup-list">${institutionsList}</ul>`);
    });
  }
})();
