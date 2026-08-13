/**
 * RENDEZVOUS '26 FESTIVAL APPLICATION LOGIC
 * Dynamic Event Catalog, Live Countdown, Search Modal, Login Portal, & E-Pass Generator
 */

document.addEventListener('DOMContentLoaded', () => {

    // Dark Theme Toggle Switcher Handler with LocalStorage Persistence
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.setAttribute('data-theme', 'dark');
            if (themeIcon) {
                themeIcon.className = 'fa-solid fa-sun';
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
            if (themeIcon) {
                themeIcon.className = 'fa-solid fa-moon';
            }
        }
    }

    // Initialize saved theme preference
    const savedTheme = localStorage.getItem('rendezvousTheme') || 'light';
    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
            localStorage.setItem('rendezvousTheme', newTheme);
            applyTheme(newTheme);
            if (typeof showToast === 'function') {
                showToast(newTheme === 'dark' ? 'Dark Mode Activated 🌙' : 'Light Mode Activated ☀️', newTheme === 'dark' ? 'fa-moon' : 'fa-sun');
            }
        });
    }

    // Sample Festival Events Data
    // PosterGen Style Competition Result Posters Data
    const eventsData = [
        {
            id: 1,
            title: "Poem Malayalam",
            category: "subjunior",
            categoryName: "Sub Junior",
            resultNo: "178",
            winnerCount: 3,
            publishedDate: "23/09/2025",
            grade: "A+ Grade",
            image: "assets/concert.jpg"
        },
        {
            id: 2,
            title: "Calligraphy ARB",
            category: "general",
            categoryName: "General (B)",
            resultNo: "177",
            winnerCount: 3,
            publishedDate: "24/09/2025",
            grade: "A Distinction",
            image: "assets/bento_student.jpg"
        },
        {
            id: 3,
            title: "Qawwali",
            category: "general",
            categoryName: "General (B)",
            resultNo: "176",
            winnerCount: 3,
            publishedDate: "24/09/2025",
            grade: "A+ Distinction",
            image: "assets/dance.jpg"
        },
        {
            id: 4,
            title: "Email Messenger",
            category: "general",
            categoryName: "General (B)",
            resultNo: "175",
            winnerCount: 4,
            publishedDate: "24/09/2025",
            grade: "A Grade",
            image: "assets/robotics.jpg"
        },
    ];

    // State Variables
    let currentCategory = 'all';

    // DOM Elements
    const eventsGrid = document.getElementById('eventsGrid');
    const categoryBtns = document.querySelectorAll('#categoryFilters .filter-btn');
    const posterModal = document.getElementById('posterModal');
    const closePosterModal = document.getElementById('closePosterModal');
    const posterCanvas = document.getElementById('posterCanvas');
    const posterModalTitle = document.getElementById('posterModalTitle');
    const downloadCanvasPosterBtn = document.getElementById('downloadCanvasPosterBtn');
    const sharePosterWhatsappBtn = document.getElementById('sharePosterWhatsappBtn');

    let activePosterEvent = null;

    // Toast Notification System
    function showToast(message, icon = 'fa-circle-check') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Render PosterGen Cards Grid under Category Filters
    function renderEvents() {
        if (!eventsGrid) return;

        eventsGrid.innerHTML = '';

        const filtered = eventsData.filter(event => {
            return (currentCategory === 'all' || event.category === currentCategory);
        });

        if (filtered.length === 0) {
            eventsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.2rem; margin-bottom: 12px; display: block; color: #aaa;"></i>
                    <p style="font-weight: 600; font-size: 0.95rem;">No program results found for this category filter.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(event => {
            const card = document.createElement('div');
            card.className = 'postergen-card';
            card.innerHTML = `
                <div class="postergen-preview-box">
                    <span class="pg-result-no">Result #${event.resultNo}</span>
                    <h4 class="pg-green-title">${event.title}</h4>
                    <span class="pg-sub-cat">${event.categoryName} Category</span>
                    <span class="badge-grade-tag" style="margin-top: 4px; font-weight: 700; color: #4647AE; font-size: 0.74rem;"><i class="fa-solid fa-award"></i> ${event.grade}</span>
                </div>

                <div class="postergen-actions">
                    <button class="pg-btn-view-posters" data-id="${event.id}">
                        <i class="fa-solid fa-eye"></i> Preview
                    </button>
                    <button class="pg-btn-green-download btn-direct-download" data-id="${event.id}">
                        <i class="fa-solid fa-download"></i> Download
                    </button>
                </div>
            `;

            // Download Poster Action (Direct PNG Download)
            card.querySelector('.btn-direct-download').addEventListener('click', () => {
                if (!posterCanvasLight) {
                    openPosterModal(event);
                } else {
                    drawPosterLight(event);
                    const link = document.createElement('a');
                    link.download = `RENDEZVOUS26_${event.title.replace(/\s+/g, '_')}_ResultPoster.png`;
                    link.href = posterCanvasLight.toDataURL('image/png');
                    link.click();
                    showToast(`Result Poster Downloaded! Ready to share!`, 'fa-circle-check');
                }
            });

            // View Poster Themes -> Opens Lightbox Modal
            card.querySelector('.pg-btn-view-posters').addEventListener('click', () => {
                openPosterModal(event);
            });

            eventsGrid.appendChild(card);
        });
    }

    // Category Filter Listeners
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-cat');
            renderEvents();
        });
    });

    renderEvents();

    // Search Modal Handler
    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', () => {
            searchModal.classList.add('active');
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                renderSearchResults('');
            }
        });
    }

    if (closeSearchModal) {
        closeSearchModal.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value);
        });
    }

    function renderSearchResults(query) {
        if (!searchResultsList) return;
        searchResultsList.innerHTML = '';
        const q = query.trim().toLowerCase();

        const matches = eventsData.filter(ev =>
            ev.title.toLowerCase().includes(q) ||
            ev.desc.toLowerCase().includes(q) ||
            ev.tag.toLowerCase().includes(q)
        );

        if (matches.length === 0) {
            searchResultsList.innerHTML = `<p style="padding: 16px; text-align: center; color: var(--text-muted);">No matching events found.</p>`;
            return;
        }

        matches.forEach(ev => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="search-res-info">
                    <h5>${ev.title}</h5>
                    <p>${ev.tag} • ${ev.time}</p>
                </div>
                <span class="badge-pill" style="font-size: 0.75rem; padding: 4px 10px; margin: 0;">${ev.prize}</span>
            `;
            item.addEventListener('click', () => {
                searchModal.classList.remove('active');
                window.location.hash = 'events';
            });
            searchResultsList.appendChild(item);
        });
    }

    // Login Dropdown & Modal Handler
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const loginModalTitle = document.getElementById('loginModalTitle');
    const loginDropdown = document.getElementById('loginDropdown');

    if (loginNavBtn && loginDropdown) {
        loginNavBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loginDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            loginDropdown.classList.remove('show');
        });
    }

    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const role = item.getAttribute('data-role');
            if (loginModalTitle) {
                let iconClass = 'fa-graduation-cap';
                if (role === 'Admin') iconClass = 'fa-user-gear';
                if (role === 'Judge') iconClass = 'fa-gavel';
                loginModalTitle.innerHTML = `<i class="fa-solid ${iconClass} text-purple"></i> ${role} Portal Login`;
            }
            if (loginDropdown) loginDropdown.classList.remove('show');
            if (loginModal) loginModal.classList.add('active');
        });
    });

    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            loginModal.classList.remove('active');
            showToast(`Welcome back! Logged in as ${email}`, 'fa-user-check');
        });
    }

    // Video Teaser Handler
    function openVideo() { if (videoModal) videoModal.classList.add('active'); }
    function closeVideo() { if (videoModal) videoModal.classList.remove('active'); }

    if (playTeaserBtn) playTeaserBtn.addEventListener('click', openVideo);
    if (modalPlayBtn) modalPlayBtn.addEventListener('click', openVideo);
    if (closeVideoModal) closeVideoModal.addEventListener('click', closeVideo);

    // Registration Form & Canvas E-Pass Generator
    if (passForm) {
        passForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('fullName').value;
            const college = document.getElementById('collegeSelect').value;
            const passType = document.getElementById('passType').value;

            generateTicketCanvas(name, college, passType);
            ticketModal.classList.add('active');
            showToast('E-Pass Generated Successfully!', 'fa-ticket');
        });
    }

    if (closeTicketModal) {
        closeTicketModal.addEventListener('click', () => {
            ticketModal.classList.remove('active');
        });
    }

    // Canvas E-Pass Renderer for Rendezvous '26
    function generateTicketCanvas(name, college, passType) {
        const canvas = document.getElementById('ticketCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear Canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Gradient Banner
        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0, '#7c4dff');
        grad.addColorStop(1, '#4361ee');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, 70);

        // Header Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Sora, sans-serif';
        ctx.fillText('RENDEZVOUS FEST 2026 — OFFICIAL PASS', 24, 44);

        // Body Info
        ctx.fillStyle = '#1d192b';
        ctx.font = 'bold 20px Sora, sans-serif';
        ctx.fillText(name.toUpperCase(), 24, 115);

        ctx.fillStyle = '#676375';
        ctx.font = '14px Sora, sans-serif';
        ctx.fillText('COLLEGE: ' + college, 24, 142);
        ctx.fillText('PASS TIER: ' + passType, 24, 168);
        ctx.fillText('DATE: OCT 24 - 26, 2026', 24, 194);

        // Generate Ticket Barcode Line Visual
        ctx.fillStyle = '#1b1926';
        ctx.fillRect(24, 220, 320, 30);

        ctx.fillStyle = '#ffffff';
        for (let i = 30; i < 330; i += Math.floor(Math.random() * 8) + 4) {
            ctx.fillRect(i, 220, 2, 30);
        }

        // Right side QR Code Box Visual
        ctx.fillStyle = '#e8dcf8';
        ctx.fillRect(380, 90, 140, 140);

        ctx.fillStyle = '#5e35b1';
        ctx.font = 'bold 12px Sora, sans-serif';
        ctx.fillText('SCAN AT GATE', 408, 168);

        // Outer Border
        ctx.strokeStyle = '#e6e0f0';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    // Download Ticket Canvas as Image
    if (downloadTicketBtn) {
        downloadTicketBtn.addEventListener('click', () => {
            const canvas = document.getElementById('ticketCanvas');
            if (!canvas) return;
            const link = document.createElement('a');
            link.download = 'RENDEZVOUS26_Student_EPass.png';
            link.href = canvas.toDataURL();
            link.click();
            showToast('E-Pass Download Started!', 'fa-download');
        });
    }

    // Photo Gallery Filtering & Lightbox Modal Handler
    const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const lightboxModal = document.getElementById('lightboxModal');
    const closeLightboxModal = document.getElementById('closeLightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxTag = document.getElementById('lightboxTag');

    galleryFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            galleryFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            galleryCards.forEach(card => {
                const cat = card.getAttribute('data-cat') || '';
                if (filter === 'all' || cat.includes(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            const title = card.querySelector('h4');
            const tag = card.querySelector('.gallery-tag');

            if (lightboxImg && img) lightboxImg.src = img.src;
            if (lightboxTitle && title) lightboxTitle.innerText = title.innerText;
            if (lightboxTag && tag) lightboxTag.innerText = tag.innerText;

            if (lightboxModal) lightboxModal.classList.add('active');
        });
    });

    if (closeLightboxModal) {
        closeLightboxModal.addEventListener('click', () => {
            if (lightboxModal) lightboxModal.classList.remove('active');
        });
    }

    // Animated Increasing Counter Effect for About Fest (Days, Participants, Programmes)
    const counterElements = document.querySelectorAll('.animated-counter');

    function animateCounter(el) {
        if (el.dataset.running === 'true') return;
        el.dataset.running = 'true';
        el.classList.add('counting');
        el.classList.remove('counter-pulse');

        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        if (!target) return;

        const duration = 1800; // 1.8s smooth duration
        const startTime = performance.now();

        function updateCount(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(easeProgress * target);

            el.innerText = current + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(updateCount);
            } else {
                el.innerText = target + suffix;
                el.dataset.running = 'false';
                el.classList.remove('counting');
                el.classList.add('counter-pulse');
                setTimeout(() => el.classList.remove('counter-pulse'), 500);
            }
        }

        window.requestAnimationFrame(updateCount);
    }

    if (counterElements.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                } else {
                    // Reset to 0 when scrolled out of view so count-up re-animates smoothly
                    entry.target.dataset.running = 'false';
                    const suffix = entry.target.getAttribute('data-suffix') || '';
                    entry.target.innerText = '0' + suffix;
                    entry.target.classList.remove('counting', 'counter-pulse');
                }
            });
        }, { threshold: 0.1 });

        counterElements.forEach(el => counterObserver.observe(el));
    }

    // Site-wide Simple Scroll Reveal Observer
    const scrollRevealTargets = document.querySelectorAll('section, .bento-card, .result-card, .gallery-card, .team-card');

    const siteScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.05
    });

    scrollRevealTargets.forEach(target => {
        target.classList.add('reveal-on-scroll');
        siteScrollObserver.observe(target);
    });

    // Interactive Ambient Cursor Motion & Card Tilt
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    if (cursorGlow && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!cursorGlow.classList.contains('active')) {
                cursorGlow.classList.add('active');
            }
        });

        document.addEventListener('mouseleave', () => {
            cursorGlow.classList.remove('active');
        });

        // Smooth Lerp Motion Loop for Ambient Cursor Glow
        function renderCursorMotion() {
            cursorX += (mouseX - cursorX) * 0.12;
            cursorY += (mouseY - cursorY) * 0.12;
            cursorGlow.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            requestAnimationFrame(renderCursorMotion);
        }
        requestAnimationFrame(renderCursorMotion);

        // Subtle 3D Tilt Motion on Cards on Mouse Movement
        const interactiveCards = document.querySelectorAll('.bento-white-card, .result-card, .team-card');
        interactiveCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const tiltX = (y / rect.height) * -7;
                const tiltY = (x / rect.width) * 7;
                card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });
    }

    // Dark Theme Toggle Switcher Handler with LocalStorage Persistence
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');

    // Load saved theme preference
    const savedTheme = localStorage.getItem('rendezvousTheme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('rendezvousTheme', 'light');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
                showToast('Light Mode Activated ☀️', 'fa-sun');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('rendezvousTheme', 'dark');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
                showToast('Dark Mode Activated 🌙', 'fa-moon');
            }
        });
    }

    // Generate Canvas Result Poster & Auto Download
    const posterCanvasLight = document.getElementById('posterCanvasLight');
    const posterCanvasDark = document.getElementById('posterCanvasDark');
    const downloadPosterLightBtn = document.getElementById('downloadPosterLightBtn');
    const downloadPosterDarkBtn = document.getElementById('downloadPosterDarkBtn');
    const closePosterModalFooter = document.getElementById('closePosterModalFooter');

    function generateAndDownloadPoster(event) {
        openPosterModal(event);
    }

    // Open Poster Modal Preview
    function openPosterModal(event) {
        activePosterEvent = event;
        if (posterModalTitle) {
            posterModalTitle.innerText = `Posters for: ${event.title} #${event.id}`;
        }
        drawPosterLight(event);
        drawPosterDark(event);
        if (posterModal) posterModal.classList.add('active');
    }

    if (closePosterModal) {
        closePosterModal.addEventListener('click', () => {
            if (posterModal) posterModal.classList.remove('active');
        });
    }

    if (closePosterModalFooter) {
        closePosterModalFooter.addEventListener('click', () => {
            if (posterModal) posterModal.classList.remove('active');
        });
    }

    if (downloadPosterLightBtn) {
        downloadPosterLightBtn.addEventListener('click', () => {
            if (!activePosterEvent || !posterCanvasLight) return;
            const link = document.createElement('a');
            link.download = `RENDEZVOUS26_${activePosterEvent.title.replace(/\s+/g, '_')}_LightPoster.png`;
            link.href = posterCanvasLight.toDataURL('image/png');
            link.click();
            showToast(`Light Theme Result Poster Downloaded!`, 'fa-circle-check');
        });
    }

    if (downloadPosterDarkBtn) {
        downloadPosterDarkBtn.addEventListener('click', () => {
            if (!activePosterEvent || !posterCanvasDark) return;
            const link = document.createElement('a');
            link.download = `RENDEZVOUS26_${activePosterEvent.title.replace(/\s+/g, '_')}_DarkPoster.png`;
            link.href = posterCanvasDark.toDataURL('image/png');
            link.click();
            showToast(`Dark Cyber Result Poster Downloaded!`, 'fa-circle-check');
        });
    }

    // Draw Light Theme Poster (Theme 1)
    function drawPosterLight(event) {
        if (!posterCanvasLight) return;
        const ctx = posterCanvasLight.getContext('2d');
        const W = posterCanvasLight.width;
        const H = posterCanvasLight.height;

        // White/Light Lavender Gradient Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#ffffff');
        bgGrad.addColorStop(0.6, '#f8f4ff');
        bgGrad.addColorStop(1, '#eee6ff');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Top Purple Gradient Header
        const headGrad = ctx.createLinearGradient(0, 0, W, 0);
        headGrad.addColorStop(0, '#7c4dff');
        headGrad.addColorStop(1, '#651fff');
        ctx.fillStyle = headGrad;
        ctx.fillRect(0, 0, W, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Sora, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("RENDEZVOUS '26", W / 2, 38);

        ctx.fillStyle = '#ffd54f';
        ctx.font = 'bold 12px Sora, sans-serif';
        ctx.fillText("OFFICIAL COMPETITION RESULT", W / 2, 60);

        // Category Tag Pill
        ctx.fillStyle = '#7c4dff';
        ctx.font = 'bold 12px Sora, sans-serif';
        ctx.fillText(event.categoryName.toUpperCase() + " CATEGORY", W / 2, 115);

        // Event Title
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 22px Sora, sans-serif';
        ctx.fillText(event.title, W / 2, 155);

        ctx.fillStyle = '#2e7d32';
        ctx.font = '13px Sora, sans-serif';
        ctx.fillText("Grade: " + event.grade, W / 2, 180);

        // 1st Place Box (Gold Light)
        ctx.fillStyle = '#fffdf0';
        ctx.strokeStyle = '#fbc02d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(25, 205, W - 50, 95, 12);
        else ctx.rect(25, 205, W - 50, 95);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f57f17';
        ctx.font = 'bold 14px Sora, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText("🥇 1st Place Winner", 45, 235);

        ctx.fillStyle = '#111111';
        ctx.font = 'bold 17px Sora, sans-serif';
        ctx.fillText(event.winner, 45, 270);

        // 2nd Place Box (Silver Light)
        ctx.fillStyle = '#f8f9fa';
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(25, 315, W - 50, 85, 12);
        else ctx.rect(25, 315, W - 50, 85);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#616161';
        ctx.font = 'bold 13px Sora, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText("🥈 2nd Place Runner Up", 45, 342);

        ctx.fillStyle = '#111111';
        ctx.font = 'bold 15px Sora, sans-serif';
        ctx.fillText(event.runnerUp, 45, 373);

        // Footer Stamp
        ctx.fillStyle = '#777777';
        ctx.font = '11px Sora, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Jamia Madeenathunnoor • 26th Life Festival", W / 2, 450);
        ctx.fillText("Official Result Verification Seal", W / 2, 470);
    }

    // Draw Dark Cyber Theme Poster (Theme 2)
    function drawPosterDark(event) {
        if (!posterCanvasDark) return;
        const ctx = posterCanvasDark.getContext('2d');
        const W = posterCanvasDark.width;
        const H = posterCanvasDark.height;

        // Dark Background
        ctx.fillStyle = '#0b0914';
        ctx.fillRect(0, 0, W, H);

        // Neon Glow Orbs
        const orb = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, 220);
        orb.addColorStop(0, 'rgba(124, 77, 255, 0.35)');
        orb.addColorStop(0.6, 'rgba(67, 97, 238, 0.15)');
        orb.addColorStop(1, 'rgba(11, 9, 20, 0)');
        ctx.fillStyle = orb;
        ctx.fillRect(0, 0, W, H);

        // Top Gold Header
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Sora, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("RENDEZVOUS '26", W / 2, 45);

        ctx.fillStyle = '#ffd54f';
        ctx.font = 'bold 12px Sora, sans-serif';
        ctx.fillText("OFFICIAL COMPETITION RESULT", W / 2, 68);

        // Category Pill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(W / 2 - 80, 95, 160, 26, 13);
            ctx.fill();
        }
        ctx.fillStyle = '#b388ff';
        ctx.font = 'bold 11px Sora, sans-serif';
        ctx.fillText(event.categoryName.toUpperCase() + " CATEGORY", W / 2, 112);

        // Event Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Sora, sans-serif';
        ctx.fillText(event.title, W / 2, 158);

        ctx.fillStyle = '#81c784';
        ctx.font = '13px Sora, sans-serif';
        ctx.fillText("Grade: " + event.grade, W / 2, 184);

        // 1st Place Gold Dark Box
        ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(25, 205, W - 50, 95, 12);
        else ctx.rect(25, 205, W - 50, 95);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Sora, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText("🥇 1st Place Winner", 45, 235);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px Sora, sans-serif';
        ctx.fillText(event.winner, 45, 270);

        // 2nd Place Silver Dark Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(25, 315, W - 50, 85, 12);
        else ctx.rect(25, 315, W - 50, 85);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold 13px Sora, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText("🥈 2nd Place Runner Up", 45, 342);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Sora, sans-serif';
        ctx.fillText(event.runnerUp, 45, 373);

        // Footer Metadata
        ctx.fillStyle = '#8e8a9f';
        ctx.font = '11px Sora, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Jamia Madeenathunnoor • 26th Life Festival", W / 2, 450);
        ctx.fillText("Official Verified Digital Result Poster", W / 2, 470);
    }

});
