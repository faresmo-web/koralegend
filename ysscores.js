const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.ysscores.com/ar';

let sessionToken = '';
let sessionCookie = '';
let lastSessionTime = 0;

async function ensureSession() {
    // Refresh session token every 1 hour
    if (sessionToken && (Date.now() - lastSessionTime < 3600000)) return true;
    try {
        const r = await axios.get(`${BASE_URL}/index`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000,
            responseType: 'arraybuffer'
        });
        const html = Buffer.from(r.data).toString('utf-8');
        const $ = cheerio.load(html);
        sessionToken = $('meta[name="_token"]').attr('content') || '';
        const cookies = r.headers['set-cookie'];
        sessionCookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
        lastSessionTime = Date.now();
        console.log(`[ysscores] Session ready. Token: ${sessionToken ? 'OK' : 'MISSING'}`);
        return true;
    } catch (e) {
        console.error('[ysscores] Session init error:', e.message);
        return false;
    }
}

async function fetchMatchesForDate(dateStr, dateLabel) {
    await ensureSession();
    if (!sessionToken) throw new Error('No ysscores session token available');

    const formData = new URLSearchParams();
    formData.append('get_date', dateStr);
    formData.append('favorite_status', 'champ_display');
    formData.append('match_status', '1');
    formData.append('order_status', '1');
    formData.append('clear_c', 'yes');

    const r = await axios.post(`${BASE_URL}/match_date_to`, formData.toString(), {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-CSRF-Token': sessionToken,
            'Cookie': sessionCookie,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': `${BASE_URL}/index`,
            'Accept': 'text/html, */*; q=0.01',
            'Accept-Language': 'ar,en;q=0.9',
            'Accept-Encoding': 'identity',
        },
        timeout: 15000,
        responseType: 'arraybuffer'
    });

    const html = Buffer.from(r.data).toString('utf-8');
    const $ = cheerio.load(html);
    const matches = [];

    $('.matches-wrapper').each((i, el) => {
        const leagueEl = $(el).find('a.champ-title');
        const league = leagueEl.find('b').text().trim() || leagueEl.text().trim();
        const leagueLogo = leagueEl.find('img').attr('src') || '';
        const leagueSlug = league.replace(/\s+/g, '-');
        const leagueHref = leagueEl.attr('href') || '';
        // Extract league ID from href like /ar/championship/1234567890
        const leagueIdMatch = leagueHref.match(/\/championship\/(\d+)/);
        const leagueId = leagueIdMatch ? leagueIdMatch[1] : '';

        $(el).find('.ajax-match-item').each((j, matchEl) => {
            const id = $(matchEl).attr('match_id') || '';
            const homeTeam = $(matchEl).attr('home_name') || '';
            const awayTeam = $(matchEl).attr('away_name') || '';
            const homeId = $(matchEl).attr('home_id') || '';
            const awayId = $(matchEl).attr('away_id') || '';
            const homeLogo = $(matchEl).attr('home_image') || '';
            const awayLogo = $(matchEl).attr('away_image') || '';
            const matchLink = $(matchEl).attr('href') || '';

            // Parse inner HTML for time, score, status
            const resultWrap = $(matchEl).find('.result-wrap');
            const timeEl = resultWrap.find('.match-date, .match-time-before');
            const time = timeEl.text().trim() || '';

            let homeScore = null;
            let awayScore = null;
            const scoreEls = resultWrap.find('.first-team-result, .second-team-result, .score-num, .result-score .score');
            if (scoreEls.length >= 2) {
                const h = parseInt(scoreEls.eq(0).text().trim());
                const a = parseInt(scoreEls.eq(1).text().trim());
                if (!isNaN(h)) homeScore = h;
                if (!isNaN(a)) awayScore = a;
            }

            const isLive = $(matchEl).hasClass('live-match') ||
                           $(matchEl).find('.live-icon, .live-label').length > 0;

            let isFinished = false;
            let statusAr = 'قادمة';

            const statusEl = resultWrap.find('.match-status, .match-status-end, .match-time-text, .result-status-text, .result-status');
            const statusText = statusEl.text().trim();
            if (statusText) {
                statusAr = statusText;
                if (statusText.includes('انتهت') || statusText.includes('انتهى')) {
                    isFinished = true;
                    statusAr = 'انتهت';
                } else if (statusText.includes('الغيت') || statusText.includes('ملغاة')) {
                    statusAr = 'ملغاة';
                    isFinished = true;
                } else if (statusText.includes('مؤجلة')) {
                    statusAr = 'مؤجلة';
                } else if (statusText.includes('مباشر') || isLive) {
                    // keep isLive
                }
            }

            if (isLive) {
                const liveMinEl = $(matchEl).find('.live-minute, .match-minute');
                const liveMin = liveMinEl.text().trim();
                statusAr = liveMin ? `${liveMin}'` : 'مباشر';
            }

            // homePenaltyScore / awayPenaltyScore
            let homePenaltyScore = null;
            let awayPenaltyScore = null;
            const penEl = resultWrap.find('.penalty-score, .pen-score');
            if (penEl.length) {
                const penNums = penEl.find('.score-num');
                if (penNums.length >= 2) {
                    const hp = parseInt(penNums.eq(0).text().trim());
                    const ap = parseInt(penNums.eq(1).text().trim());
                    if (!isNaN(hp)) homePenaltyScore = hp;
                    if (!isNaN(ap)) awayPenaltyScore = ap;
                }
            }

            // Time display: if score is available, show it; else show the time text
            let displayTime = time;
            // Format time if it looks like a Cairo time (e.g., "22:00")
            if (!displayTime && homeScore === null) displayTime = '';

            matches.push({
                id,
                slug: `${id}/${matchLink.split('/').slice(-1)[0] || id}`,
                koooraId: id,
                league,
                leagueLogo,
                leagueId,
                leagueSlug,
                countryName: '',
                homeTeam,
                awayTeam,
                homeLogo,
                awayLogo,
                homeId,
                awayId,
                homeScore,
                awayScore,
                homePenaltyScore,
                awayPenaltyScore,
                time: displayTime,
                status: statusAr,
                statusAr,
                isLive,
                isFinished,
                date: dateLabel,
                startTime: `${dateStr}T00:00:00`,
                round: '',
                matchUrl: matchLink,
            });
        });
    });

    console.log(`[ysscores] ${dateLabel} (${dateStr}): ${matches.length} matches from ${[...new Set(matches.map(m => m.league))].length} leagues`);
    return matches;
}

