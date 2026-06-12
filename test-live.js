const axios = require('axios');
axios.get('https://www.ysscores.com/ar/index').then(res => {
    require('fs').writeFileSync('ysscores_dump.html', res.data);
    console.log('Saved to ysscores_dump.html');
}).catch(console.error);
