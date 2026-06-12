const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://www.ysscores.com/ar';

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
        // 1. Fetch the main HTML page
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

        // Extract match code and fetch lineup JSON
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
                    // Coaches & Formations
                    lineups.home.coach = data.info.home_coach?.title || '';
                    lineups.home.formation = data.info.home_formation || '';
                    lineups.away.coach = data.info.away_coach?.title || '';
                    lineups.away.formation = data.info.away_formation || '';

                    // Lineup Positions Mapping
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

async function test() {
    const url = 'https://www.ysscores.com/ar/match/4667751/Mexico-vs-South-Africa';
    console.log('Testing parsing on finished match:', url);
    const details = await fetchMatchDetails(url);
    console.log('Info:', details.info);
    console.log(`Stats count: ${details.stats.length}`);
    if (details.stats.length > 0) console.log('Sample Stat:', details.stats[0]);
    console.log(`Events count: ${details.events.length}`);
    if (details.events.length > 0) console.log('Sample Event:', details.events[0]);
    console.log('Lineups:');
    console.log('  Confirmed:', details.lineups.confirmed);
    console.log('  Home Coach:', details.lineups.home.coach, 'Formation:', details.lineups.home.formation);
    console.log('  Home Starters count:', details.lineups.home.starters.length);
    if (details.lineups.home.starters.length > 0) console.log('  Sample Starter:', details.lineups.home.starters[0]);
    console.log('  Home Subs count:', details.lineups.home.subs.length);
    if (details.lineups.home.subs.length > 0) console.log('  Sample Sub:', details.lineups.home.subs[0]);
}
test();
