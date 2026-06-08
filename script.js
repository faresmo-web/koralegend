// Language Management
const currentLang = 'ar';

document.addEventListener('DOMContentLoaded', function() {
    // Show loading indicator at page start
    showPageLoading();
    
    // Update copyright year dynamically
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('[data-en], [data-ar]').forEach(element => {
        let enText = element.getAttribute('data-en');
        let arText = element.getAttribute('data-ar');
        
        if (enText && enText.includes('YEAR')) {
            enText = enText.replace(/YEAR/g, currentYear);
            element.setAttribute('data-en', enText);
        }
        if (arText && arText.includes('YEAR')) {
            arText = arText.replace(/YEAR/g, currentYear);
            element.setAttribute('data-ar', arText);
        }

        // If the element has class footer-text or is indeed a copyright/year element, update its textContent directly!
        if (element.classList.contains('footer-text') || (enText && enText.includes(currentYear)) || (arText && arText.includes(currentYear))) {
            const isEn = document.documentElement.lang === 'en';
            if (isEn && enText) {
                element.textContent = enText;
            } else if (arText) {
                element.textContent = arText;
            } else {
                element.textContent = element.textContent.replace(/20\d{2}/g, currentYear);
            }
        }
    });
    
    
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        console.log('✅ Menu toggle initialized');
        menuToggle.addEventListener('click', function(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            console.log('🔄 Toggle clicked');
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            console.log('Active class:', menuToggle.classList.contains('active'));
        });
        
        // Close menu when clicking outside of it
        document.addEventListener('click', function(event) {
            setTimeout(() => {
                const isClickInside = mainNav.contains(event.target) || menuToggle.contains(event.target);
                if (!isClickInside && mainNav.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                }
            }, 10);
        });
        
        // Close menu when clicking a nav-link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    } else {
        console.warn('❌ Menu toggle or mainNav not found', { menuToggle, mainNav });
    }
    
    // Setup navigation listeners for page transitions
    setupNavigationListeners();
    
    // Load page-specific content
    loadPageContent();
    
    // Hide loading indicator after content is loaded
    setTimeout(() => {
        hidePageLoading();
    }, 800);
});

function loadPageContent() {
    // Determine which page we're on and load appropriate content
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path === '') {
        loadHomeContent();
    } else if (path.includes('matches.html') || path.endsWith('/matches') || path === '/matches') {
        if (typeof loadMatchesContent === 'function') {
            loadMatchesContent();
        }
    } else if (path.includes('news.html') || path.endsWith('/news') || path === '/news') {
        if (typeof loadNewsContent === 'function') {
            loadNewsContent();
        }
    } else if (path.includes('legends.html') || path.endsWith('/legends') || path === '/legends') {
        if (typeof loadLegendsContent === 'function') {
            loadLegendsContent();
        }
    } else if (path.includes('leagues.html') || path.endsWith('/leagues') || path === '/leagues') {
        if (typeof loadLeaguesContent === 'function') {
            loadLeaguesContent();
        }
    }
}

// Home Page Content
function loadHomeContent() {
    loadTodayResults();
    loadUpcomingMatches();
    loadBreakingNews();
}

