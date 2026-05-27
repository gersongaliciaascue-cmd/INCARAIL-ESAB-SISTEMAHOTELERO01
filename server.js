const express = require('express');  
const path = require('path');  
const fs = require('fs');  
const cors = require('cors');  
const app = express();  
const PORT = process.env.PORT || 3000;  
  
app.use(cors());  
app.use(express.json());  
app.use(express.static(path.join(__dirname, 'public')));  
  
const DATA_FILE = path.join(__dirname, 'data.json');  
  
// Cargar o crear data.json  
const loadData = () => {  
    if (!fs.existsSync(DATA_FILE)) {  
        const initialData = {  
            calicanto: { 5: [null, null, null], 10: [null, null, null], 11: [null, null, null], 19: [null, null, null], 21: [null, null, null], 22: [null, null, null], 23: [null, null, null] },  
            andenes: { 1: [null, null, null], 2: [null, null, null], 3: [null, null, null], 4: [null, null, null], 6: [null, null, null], 7: [null, null, null], 8: [null, null, null], 9: [null, null, null], 12: [null, null, null], 13: [null, null, null], 14: [null, null, null], 15: [null, null, null], 16: [null, null, null], 17: [null, null, null], 18: [null, null, null], 20: [null, null, null], 24: [null, null, null], 25: [null, null, null] }  
        };  
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));  
    }  
    return JSON.parse(fs.readFileSync(DATA_FILE));  
};  
  
// API: Obtener todas las reservas  
app.get('/api/data', (req, res) => {  
    res.json(loadData());  
});  
  
// API: Reservar cama  
app.post('/api/reservar', (req, res) => {  
    const { vivienda, habitacion, cama, cliente } = req.body;  
    const data = loadData();  
  
    // CORRECCIÓN CLAVE: Ahora sí revisamos la cama específica [cama]  
    if (data[vivienda][habitacion][cama] === null) {  
        data[vivienda][habitacion][cama] = cliente;  
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));  
        return res.json({ ok: true });  
    } else {  
        return res.json({ ok: false, msg: 'Cama ya ocupada' });  
    }  
});  
  
// API: Liberar cama - para REPORTES con password incarail789  
app.post('/api/liberar', (req, res) => {  
    const { password, vivienda, habitacion, cama } = req.body;  
    if (password!== 'incarail789') return res.status(403).json({ ok: false, msg: 'Password incorrecto' });  
  
    const data = loadData();  
    data[vivienda][habitacion][cama] = null; // CORRECCIÓN CLAVE: [cama]  
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));  
    res.json({ ok: true });  
});  
  
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));  
