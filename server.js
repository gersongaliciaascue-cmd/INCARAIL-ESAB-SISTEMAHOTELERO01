const express = require('express');  
const fs = require('fs');  
const path = require('path');  
const cors = require('cors');  
const app = express();  
const PORT = process.env.PORT || 3000;  
  
app.use(cors());  
app.use(express.json());  
app.use(express.static('public'));  
  
const DATA_FILE = 'data.json';  
  
const loadData = () => {  
  if (!fs.existsSync(DATA_FILE)) {  
    return {  
      calicanto: { "5": {}, "10": {}, "11": {}, "19": {}, "21": {}, "22": {}, "23": {} },  
      andenes: { "34": {}, "35": {}, "38": {}, "39": {} }  
    };  
  }  
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));  
};  
  
const saveData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));  
  
// 1. Obtener todo el estado  
app.get('/api/data', (req, res) => {  
  res.json(loadData());  
});  
  
// 2. Reservar cama  
app.post('/api/reservar', (req, res) => {  
  const { vivienda, habitacion, cama, nombre, sexo, dni, dias } = req.body;  
  const data = loadData();  
  
  if (!data[vivienda]) data[vivienda] = {};  
  if (!data[vivienda][habitacion]) data[vivienda][habitacion] = {};  
  
  const habitacionData = data[vivienda][habitacion];  
  
  // Regla de sexo: si ya hay alguien, todos deben ser del mismo sexo  
  const ocupantes = Object.values(habitacionData).filter(c => c!== null);  
  if (ocupantes.length > 0 && ocupantes[0].sexo!== sexo) {  
    return res.status(400).json({ error: 'La habitación ya es de solo ' + (ocupantes[0].sexo === 'M'? 'Hombres' : 'Mujeres') });  
  }  
  
  if (habitacionData[cama]) {  
    return res.status(400).json({ error: 'Cama ya ocupada' });  
  }  
  
  habitacionData[cama] = { nombre, sexo, dni, dias };  
  saveData(data);  
  res.json({ success: true, data });  
});  
  
// 3. Liberar cama  
app.post('/api/liberar', (req, res) => {  
  const { vivienda, habitacion, cama } = req.body;  
  const data = loadData();  
  if (data[vivienda] && data[vivienda][habitacion]) {  
    delete data[vivienda][habitacion][cama];  
  }  
  saveData(data);  
  res.json({ success: true, data });  
});  
  
app.listen(PORT, () => console.log(`Servidor ESAB en puerto ${PORT}`));  
