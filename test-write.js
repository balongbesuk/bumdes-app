const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, 'src', 'app', 'favicon.ico');
try {
    fs.writeFileSync(target, 'test data');
    console.log('SUCCESS: wrote to ' + target);
} catch (e) {
    console.error('ERROR: ' + e.message);
}
