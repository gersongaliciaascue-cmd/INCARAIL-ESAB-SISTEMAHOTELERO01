const express = require('express');  
const fs = require('fs');  
const path = require('path');  
const cors = require('cors');  
  
const app = express();  
const PORT = process.env.PORT || 3000;  
const DATA_FILE = path.join(__dirname, 'data.json');  
  
app.use(cors());  
app.use(express.json());  
app.use(express.static(__dirname));  
  
function loadData() {  
  if (!fs.existsSync(DATA_FILE)) {  
    const initialData = {  
      calicanto: { 5: [null, null, null], 10: [null, null, null], 11: [null, null, null], 19: [null, null, null], 21: [null, null, null], 22: [null, null, null], 23: [null, null, null] },  
      andenes: { 1: [null, null, null], 2: [null, null, null], 3: [null, null, null], 4: [null, null, null], 6: [null, null, null], 7: [null, null, null], 8: [null, null, null], 9: [null, null, null], 12: [null, null, null], 13: [null, null, null], 14: [null, null, null], 15: [null, null, null], 16: [null, null, null], 17: [null, null, null], 18: [null, null, null], 20: [null, null, null], 24: [null, null, null], 25: [null, null, null] }  
    };  
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));  
  }  
  return JSON.parse(fs.readFileSync(DATA_FILE));  
}  
  
// Lo que agregaste en tu foto  
function saveData(data) {  
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));  
}  
  
app.get('/api/data', (req, res) => {  
  const data = loadData();  
  res.json(data);  
});  
  
// API: Reservar cama  
app.post('/api/reservar', (req, res) => {  
  const { vivienda, habitacion, cama, cliente } = req.body;  
  const habKey = String(habitacion);   
  const data = loadData();  
  
  // 1. Si no existe la vivienda, la creamos  
  if (!data[vivienda]) {  
    data[vivienda] = {};  
  }  
  
  // 2. Si no existe la habitación, la creamos como objeto de camas  
  if (!data[vivienda][habKey]) {  
    data[vivienda][habKey] = {};  
  }  
  
  // 3. Ahora sí revisamos si la cama está libre: null o undefined  
  if (data[vivienda][habKey][cama] == null) {  
    data[vivienda][habKey][cama] = cliente;  
    saveData(data);  
    return res.json({ ok: true });  
  } else {  
    return res.json({ ok: false, msg: 'Cama ocupada' });  
  }  
});  
 
  
// API: Liberar cama  
app.post('/api/liberar', (req, res) => {  
  const { password, vivienda, habitacion, cama } = req.body;  
  const habKey = String(habitacion);  
  const data = loadData();  
  
  // Si usas password, descomenta esta línea  
  // if (password!== 'incarail789') return res.status(403).json({ ok: false, msg: 'Password incorrecto' });  
  
  // Validar que exista vivienda, habitación y cama antes de tocarla  
  if (data[vivienda] && data[vivienda][habKey] && data[vivienda][habKey][cama]!== undefined) {  
    data[vivienda][habKey][cama] = null;  
    saveData(data);  
    return res.json({ ok: true, msg: 'Cama liberada' });  
  } else {  
    return res.json({ ok: false, msg: 'La cama no existe o ya está libre' });  
  }  
});  
  
