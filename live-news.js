// ============================================================
//  KoraLegend Live News Client
//  - Fetches news from /api/news every 2 minutes
//  - Updates the news grid without page reload
//  - Shows last update time
// ============================================================

const API_BASE = '';
const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

let refreshTimer = null;
let lastUpdateTime = null;

// ── Fetch news from API ──────────────────────────────────────
async function fetchNewsFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/api/news`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.news || [];
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return null;
    }
}

// ── Render news grid ─────────────────────────────────────────
function renderNews(newsArray) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    if (!newsArray || newsArray.length === 0) {
        grid.innerHTML = '<p class="no-data">لا توجد أخبار متاحة حالياً</p>';
        return;
    }

    grid.innerHTML = newsArray.map(article => `
        <article class="news-card">
            <a href="article?url=${btoa(unescape(encodeURIComponent(article.href || article.link)))}" class="news-card-link">
                <div class="news-image">
                    ${article.image
                        ? `<img src="${article.image}" alt="${article.title}" class="news-image-img" loading="lazy">`
                        : article.icon || '📰'
                    }
                    <span class="news-category">${article.category}</span>
                </div>
                <div class="news-content">
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-description">${article.description}</p>
                    <div class="news-date">${article.date}</div>
                </div>
            </a>
        </article>
    `).join('');
}

// ── Update news ──────────────────────────────────────────────
async function updateNews() {
    console.log('🔄 Fetching latest news...');
    
    const news = await fetchNewsFromAPI();
    
    if (news) {
        renderNews(news);
        
        // Hide page loading indicator
        if (typeof hidePageLoading === 'function') {
            hidePageLoading();
        }
        
        lastUpdateTime = new Date();
        updateLastRefreshIndicator();
        console.log(`✅ News updated: ${news.length} articles`);
    } else {
        console.warn('⚠️ Failed to update news, keeping current data');
    }
}

// ── Show last update time ────────────────────────────────────
function updateLastRefreshIndicator() {
    let indicator = document.getElementById('lastRefresh');
    
    if (!indicator) {
        // Create indicator if it doesn't exist
        const pageHeader = document.querySelector('.page-header .container');
        if (pageHeader) {
            indicator = document.createElement('div');
            indicator.id = 'lastRefresh';
            indicator.className = 'last-refresh';
            pageHeader.appendChild(indicator);
        }
    }
    
    if (indicator && lastUpdateTime) {
        const timeStr = lastUpdateTime.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        indicator.innerHTML = `
            <span class="refresh-icon">🔄</span>
            <span>آخر تحديث: ${timeStr}</span>
        `;
    }
}

// ── Start auto-refresh ───────────────────────────────────────
function startAutoRefresh() {
    // Initial load
    updateNews();
    
    // Set up periodic refresh
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(updateNews, REFRESH_INTERVAL);
    
    console.log(`🚀 Auto-refresh started (every ${REFRESH_INTERVAL / 1000}s)`);
}

// ── Stop auto-refresh ────────────────────────────────────────
function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
        console.log('⏸️ Auto-refresh stopped');
    }
}

// ── Initialize when page loads ───────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAutoRefresh);
} else {
    startAutoRefresh();
}

// ── Stop refresh when page is hidden ─────────────────────────
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
    }
});

// ── Manual refresh button (optional) ─────────────────────────
window.refreshNews = updateNews;