// Today's Results Data
const todayResultsData = {
    en: [
        {
            league: 'Premier League',
            homeTeam: 'Liverpool',
            homeLogo: '🔴',
            homeScore: 3,
            awayTeam: 'Manchester City',
            awayLogo: '🔵',
            awayScore: 1,
            status: 'Finished',
            time: 'FT'
        },
        {
            league: 'La Liga',
            homeTeam: 'Real Madrid',
            homeLogo: '⚪',
            homeScore: 2,
            awayTeam: 'Barcelona',
            awayLogo: '🔴',
            awayScore: 2,
            status: 'Finished',
            time: 'FT'
        },
        {
            league: 'Saudi Pro League',
            homeTeam: 'Al Nassr',
            homeLogo: '💛',
            homeScore: 4,
            awayTeam: 'Al Hilal',
            awayLogo: '🔵',
            awayScore: 2,
            status: 'Finished',
            time: 'FT'
        }
    ],
    ar: [
        {
            league: 'الدوري الإنجليزي',
            homeTeam: 'ليفربول',
            homeLogo: '🔴',
            homeScore: 3,
            awayTeam: 'مانشستر سيتي',
            awayLogo: '🔵',
            awayScore: 1,
            status: 'انتهت',
            time: 'نهاية'
        },
        {
            league: 'الدوري الإسباني',
            homeTeam: 'ريال مدريد',
            homeLogo: '⚪',
            homeScore: 2,
            awayTeam: 'برشلونة',
            awayLogo: '🔴',
            awayScore: 2,
            status: 'انتهت',
            time: 'نهاية'
        },
        {
            league: 'دوري روشن السعودي',
            homeTeam: 'النصر',
            homeLogo: '💛',
            homeScore: 4,
            awayTeam: 'الهلال',
            awayLogo: '🔵',
            awayScore: 2,
            status: 'انتهت',
            time: 'نهاية'
        }
    ]
};

