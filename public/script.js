const PASSWORD = 'incarail789';  
let currentData = {};  
let currentVivienda = '';  
let currentHabitacion = '';  
let currentCamaKey = null; // CAMBIO 1: era currentCamaIndex  
  
const showScreen = (id) => {  
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));  
    document.getElementById(id).classList.add('active');  
}  
  
async function loadData() {  
    try {  
        const res = await fetch('/api/data');  
        currentData = await res.json();  
        updateRoomColors();  
    } catch (e) {  
        console.error('Error cargando datos:', e);  
    }  
}  
  
// 2. Pintar habitaciones: Verde=Libre, Amarillo=Parcial, Rojo=Llena  
function updateRoomColors() {  
    ['calicanto', 'andenes'].forEach(vivienda => {  
        if (!currentData[vivienda]) return; // CAMBIO: validar que exista  
        Object.keys(currentData[vivienda]).forEach(hab => {  
            const btn = document.querySelector(`#${vivienda}-rooms.room-btn[data-hab="${hab}"]`);  
            if (btn) {  
                const camasObj = currentData[vivienda][hab] || {}; // CAMBIO: ahora es objeto  
                for (ley i = 1; i<= 3; i++) {
                const camasKeys = String(i);  
                const cama = camaObj[camasKey];
                const ocupadas = camasKeys.filter(key => camasObj[key]!== null).length; // CAMBIO  
                const total = camasKeys.length > 0? camasKeys.length : 3; // Si no hay camas, asume 3  
  
                btn.classList.remove('full', 'partial');  
                if (ocupadas === total && total > 0) btn.classList.add('full');  
                else if (ocupadas > 0) btn.classList.add('partial');  
                // CAMBIO: Si ocupadas = 0, queda sin clase = verde/libre  
            }  
        });  
    });  
}  
  
function goToRooms(vivienda) {  
    currentVivienda = vivienda;  
    document.getElementById('vivienda-title').innerText = vivienda.toUpperCase();  
    showScreen('rooms-menu');  
    loadData();  
}  
  
// 4. Abrir modal de habitación - SIEMPRE permite entrar  
function openRoom(habitacion) {  
    currentHabitacion = habitacion;  
    document.getElementById('room-title').innerText = `${currentVivienda.toUpperCase()} - HABITACION ${habitacion}`;  
  
    const bedsContainer = document.getElementById('beds-container');  
    bedsContainer.innerHTML = '';  
  
    const camasObj = currentData[currentVivienda][habitacion] || {}; // CAMBIO  
  
    // CAMBIO: Vamos a mostrar Cama 1, 2, 3 siempre  
    for (let i = 1; i <= 3; i++) {  
        const camaKey = String(i);  
        const cama = camasObj[camaKey]; // CAMBIO: accede por key  
  
        const bedDiv = document.createElement('div');  
        bedDiv.className = 'bed';  
        bedDiv.innerText = `CAMA ${i}`;  
        if (cama!== null && cama!== undefined) { // CAMBIO  
            bedDiv.classList.add('ocupada'); // Usa 1 sola clase  
            bedDiv.title = `${cama.nombre} - ${new Date(cama.fecha).toLocaleDateString()}`;  
        } else {  
            bedDiv.onclick = () => showReservaForm(camaKey); // CAMBIO: pasa la key "1", "2", "3"  
        }  
        bedsContainer.appendChild(bedDiv);  
    }  
    showScreen('room-modal');  
}  
  
function showReservaForm(camaKey) { // CAMBIO: era camaIndex  
    currentCamaKey = camaKey; // CAMBIO  
    document.getElementById('reserva-form').reset();  
    showScreen('reserva-form-screen');  
}  
  
// 6. Reservar cama - Backend nuevo pide {nombre}, no {cliente}  
async function reservarCama() {  
    const nombre = document.getElementById('nombre').value.trim();  
    // const sexo = document.getElementById('sexo').value; // Ya no se usa en backend  
    // const dni = document.getElementById('dni').value.trim();  
    // const dias = document.getElementById('dias').value;  
  
    if (!nombre) { // CAMBIO: solo pide nombre ahora  
        alert('Completa el nombre');  
        return;  
    }  
  
    // CAMBIO: Ya no mandamos "cliente", mandamos "nombre" directo como pide tu backend  
    const res = await fetch('/api/reservar', {  
        method: 'POST',  
        headers: {'Content-Type': 'application/json'},  
        body: JSON.stringify({  
            vivienda: currentVivienda,  
            habitacion: currentHabitacion,  
            cama: currentCamaKey, // "1", "2", "3"  
            nombre: nombre // CAMBIO  
        })  
    });  
  
    const data = await res.json();  
    if (data.ok) {  
        alert('Reserva exitosa');  
        await loadData();  
        showScreen('rooms-menu');  
        openRoom(currentHabitacion);  
    } else {  
        alert(data.msg);  
        await loadData();  
    }  
}  
  
function backToMain() {  
    showScreen('main-menu');  
}  
  
function backToRooms() {  
    showScreen('rooms-menu');  
}  
  
async function openReportes() {  
    const password = prompt('Ingresa password para REPORTES:');  
    if (password!== PASSWORD) {  
        alert('Password incorrecto');  
        return;  
    }  
  
    await loadData();  
    const reportesContainer = document.getElementById('reportes-container');  
    reportesContainer.innerHTML = '';  
  
    let hayOcupadas = false;  
    ['calicanto', 'andenes'].forEach(vivienda => {  
        if (!currentData[vivienda]) return;  
        Object.keys(currentData[vivienda]).forEach(hab => {  
            const camasObj = currentData[vivienda][hab] || {}; // CAMBIO  
            Object.keys(camasObj).forEach(camaKey => { // CAMBIO  
                const cama = camasObj[camaKey];  
                if (cama!== null) {  
                    hayOcupadas = true;  
                    const item = document.createElement('div');  
                    item.className = 'reporte-item';  
                    item.innerHTML = `  
                        <span>${vivienda.toUpperCase()} HAB ${hab} - CAMA ${camaKey}: ${cama.nombre}</span>  
                        <button onclick="liberarCama('${vivienda}', '${hab}', '${camaKey}', '${PASSWORD}')">Liberar</button>  
                    `;  
                    reportesContainer.appendChild(item);  
                }  
            });  
        });  
    });  
  
    if (!hayOcupadas) reportesContainer.innerHTML = '<p>No hay camas ocupadas</p>';  
    showScreen('reportes-screen');  
}  
  
async function liberarCama(vivienda, habitacion, cama, password) {  
    if (!confirm('¿Seguro que deseas liberar esta cama?')) return;  
  
    const res = await fetch('/api/liberar', {  
        method: 'POST',  
        headers: {'Content-Type': 'application/json'},  
        body: JSON.stringify({ password, vivienda, habitacion, cama }) // cama ya es "1", "2", "3"  
    });  
  
    const data = await res.json();  
    if (data.ok) {  
        alert('Cama liberada');  
        openReportes();  
    } else {  
        alert(data.msg);  
    }  
}  
  
document.addEventListener('DOMContentLoaded', () => {  
    loadData();  
    setInterval(loadData, 5000);  
});  
