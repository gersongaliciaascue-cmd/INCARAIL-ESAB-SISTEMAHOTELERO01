const PASSWORD = 'incarail789';  
let currentData = {};  
let currentVivienda = '';  
let currentHabitacion = '';  
let currentCamaIndex = null;  
  
const showScreen = (id) => {  
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));  
    document.getElementById(id).classList.add('active');  
}  
  
// 1. Cargar datos del servidor cada 5 seg para multi-usuario  
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
        Object.keys(currentData[vivienda]).forEach(hab => {  
            const btn = document.querySelector(`#${vivienda}-rooms.room-btn[data-hab="${hab}"]`);  
            if (btn) {  
                const camas = currentData[vivienda][hab];  
                const ocupadas = camas.filter(c => c!== null).length;  
                const total = camas.length;  
                btn.classList.remove('full', 'partial');  
                if (ocupadas === total) btn.classList.add('full');  
                else if (ocupadas > 0) btn.classList.add('partial');  
            }  
        });  
    });  
}  
  
// 3. Ir a menú de habitaciones  
function goToRooms(vivienda) {  
    currentVivienda = vivienda;  
    document.getElementById('vivienda-title').innerText = vivienda.toUpperCase();  
    showScreen('rooms-menu');  
    loadData(); // Actualizar colores al entrar  
}  
  
// 4. Abrir modal de habitación - SIEMPRE permite entrar aunque esté parcial  
function openRoom(habitacion) {  
    currentHabitacion = habitacion;  
    document.getElementById('room-title').innerText = `${currentVivienda.toUpperCase()} - HABITACION ${habitacion}`;  
  
    const bedsContainer = document.getElementById('beds-container');  
    bedsContainer.innerHTML = '';  
  
    currentData[currentVivienda][habitacion].forEach((cama, index) => {  
        const bedDiv = document.createElement('div');  
        bedDiv.className = 'bed';  
        bedDiv.innerText = `CAMA ${index + 1}`;  
        if (cama!== null) {  
            bedDiv.classList.add(cama.sexo === 'M'? 'ocupada-m' : 'ocupada-f');  
            bedDiv.title = `${cama.nombre} - DNI: ${cama.dni} - ${cama.dias} días`;  
        } else {  
            bedDiv.onclick = () => showReservaForm(index);  
        }  
        bedsContainer.appendChild(bedDiv);  
    });  
    showScreen('room-modal');  
}  
  
// 5. Mostrar formulario de reserva  
function showReservaForm(camaIndex) {  
    currentCamaIndex = camaIndex;  
    document.getElementById('reserva-form').reset();  
    showScreen('reserva-form-screen');  
}  
  
// 6. Reservar cama - Se guarda en servidor para todos  
async function reservarCama() {  
    const nombre = document.getElementById('nombre').value.trim();  
    const sexo = document.getElementById('sexo').value;  
    const dni = document.getElementById('dni').value.trim();  
    const dias = document.getElementById('dias').value;  
  
    if (!nombre ||!dni ||!dias) {  
        alert('Completa todos los campos');  
        return;  
    }  
  
    const cliente = { nombre, sexo, dni, dias: parseInt(dias), fecha: new Date().toISOString() };  
  
    const res = await fetch('/api/reservar', {  
        method: 'POST',  
        headers: {'Content-Type': 'application/json'},  
        body: JSON.stringify({ vivienda: currentVivienda, habitacion: currentHabitacion, cama: currentCamaIndex, cliente })  
    });  
  
    const data = await res.json();  
    if (data.ok) {  
        alert('Reserva exitosa');  
        await loadData();  
        showScreen('rooms-menu');  
        openRoom(currentHabitacion); // Recargar modal para ver cama ocupada  
    } else {  
        alert(data.msg);  
        await loadData();  
    }  
}  
  
// 7. Volver al menú principal  
function backToMain() {  
    showScreen('main-menu');  
}  
  
// 8. Volver a lista de habitaciones  
function backToRooms() {  
    showScreen('rooms-menu');  
}  
  
// 9. REPORTES - Con la misma contraseña de siempre: incarail789  
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
        Object.keys(currentData[vivienda]).forEach(hab => {  
            currentData[vivienda][hab].forEach((cama, index) => {  
                if (cama!== null) {  
                    hayOcupadas = true;  
                    const item = document.createElement('div');  
                    item.className = 'reporte-item';  
                    item.innerHTML = `  
                        <span>${vivienda.toUpperCase()} HAB ${hab} - CAMA ${index + 1}: ${cama.nombre} DNI:${cama.dni}</span>  
                        <button onclick="liberarCama('${vivienda}', '${hab}', ${index}, '${PASSWORD}')">Liberar</button>  
                    `;  
                    reportesContainer.appendChild(item);  
                }  
            });  
        });  
    });  
  
    if (!hayOcupadas) reportesContainer.innerHTML = '<p>No hay camas ocupadas</p>';  
    showScreen('reportes-screen');  
}  
  
// 10. Liberar cama desde REPORTES  
async function liberarCama(vivienda, habitacion, cama, password) {  
    if (!confirm('¿Seguro que deseas liberar esta cama?')) return;  
  
    const res = await fetch('/api/liberar', {  
        method: 'POST',  
        headers: {'Content-Type': 'application/json'},  
        body: JSON.stringify({ password, vivienda, habitacion, cama })  
    });  
  
    const data = await res.json();  
    if (data.ok) {  
        alert('Cama liberada');  
        openReportes(); // Recargar reportes  
    } else {  
        alert(data.msg);  
    }  
}  
  
// Iniciar  
document.addEventListener('DOMContentLoaded', () => {  
    loadData();  
    setInterval(loadData, 5000); // Actualizar cada 5 seg para que todos vean los cambios  
});  
