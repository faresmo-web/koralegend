const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../styles.css');
const minCssPath = path.join(__dirname, '../styles.min.css');

try {
    let css = fs.readFileSync(cssPath, 'utf8');

    // Simple robust CSS minifier
    css = css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ')             // Collapse whitespace
        .replace(/\s*([\{\}\:\;\,])\s*/g, '$1') // Remove spaces around delimiters
        .trim();

    fs.writeFileSync(minCssPath, css, 'utf8');
    console.log('✅ styles.min.css generated successfully!');
} catch (error) {
    console.error('❌ Error minifying CSS:', error);
}
