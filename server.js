const express = require('express');  
const fs = require('fs');  
const cors = require('cors');  
const path = require('path');  
const app = express();  
const PORT = process.env.PORT || 3000;  
const DATA_FILE = './data.json';  
  
app.use(cors());  
app.use(express.json());  
app.use(express.static('public'));  
  
const readData = () => {  
  if (!fs.existsSync(DATA_FILE)) return { reservas: [] };  
  return JSON.parse(fs.readFileSync(DATA_FILE));  
};  
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));  
  
app.get('/api/reservas', (req, res) => res.json(readData()));  
  
app.post('/api/reservar', (req, res) => {  
  const { vivienda, habitacion, cama, nombre, sexo, dni, dias } = req.body;  
  const data = readData();  
    
  const existe = data.reservas.find(r => r.vivienda === vivienda && r.habitacion === habitacion && r.cama === cama);  
  if (existe) return res.status(400).json({ error: 'Cama ya ocupada' });  
  
  const mismoSexo = data.reservas.find(r => r.vivienda === vivienda && r.habitacion === habitacion && r.sexo !== sexo);  
  if (mismoSexo) return res.status(400).json({ error: `Habitación ocupada por sexo ${mismoSexo.sexo}` });  
  
  data.reservas.push({ vivienda, habitacion, cama, nombre, sexo, dni, dias, fecha: new Date() });  
  writeData(data);  
  res.json({ ok: true });  
});  
  
app.post('/api/liberar', (req, res) => {  
  const { vivienda, habitacion, cama } = req.body;  
  const data = readData();  
  data.reservas = data.reservas.filter(r => !(r.vivienda === vivienda && r.habitacion === habitacion && r.cama === cama));  
  writeData(data);  
  res.json({ ok: true });  
});  
  
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));  
