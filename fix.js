const fs = require('fs');

const file = 'src/app/(dashboard)/control-facilitadores/page.js';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  const [casasByFacilitador, setCasasByFacilitador] = useState({});
  const now = new Date();`;

const replacement1 = `  const [casasByFacilitador, setCasasByFacilitador] = useState({});
  const [loadingFacilitadores, setLoadingFacilitadores] = useState(true);
  const now = new Date();`;

content = content.replace(target1, replacement1);

const target2 = `  const handleGeneratePDF = () => {
    if (!selectedFacilitador) {
      alert("Debes seleccionar un facilitador para generar el reporte.");
      return;
    }

    const doc = new jsPDF();`;

const replacement2 = `  const handleGeneratePDF = () => {
    if (!selectedFacilitador) {
      alert("Debes seleccionar un facilitador para generar el reporte.");
      return;
    }

    const doc = new jsPDF({ format: 'letter' });`;

content = content.replace(target2, replacement2);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed.');
