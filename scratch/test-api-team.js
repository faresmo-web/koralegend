const axios = require('axios');
const tabs = ['info', 'news', 'videos', 'matches', 'squad', 'standings', 'scorers'];
const teamId = '7u6a9femhquay3jnk6ysgiwx9';
const name = 'العراق';

(async () => {
    for (const tab of tabs) {
        try {
            const url = `http://localhost:3001/api/team?id=${teamId}&name=${encodeURIComponent(name)}&tab=${tab}`;
            const res = await axios.get(url, { timeout: 5000 });
            console.log(`Tab: ${tab.padEnd(10)} | Status: ${res.status} | Data size: ${JSON.stringify(res.data).length} bytes`);
        } catch (e) {
            console.log(`Tab: ${tab.padEnd(10)} | ERROR: ${e.response ? e.response.status : e.message}`);
            if (e.response && e.response.data) {
                console.log('Error data:', e.response.data);
            }
        }
    }
})();
