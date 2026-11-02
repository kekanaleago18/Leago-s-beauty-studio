// ============================================================
// ABOUT PAGE: sections fade in as you scroll
// ============================================================
const fadeSections = document.querySelectorAll('.fade-section');

if (fadeSections.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    fadeSections.forEach(function (section) {
        observer.observe(section);
    });
}

// ============================================================
// SERVICES PAGE: accordion
// ============================================================
document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const panel = btn.nextElementSibling;
        const isOpen = panel.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
        panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : null;
    });
});

// ============================================================
// SERVICES PAGE: gallery lightbox
// ============================================================
const lightbox = document.getElementById('lightbox');

if (lightbox) {
    const lightboxImg = document.getElementById('lightbox-img');

    const closeLightbox = function () {
        lightbox.classList.remove('show');
        lightbox.setAttribute('aria-hidden', 'true');
    };

    document.querySelectorAll('.gallery-img').forEach(function (img) {
        img.addEventListener('click', function () {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('show');
            lightbox.setAttribute('aria-hidden', 'false');
        });
    });

    lightbox.addEventListener('click', function (e) {
        if (e.target !== lightboxImg) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
}

// ============================================================
// PRICING PAGE: dynamic content, search, filter and sort
// ============================================================
const pricingGrid = document.getElementById('pricing-grid');

if (pricingGrid) {
    const treatments = [
        { category: 'Facials', name: 'Classic Cleansing Facial', duration: '45 minutes', price: 450 },
        { category: 'Facials', name: 'Deep Hydration Facial', duration: '60 minutes', price: 600 },
        { category: 'Facials', name: 'Anti-Ageing Facial', duration: '60 minutes', price: 750 },
        { category: 'Massages', name: 'Swedish Relaxation Massage', duration: '60 minutes', price: 550 },
        { category: 'Massages', name: 'Deep Tissue Massage', duration: '60 minutes', price: 650 },
        { category: 'Massages', name: 'Hot Stone Massage', duration: '60 minutes', price: 750 },
        { category: 'Nail Care', name: 'Plain Manicure', duration: null, price: 200 },
        { category: 'Nail Care', name: 'Plain Pedicure', duration: null, price: 180 },
        { category: 'Nail Care', name: 'Gel Application', duration: null, price: 150 },
        { category: 'Waxing', name: 'Full Leg Wax', duration: null, price: 330 },
        { category: 'Waxing', name: 'Eyebrow Shaping', duration: null, price: 50 },
        { category: 'Waxing', name: 'Underarm Wax', duration: null, price: 100 }
    ];

    const categories = ['Facials', 'Massages', 'Nail Care', 'Waxing'];
    const searchBox = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const sortSelect = document.getElementById('sort');
    const resultCount = document.getElementById('result-count');

    const sortItems = function (list) {
        const copy = [...list];
        if (sortSelect.value === 'low') copy.sort(function (a, b) { return a.price - b.price; });
        if (sortSelect.value === 'high') copy.sort(function (a, b) { return b.price - a.price; });
        if (sortSelect.value === 'name') copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
        return copy;
    };

    const showPricing = function () {
        const term = searchBox.value.trim().toLowerCase();
        const chosen = categorySelect.value;

        const matches = treatments.filter(function (t) {
            return (chosen === 'all' || t.category === chosen) &&
                   (t.name.toLowerCase().includes(term) || t.category.toLowerCase().includes(term));
        });

        pricingGrid.innerHTML = '';
        resultCount.textContent = matches.length + ' treatment(s) found';

        if (matches.length === 0) {
            pricingGrid.innerHTML = '<p>No treatments match your search. Try a different word.</p>';
            return;
        }

        categories.forEach(function (cat) {
            const items = sortItems(matches.filter(function (t) { return t.category === cat; }));
            if (items.length === 0) return;

            const hasDuration = items.some(function (t) { return t.duration; });
            const section = document.createElement('section');
            section.className = 'pricing-card';

            let html = '<h2>' + cat + '</h2><table><thead><tr><th>Treatment</th>';
            if (hasDuration) html += '<th>Duration</th>';
            html += '<th>Price</th></tr></thead><tbody>';

            items.forEach(function (t) {
                html += '<tr><td>' + t.name + '</td>';
                if (hasDuration) html += '<td>' + (t.duration || '-') + '</td>';
                html += '<td>R' + t.price + '</td></tr>';
            });

            html += '</tbody></table>';
            section.innerHTML = html;
            pricingGrid.appendChild(section);
        });
    };

    searchBox.addEventListener('input', showPricing);
    categorySelect.addEventListener('change', showPricing);
    sortSelect.addEventListener('change', showPricing);

    showPricing();
}

// ============================================================
// ENQUIRY PAGE: validation and response
// ============================================================
const enquiryForm = document.getElementById('enquiry-form');

if (enquiryForm) {
    // Preselect the service if the link has ?service=membership (from the Membership page)
    const params = new URLSearchParams(window.location.search);
    const chosenService = params.get('service');
    if (chosenService) {
        document.getElementById('service').value = chosenService;
    }

    // Prices come from the pricing page
    const priceGuide = {
        'facials': 'R450 to R750 depending on the facial',
        'massages': 'R550 to R750 depending on the massage',
        'nail-care': 'R150 to R200 depending on the treatment',
        'waxing': 'R50 to R330 depending on the area',
        'membership': 'R450 to R1200 per month depending on the tier',
        'other': 'We will send you a personal quote'
    };

    // Change these to match your opening hours
    const openHour = 9;    // opens 09:00
    const closeHour = 17;  // last booking before 17:00
    const closedDay = 0;   // 0 = Sunday

    // Today's date (local time) in YYYY-MM-DD format
    const now = new Date();
    const today = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');

    const dateInput = document.getElementById('preferred-date');
    dateInput.setAttribute('min', today);

    const showEnquiryError = function (field, message) {
        document.getElementById(field + '-error').textContent = message;
        return message === '';
    };

    enquiryForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('full-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.replace(/\s/g, '');
        const service = document.getElementById('service').value;
        const date = dateInput.value;
        const time = document.getElementById('preferred-time').value;

        let dateMessage = '';
        if (date === '') {
            dateMessage = 'Please choose a preferred date.';
        } else if (date < today) {
            dateMessage = 'The date cannot be in the past.';
        }

        let timeMessage = '';
        if (time === '') {
            timeMessage = 'Please choose a preferred time.';
        } else {
            const hour = parseInt(time.split(':')[0], 10);
            if (hour < openHour || hour >= closeHour) {
                timeMessage = 'Please choose a time between ' + openHour + ':00 and ' + closeHour + ':00.';
            }
        }

        const results = [
            showEnquiryError('full-name', name.length < 2 ? 'Please enter your full name.' : ''),
            showEnquiryError('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email address.'),
            showEnquiryError('phone', /^0\d{9}$/.test(phone) ? '' : 'Enter a 10-digit number starting with 0.'),
            showEnquiryError('service', service === '' ? 'Please select a service.' : ''),
            showEnquiryError('preferred-date', dateMessage),
            showEnquiryError('preferred-time', timeMessage)
        ];

        const responseBox = document.getElementById('enquiry-response');

        if (!results.every(function (ok) { return ok; })) {
            responseBox.textContent = '';
            return;
        }

        // Availability check
        const chosenDay = new Date(date + 'T00:00:00').getDay();
        let availability;
        if (chosenDay === closedDay) {
            availability = 'Unfortunately we are closed on Sundays. Please pick another day and submit again.';
        } else {
            availability = 'Good news! We have availability on ' + date + ' at ' + time +
                '. Our team will contact you to confirm your appointment.';
        }

        responseBox.innerHTML =
            '<h2>Thank you, ' + name + '!</h2>' +
            '<p><strong>Estimated cost:</strong> ' + priceGuide[service] + '.</p>' +
            '<p><strong>Availability:</strong> ' + availability + '</p>' +
            '<p>We will reach you on ' + phone + ' or at ' + email + '.</p>';

        if (chosenDay !== closedDay) {
            enquiryForm.reset();
        }
    });
}

// ============================================================
// CONTACT PAGE: interactive map
// ============================================================
if (document.getElementById('map')) {
    // Approximate coordinates. Check them in Google Maps (right-click your address).
    const noordwyk = [-25.9917, 28.1100];
    const waterfall = [-26.0178, 28.1000];

    const map = L.map('map').setView(noordwyk, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker(noordwyk).addTo(map)
        .bindPopup('<strong>Studio 1 - Noordwyk</strong><br>123 Wattle Road<br>Tel: 012 234 5698');
    L.marker(waterfall).addTo(map)
        .bindPopup('<strong>Studio 2 - Waterfall</strong><br>89 Karkloof Crescent<br>Tel: 012 987 6543');

    map.fitBounds([noordwyk, waterfall], { padding: [40, 40] });
}

// ============================================================
// CONTACT PAGE: validation and email
// ============================================================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    const setError = function (field, message) {
        document.getElementById(field + '-error').textContent = message;
        return message === '';
    };

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.replace(/\s/g, '');
        const type = document.getElementById('type').value;
        const message = document.getElementById('message').value.trim();

        const results = [
            setError('name', name.length < 2 ? 'Please enter your full name.' : ''),
            setError('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email address.'),
            setError('phone', /^0\d{9}$/.test(phone) ? '' : 'Enter a 10-digit number starting with 0.'),
            setError('type', type === '' ? 'Please choose a message type.' : ''),
            setError('message', message.length < 10 ? 'Your message must be at least 10 characters.' : '')
        ];

        if (results.every(function (ok) { return ok; })) {
            const subject = encodeURIComponent(type + ' from ' + name);
            const body = encodeURIComponent(
                message + '\n\nName: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone
            );
            document.getElementById('form-status').textContent =
                'Thank you! Your email app will open so you can send the message.';
            window.location.href =
                'mailto:leagobeautystudio@gmail.com?subject=' + subject + '&body=' + body;
        }
    });
}
