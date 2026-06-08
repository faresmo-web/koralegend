const axios = require('axios');
(async () => {
    try {
        const res = await axios.get('http://localhost:3001/api/ping', { timeout: 2000 });
        console.log('Server is running on port 3001:', res.data);
    } catch (e) {
        console.log('Server is NOT running on port 3001:', e.message);
    }
})();
