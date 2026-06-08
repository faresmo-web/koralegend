const fs = require('fs');
const path = 'scraper_365_backup.js';
let content = fs.readFileSync(path, 'utf8');

const badString = `style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\\\'http://www.w3.org/2000/svg\\\\' viewBox=\\\\'0 0 24 24\\\\' width=\\\\'105\\\\' height=\\\\'80\\\\' loading="lazy"><rect width=\\\\'100%\\\\' height=\\\\'100%\\\\' fill=\\\\'%23222\\\\'/><text x=\\\\'50%\\\\' y=\\\\'50%\\\\' dominant-baseline=\\\\'middle\\\\' text-anchor=\\\\'middle\\\\' fill=\\\\'%23666\\\\' font-family=\\\\'sans-serif\\\\' font-size=\\\\'12\\\\'>Kora Legend</text></svg>';">`;

const goodString = `loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\\\'http://www.w3.org/2000/svg\\\\' viewBox=\\\\'0 0 24 24\\\\' width=\\\\'105\\\\' height=\\\\'80\\\\'><rect width=\\\\'100%\\\\' height=\\\\'100%\\\\' fill=\\\\'%23222\\\\'/><text x=\\\\'50%\\\\' y=\\\\'50%\\\\' dominant-baseline=\\\\'middle\\\\' text-anchor=\\\\'middle\\\\' fill=\\\\'%23666\\\\' font-family=\\\\'sans-serif\\\\' font-size=\\\\'12\\\\'>Kora Legend</text></svg>';">`;

if (content.includes(badString)) {
    content = content.replace(badString, goodString);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully fixed scraper_365_backup.js with string replace!");
} else {
    console.log("badString was not found in scraper_365_backup.js");
}