async function fetchMatchDetails(matchUrl) {
    const empty = {
        stats: [], events: [],
        lineups: {
            confirmed: false,
            home: { starters: [], subs: [], coach: '', formation: '' },
            away: { starters: [], subs: [], coach: '', formation: '' },
        },
        info: { channel: '', stadium: '', referee: '' },
    };

    if (!matchUrl || !matchUrl.startsWith('http')) return empty;

    try {
        const rHtml = await axios.get(matchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 15000,
            responseType: 'arraybuffer'
        });
        const html = Buffer.from(rHtml.data).toString('utf-8');
        const $ = cheerio.load(html);

        // Parse Info (stadium, referee, channel)
        const info = { channel: '', stadium: '', referee: '' };
        const channels = [];
        $('.match-info-item').each((i, el) => {
            const title = $(el).find('.title').text().trim();
            const content = $(el).find('.content').text().trim();

            if (title === 'ملعب المباراة') {
                info.stadium = content;
            } else if (title === 'حكم الساحة') {
                info.referee = content;
            } else if (title.startsWith('beIN') || title.includes('Max') || title.includes('Sport') || title.includes('قناة')) {
                channels.push(title);
            }
        });
        if (channels.length > 0) {
            info.channel = [...new Set(channels)].join(' / ');
        }

        // Parse Events
        const events = [];
        $('.match-event-item').each((i, el) => {
            if ($(el).hasClass('start-end-match')) return;

            const commPop = $(el).find('a.comm_pop');
            if (commPop.length === 0) return;

            const min = commPop.attr('min') || '';
            const eventName = commPop.attr('event_name') || '';
            const playerA = commPop.attr('player_a') || '';
            const playerS = commPop.attr('player_s') || '';
            
            let type = 'other';
            if (eventName.includes('هدف') || eventName.toLowerCase().includes('goal')) {
                if (eventName.includes('عكسي') || eventName.includes('مرماه')) {
                    type = 'own-goal';
                } else if (eventName.includes('جزاء')) {
                    type = 'penalty';
                } else {
                    type = 'goal';
                }
            } else if (eventName.includes('صفراء') || eventName.toLowerCase().includes('yellow')) {
                type = 'yellow';
            } else if (eventName.includes('حمراء') || eventName.toLowerCase().includes('red')) {
                type = 'red';
            } else if (eventName.includes('تبديل') || eventName.toLowerCase().includes('sub')) {
                type = 'sub';
            }

            const team = commPop.hasClass('team-a') ? 'home' : 'away';

            let descText = playerA;
            if (playerS) {
                if (type === 'sub') {
                    descText = `${playerA} ↔ ${playerS}`;
                } else if (type === 'goal') {
                    descText = `${playerA} (${playerS})`;
                }
            }

            if (min || playerA) {
                events.push({ min, type, player: descText, descText, team });
            }
        });

        // Parse Stats
        const stats = [];
        const progWrap = $('.progress-wrapper');
        if (progWrap.length > 0) {
            const label = progWrap.find('.progress-value').text().trim() || 'الاستحواذ';
            const home = progWrap.find('.team-item.team-a').text().trim().replace(/\s+/g, '');
            const away = progWrap.find('.team-item.team-b').text().trim().replace(/\s+/g, '');
            stats.push({ label, name: label, home, away });
        }
        $('.progress-state-item').each((i, el) => {
            const label = $(el).find('.title').text().trim();
            const spans = $(el).find('.text span');
            if (spans.length >= 2 && label) {
                const home = spans.eq(0).text().trim();
                const away = spans.eq(spans.length - 1).text().trim();
                stats.push({ label, name: label, home, away });
            }
        });

        // Parse Lineups
        const lineups = {
            confirmed: false,
            home: { starters: [], subs: [], coach: '', formation: '' },
            away: { starters: [], subs: [], coach: '', formation: '' },
        };

        const lineupTabText = $('.lineup_tab').text().trim();
        lineups.confirmed = lineupTabText ? !lineupTabText.includes('المتوقعة') : false;

        const matchCodeMatch = matchUrl.match(/\/match\/(\d+)/);
        const matchCode = matchCodeMatch ? matchCodeMatch[1] : '';

        if (matchCode) {
            try {
                const lineupUrl = `${BASE_URL}/match_lineup?match_code=${matchCode}`;
                const rLineup = await axios.get(lineupUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': `${BASE_URL}/index`,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    timeout: 10000
                });

                const data = rLineup.data;
                const homeTeamId = data.info?.home_team;
                const awayTeamId = data.info?.away_team;

                if (homeTeamId && awayTeamId) {
                    lineups.home.coach = data.info.home_coach?.title || '';
                    lineups.home.formation = data.info.home_formation || '';
                    lineups.away.coach = data.info.away_coach?.title || '';
                    lineups.away.formation = data.info.away_formation || '';

                    const linePositions = { G: 5, D: 28, M: 55, F: 78, S: 90 };

                    const parseStarters = (teamId, target) => {
                        const teamLineup = data.lineup?.[teamId] || {};
                        for (const posKey of ['G', 'D', 'M', 'F', 'S']) {
                            const linePlayers = Object.keys(teamLineup[posKey] || {})
                                .sort((a, b) => parseInt(a) - parseInt(b))
                                .map(k => teamLineup[posKey][k]);

                            const N = linePlayers.length;
                            linePlayers.forEach((entry, idx) => {
                                let x = 50;
                                if (N > 1) {
                                    x = 12 + (76 / (N - 1)) * idx;
                                }
                                const y = linePositions[posKey];

                                target.starters.push({
                                    id: String(entry.player?.row_id || ''),
                                    num: String(entry.player?.player_number || ''),
                                    name: entry.player?.title || '',
                                    image: entry.player?.image || '',
                                    x,
                                    y,
                                    isCaptain: entry.captain === 1,
                                });
                            });
                        }
                    };

                    const parseSubs = (teamId, target) => {
                        const teamSubsRaw = data.substitutions?.[teamId];
                        if (!teamSubsRaw) return;

                        let teamSubs = [];
                        if (Array.isArray(teamSubsRaw)) {
                            teamSubs = teamSubsRaw;
                        } else if (teamSubsRaw.sub && Array.isArray(teamSubsRaw.sub)) {
                            teamSubs = teamSubsRaw.sub;
                        } else if (teamSubsRaw.sub && typeof teamSubsRaw.sub === 'object') {
                            teamSubs = Object.values(teamSubsRaw.sub);
                        } else {
                            teamSubs = Object.values(teamSubsRaw);
                        }

                        teamSubs.forEach(entry => {
                            if (!entry || !entry.player) return;
                            target.subs.push({
                                id: String(entry.player.row_id || ''),
                                num: String(entry.player.player_number || ''),
                                name: entry.player.title || '',
                                image: entry.player.image || '',
                                isCaptain: entry.captain === 1,
                            });
                        });
                    };

                    parseStarters(homeTeamId, lineups.home);
                    parseStarters(awayTeamId, lineups.away);
                    parseSubs(homeTeamId, lineups.home);
                    parseSubs(awayTeamId, lineups.away);
                }
            } catch (le) {
                console.error('[ysscores] Failed to fetch or parse match_lineup JSON:', le.message);
            }
        }

        return { stats, events, lineups, info };
    } catch (e) {
        console.error('[ysscores] fetchMatchDetails error:', e.message);
        return empty;
    }
}

function resolveMatchUrl(slug) {
    // slug might be a full URL already
    if (slug && slug.startsWith('http')) return slug;
    if (slug && slug.includes('/')) {
        // might be "id/name" format
        const parts = slug.split('/');
        return `${BASE_URL}/match/${parts[0]}/${parts[1] || parts[0]}`;
    }
    return '';
}

module.exports = {
    fetchMatchesForDate,
    fetchMatchDetails,
    resolveMatchUrl,
};