function loadTodayResults() {
    const container = document.getElementById('todayResults');
    if (!container) return;
    
    const results = todayResultsData[currentLang];
    container.innerHTML = '';
    
    results.forEach((match, index) => {
        const card = createMatchCard(match, 'result');
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
}

// Upcoming Matches Data
const upcomingMatchesData = {
    en: [
        {
            league: 'Champions League',
            homeTeam: 'Bayern Munich',
            homeLogo: '🔴',
            awayTeam: 'Paris SG',
            awayLogo: '🔵',
            date: 'Tomorrow',
            time: '20:00'
        },
        {
            league: 'Premier League',
            homeTeam: 'Arsenal',
            homeLogo: '🔴',
            awayTeam: 'Chelsea',
            awayLogo: '🔵',
            date: 'Tomorrow',
            time: '17:30'
        },
        {
            league: 'Saudi Pro League',
            homeTeam: 'Al Ittihad',
            homeLogo: '⚫',
            awayTeam: 'Al Ahli',
            awayLogo: '💚',
            date: 'Tomorrow',
            time: '19:00'
        }
    ],
    ar: [
        {
            league: 'دوري أبطال أوروبا',
            homeTeam: 'بايرن ميونخ',
            homeLogo: '🔴',
            awayTeam: 'باريس سان جيرمان',
            awayLogo: '🔵',
            date: 'غداً',
            time: '20:00'
        },
        {
            league: 'الدوري الإنجليزي',
            homeTeam: 'أرسنال',
            homeLogo: '🔴',
            awayTeam: 'تشيلسي',
            awayLogo: '🔵',
            date: 'غداً',
            time: '17:30'
        },
        {
            league: 'دوري روشن السعودي',
            homeTeam: 'الاتحاد',
            homeLogo: '⚫',
            awayTeam: 'الأهلي',
            awayLogo: '💚',
            date: 'غداً',
            time: '19:00'
        }
    ]
};

function loadUpcomingMatches() {
    const container = document.getElementById('upcomingMatches');
    if (!container) return;
    
    const matches = upcomingMatchesData[currentLang];
    container.innerHTML = '';
    
    matches.forEach((match, index) => {
        const card = createMatchCard(match, 'upcoming');
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
}

function createMatchCard(match, type) {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.style.animation = 'slideUp 0.6s ease-out backwards';
    
    const renderLogo = (logo, teamName) => {
        if (!logo) return '<span class="emoji-logo">⚽</span>';
        if (logo.startsWith('http') || logo.startsWith('/') || logo.startsWith('data:')) {
            return `<img src="${logo}" alt="${teamName}" class="team-logo-img" loading="lazy" style="width: 24px; height: 24px; object-fit: contain; border-radius: 4px;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' width=\\'24\\' height=\\'24\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\' fill=\\'%23666\\'/></svg>';">`;
        }
        return `<span class="emoji-logo">${logo}</span>`;
    };
    
    if (type === 'result') {
        card.innerHTML = `
            <div class="match-league">${match.league}</div>
            <div class="match-teams">
                <div class="team">
                    <div class="team-logo">${renderLogo(match.homeLogo, match.homeTeam)}</div>
                    <div class="team-name">${match.homeTeam}</div>
                </div>
                <div class="match-score">
                    <span>${match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '-'}</span>
                    <span class="match-vs">-</span>
                    <span>${match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '-'}</span>
                </div>
                <div class="team">
                    <div class="team-logo">${renderLogo(match.awayLogo, match.awayTeam)}</div>
                    <div class="team-name">${match.awayTeam}</div>
                </div>
            </div>
            <div class="match-time">${match.time}</div>
            <div style="text-align: center;">
                <span class="match-status status-finished">${match.status}</span>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="match-league">${match.league}</div>
            <div class="match-teams">
                <div class="team">
                    <div class="team-logo">${renderLogo(match.homeLogo, match.homeTeam)}</div>
                    <div class="team-name">${match.homeTeam}</div>
                </div>
                <div class="match-score">
                    <span class="match-vs">VS</span>
                </div>
                <div class="team">
                    <div class="team-logo">${renderLogo(match.awayLogo, match.awayTeam)}</div>
                    <div class="team-name">${match.awayTeam}</div>
                </div>
            </div>
            <div class="match-date">${match.date} - ${match.time}</div>
            <div style="text-align: center;">
                <span class="match-status status-upcoming">${currentLang === 'en' ? 'Upcoming' : 'قادمة'}</span>
            </div>
        `;
    }
    
    return card;
}

// Breaking News Data
const breakingNewsData = {
    en: [
        {
            category: 'Transfer',
            title: 'Star Player Signs with Manchester United',
            description: 'In a shocking move, the talented midfielder has joined the Red Devils on a five-year contract.',
            date: '2 hours ago',
            icon: '📰'
        },
        {
            category: 'International',
            title: 'World Cup Qualifiers: Exciting Matches Ahead',
            description: 'National teams prepare for crucial qualifying matches that will determine World Cup participants.',
            date: '5 hours ago',
            icon: '🌍'
        },
        {
            category: 'Local',
            title: 'Derby Match Ends in Dramatic Fashion',
            description: 'Last-minute goal secures victory in the most anticipated match of the season.',
            date: '1 day ago',
            icon: '⚽'
        }
    ],
    ar: [
        {
            category: 'انتقالات',
            title: 'نجم كبير ينضم لمانشستر يونايتد',
            description: 'في خطوة مفاجئة، انضم لاعب الوسط الموهوب للشياطين الحمر بعقد لمدة خمس سنوات.',
            date: 'منذ ساعتين',
            icon: '📰'
        },
        {
            category: 'دولية',
            title: 'تصفيات كأس العالم: مباريات مثيرة قادمة',
            description: 'المنتخبات الوطنية تستعد لمباريات حاسمة ستحدد المشاركين في كأس العالم.',
            date: 'منذ 5 ساعات',
            icon: '🌍'
        },
        {
            category: 'محلية',
            title: 'الديربي ينتهي بشكل دراماتيكي',
            description: 'هدف في الدقائق الأخيرة يحسم المباراة الأكثر انتظاراً في الموسم.',
            date: 'منذ يوم',
            icon: '⚽'
        }
    ]
};

function loadBreakingNews() {
    const container = document.getElementById('breakingNews');
    if (!container) return;
    
    const news = breakingNewsData[currentLang];
    container.innerHTML = '';
    
    news.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.animation = 'slideUp 0.6s ease-out backwards';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const imageHtml = item.image 
            ? `<img src="${item.image}" alt="${item.title}" class="news-image-img" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' width=\\'105\\' height=\\'80\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23222\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23666\\' font-family=\\'sans-serif\\' font-size=\\'12\\'>Kora Legend</text></svg>';">` 
            : `<span style="font-size: 2.5rem;">${item.icon || '📰'}</span>`;
        
        const cardContent = `
            <div class="news-image" style="height: 150px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); overflow: hidden;">${imageHtml}</div>
            <div class="news-content">
                <span class="news-category">${item.category}</span>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-description">${item.description}</p>
                <div class="news-date">${item.date}</div>
            </div>
        `;
        
        if (item.link) {
            const anchor = document.createElement('a');
            anchor.href = item.link;
            anchor.target = '_blank';
            anchor.className = 'news-card-link';
            anchor.style.textDecoration = 'none';
            anchor.style.color = 'inherit';
            anchor.appendChild(card);
            card.innerHTML = cardContent;
            container.appendChild(anchor);
        } else {
            card.innerHTML = cardContent;
            container.appendChild(card);
        }
    });
}

// ============================================================
// Loading Indicator Management
// ============================================================

/**
 * Show page loading indicator
 */
function showPageLoading() {
    let loadingEl = document.getElementById('pageLoading');
    if (!loadingEl) {
        // Create loading element if it doesn't exist
        loadingEl = document.createElement('div');
        loadingEl.id = 'pageLoading';
        loadingEl.className = 'page-loading';
        loadingEl.innerHTML = `
            <div class="loading-wrapper">
                <p class="loading-title">KORA LEGEND</p>
                <div class="underline-track">
                    <div class="underline-bar"></div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingEl);
    }
    
    loadingEl.classList.remove('hidden', 'fade-out');
}

/**
 * Hide page loading indicator with fade out
 */
function hidePageLoading() {
    const loadingEl = document.getElementById('pageLoading');
    if (!loadingEl) return;
    
    loadingEl.classList.add('fade-out');
    setTimeout(() => {
        loadingEl.classList.add('hidden');
    }, 500);
}

/**
 * Setup navigation link listeners for page transitions
 */
function setupNavigationListeners() {
    const navLinks = document.querySelectorAll('a[href]:not([href^="http"]):not([href^="#"]):not([href^="javascript"]):not([href*="mailto:"])');
    
    navLinks.forEach(link => {
        // Skip if link has data-no-loading attribute
        if (link.hasAttribute('data-no-loading')) return;
        
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip for hash links
            if (href.startsWith('#')) return;
            
            // Show loading when navigating to another page
            if (!href.startsWith('http')) {
                e.preventDefault();
                showPageLoading();
                
                // Navigate after a short delay
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });
}


// Utility Functions
function formatDate(date) {
    return currentLang === 'en' 
        ? date.toLocaleDateString('ar-SA') 
        : date.toLocaleDateString('en-US');
}

function formatTime(time) {
    return time;
}

// ============================================================
//  Push Notification Management
// ============================================================

const PUSH_BTN_ID  = 'koraNotifBtn';
const PUSH_SW_PATH = '/service-worker.js';

// ── Helper: show a toast message ─────────────────────────────
function showPushToast(msg, isError = false) {
    let toast = document.getElementById('pushToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'pushToast';
        toast.className = 'push-toast';
        document.body.appendChild(toast);
    }
    toast.className = 'push-toast' + (isError ? ' error' : '');
    toast.innerHTML = (isError ? '⚠️' : '✅') + ' <span>' + msg + '</span>';
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ── Helper: URL-safe base64 → Uint8Array (for VAPID key) ─────
function urlBase64ToUint8Array(base64String) {
    const padding  = '='.repeat((4 - base64String.length % 4) % 4);
    const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData  = window.atob(base64);
    const arr      = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
    return arr;
}

// ── Set button visual state ───────────────────────────────────
function setNotifBtnState(subscribed) {
    const btn = document.getElementById(PUSH_BTN_ID);
    if (!btn) return;
    if (subscribed) {
        btn.classList.add('active');
        btn.title = 'تم تفعيل الإشعارات — انقر لإلغائها';
    } else {
        btn.classList.remove('active');
        btn.title = 'اشترك في إشعارات الأهداف والمباريات';
    }
}

// ── Subscribe logic ───────────────────────────────────────────
async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        showPushToast('متصفحك لا يدعم الإشعارات.', true);
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        showPushToast('تم رفض إذن الإشعارات. يرجى السماح من إعدادات المتصفح.', true);
        return;
    }

    try {
        const reg = await navigator.serviceWorker.ready;

        // Fetch VAPID public key from server
        const keyRes  = await fetch('/api/vapid-public-key');
        if (!keyRes.ok) throw new Error('VAPID key fetch failed');
        const { publicKey } = await keyRes.json();

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // Send subscription to server
        const res = await fetch('/api/subscribe', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(subscription),
        });

        if (!res.ok) throw new Error('Server subscription save failed');

        localStorage.setItem('pushSubscribed', '1');
        setNotifBtnState(true);
        showPushToast('🔔 تم الاشتراك! ستصلك إشعارات الأهداف والأخبار فوراً.');
    } catch (e) {
        console.error('[Push] Subscribe error:', e);
        showPushToast('حدث خطأ أثناء الاشتراك: ' + e.message, true);
    }
}

// ── Unsubscribe logic ─────────────────────────────────────────
async function unsubscribeFromPush() {
    try {
        const reg  = await navigator.serviceWorker.ready;
        const sub  = await reg.pushManager.getSubscription();
        if (sub) {
            await fetch('/api/unsubscribe', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ endpoint: sub.endpoint }),
            });
            await sub.unsubscribe();
        }
        localStorage.removeItem('pushSubscribed');
        setNotifBtnState(false);
        showPushToast('🔕 تم إلغاء الاشتراك في الإشعارات.');
    } catch (e) {
        console.error('[Push] Unsubscribe error:', e);
        showPushToast('حدث خطأ أثناء إلغاء الاشتراك.', true);
    }
}

// ── Inject the notification bell button into the header ───────
function injectNotifButton() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (document.getElementById(PUSH_BTN_ID)) return; // Already injected

    // Find nav ul to inject as a nav item
    const navUl = document.querySelector('.main-nav ul');
    if (!navUl) return;

    const li = document.createElement('li');
    li.className = 'notif-nav-item';

    const btn = document.createElement('button');
    btn.id        = PUSH_BTN_ID;
    btn.className = 'notif-btn';
    btn.setAttribute('aria-label', 'إشعارات');
    btn.title     = 'اشترك في إشعارات الأهداف والمباريات';
    btn.innerHTML = `
        <svg class="notif-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notif-label">إشعارات</span>
        <span class="notif-dot"></span>
    `;

    // Click handler
    btn.addEventListener('click', async () => {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
            unsubscribeFromPush();
        } else {
            subscribeToPush();
        }
    });

    li.appendChild(btn);
    navUl.appendChild(li);
}

// ── Boot: register service worker and restore state ───────────
(async function initPush() {
    if (!('serviceWorker' in navigator)) return;

    // Listen for messages from service worker (to play sounds)
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'PLAY_SOUND') {
            const audio = new Audio('/mixkit-arcade-bonus-alert-767.wav');
            audio.play().catch(e => console.log('Audio play prevented by browser policy:', e));
        }
    });

    try {
        await navigator.serviceWorker.register(PUSH_SW_PATH, { scope: '/' });
        const reg = await navigator.serviceWorker.ready;

        // Restore button state from existing browser subscription
        const sub = await reg.pushManager.getSubscription();
        const wasSubscribed = !!sub;

        // Inject button after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                injectNotifButton();
                setNotifBtnState(wasSubscribed);
            });
        } else {
            injectNotifButton();
            setNotifBtnState(wasSubscribed);
        }
    } catch (e) {
        console.warn('[Push] Service worker registration failed:', e.message);
    }
})();