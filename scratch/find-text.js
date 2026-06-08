const fs = require('fs');
const content = fs.readFileSync('scratch/team-data-sample.json', 'utf-8');

const searchTerms = ['Soucek', 'Schick', 'مدرب', 'قائمة', 'لاعب', 'سنة', 'عمر'];
searchTerms.forEach(term => {
    const idx = content.toLowerCase().indexOf(term.toLowerCase());
    console.log(`Term "${term}" found:`, idx !== -1 ? `Yes, at index ${idx}` : 'No');
});

// Let's print the first 200 keys of the json object to see if there is any other large root key
const json = JSON.parse(content);
console.log('Root keys:', Object.keys(json));
if (json.props) {
    console.log('props keys:', Object.keys(json.props));
    if (json.props.pageProps) {
        console.log('pageProps keys:', Object.keys(json.props.pageProps));
        if (json.props.pageProps.data) {
            console.log('pageProps.data keys:', Object.keys(json.props.pageProps.data));
        }
    }
}
