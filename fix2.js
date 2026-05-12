const fs = require('fs');
const file = 'src/app/(dashboard)/control-facilitadores/page.js';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/\\\`/g, '\`').replace(/\\\$/g, '$');
fs.writeFileSync(file, c);
console.log('Fixed backticks.');
