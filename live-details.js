// ============================================================
//  KoraLegend — Live Match Details Client
//  Patches match-details.js to fetch live data from /api/details
//  Falls back to matchDetailsDatabase if server is offline
// ============================================================

(function () {
    // Wait for match-details.js to define renderLineups etc., then override the data fetch
    const _origDOMReady = document.addEventListener.bind(document);

    // We hook into DOMContentLoaded by running after match-details.js
    // match-details.js already handles rendering — we just need to
    // re-fetch live data and re-render every 30s for live matches

    let liveRefreshTimer = null;
    let currentMatchInfo = null;
    let isMatchLive      = false;

    // Override: after match-details.js runs, also start live polling
    window.addEventListener('load', function () {
        startLivePolling();
    });

    async function startLivePolling() {
        const urlParams = new URLSearchParams(window.location.search);
        const matchId   = urlParams.get('id');
        if (!matchId) return;

        // Find match info from static DB (already loaded by match-details.js)
        if (typeof matchesDatabase !== 'undefined') {
            for (const dateKey of ['today', 'yesterday', 'tomorrow']) {
                const list  = matchesDatabase['ar']?.[dateKey] || [];
                const found = list.find(m => m.id === matchId);
                if (found) { currentMatchInfo = found; break; }
            }
        }

        if (!currentMatchInfo) return;
        isMatchLive = currentMatchInfo.isLive;

        // Start polling
        await pollDetails(matchId);
    }

    async function pollDetails(matchId) {
        clearTimeout(liveRefreshTimer);

        try {
            const match    = currentMatchInfo;
            const slug     = match.slug     || '';
            const koooraId = match.koooraId || matchId;
            const liveFlag = isMatchLive ? '1' : '0';

            const res = await fetch(
                `/api/details?id=${encodeURIComponent(matchId)}&slug=${encodeURIComponent(slug)}&koooraId=${encodeURIComponent(koooraId)}&live=${liveFlag}`,
                { cache: 'no-store' }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const details = await res.json();

            // Re-render all panels with fresh data
            if (typeof renderEvents  === 'function') renderEvents(details);
            if (typeof renderStats   === 'function') renderStats(details);
            if (typeof renderLineups === 'function') renderLineups(details, currentMatchInfo);

            // Also update hero score/status if match is live
            if (isMatchLive) {
                await refreshMatchScore(matchId);
            }

            updateDetailsIndicator(true);

        } catch (e) {
            updateDetailsIndicator(false);
        }

        // Schedule next poll
        const interval = isMatchLive ? 30_000 : 5 * 60_000;
        liveRefreshTimer = setTimeout(() => pollDetails(matchId), interval);
    }

    async function refreshMatchScore(matchId) {
        try {
            // Re-fetch today's matches to get updated score
            const res = await fetch(`/api/matches?date=today`, { cache: 'no-store' });
            if (!res.ok) return;
            const json    = await res.json();
            const updated = (json.matches || []).find(m => m.id === matchId);
            if (!updated) return;

            // Update currentMatchInfo with fresh score/status
            currentMatchInfo = { ...currentMatchInfo, ...updated };
            isMatchLive      = updated.isLive;

            // Re-render hero card
            if (typeof renderHeroCard === 'function') {
                renderHeroCard(currentMatchInfo, null, currentMatchInfo.date);
            }
        } catch (_) {}
    }

    function updateDetailsIndicator(online) {
        let el = document.getElementById('liveDetailsIndicator');
        if (!el) {
            // Create indicator below the tabs
            el = document.createElement('div');
            el.id = 'liveDetailsIndicator';
            el.style.cssText = 'text-align:center;font-size:0.78rem;color:var(--text-secondary);margin-bottom:0.75rem;display:flex;align-items:center;justify-content:center;gap:6px;';
            const tabs = document.querySelector('.details-tabs');
            if (tabs) tabs.insertAdjacentElement('afterend', el);
        }
        const now = new Date().toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (online) {
            el.innerHTML = `<span style="width:7px;height:7px;background:#4ade80;border-radius:50%;display:inline-block;animation:pulse 2s infinite;"></span> مباشر • آخر تحديث: ${now}`;
        } else {
            el.innerHTML = `<span style="width:7px;height:7px;background:#ff6b6b;border-radius:50%;display:inline-block;"></span> السيرفر غير متصل`;
        }
    }
})();
