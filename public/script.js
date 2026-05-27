let currentData = {};  
let currentVivienda = '';  
let currentHabitacion = '';  
let currentCama = '';  
const PASS_REPORTES = 'incarail789';  
  
document.addEventListener('DOMContentLoaded', () => {  
  // Animación de llama 2 seg  
  setTimeout(() => {  
    document.getElementById('llama-loader').classList.add('hidden');  
    document.getElementById('app').classList.remove('hidden');  
    loadData();  
  }, 2000);  
  
  // Eventos botones  
  document.getElementById('btn-calicanto').onclick = () => openVivienda('calicanto');  
  document.getElementById('btn-andenes').onclick = () => openVivienda('andenes');  
  document.getElementById('btn-reportes').onclick = () => openReportes();  
  document.querySelectorAll('.close').forEach(btn => btn.onclick = closeModals);  
  document.getElementById('btn-pass').onclick = checkPass;  
  document.getElementById('form-reserva').onsubmit = guardarReserva;  
});  
  
async function loadData() {  
  const res = await fetch('/api/data');  
  currentData = await res.json();  
  updateRoomColors();  
}  
  
function updateRoomColors() {  
  ['calicanto', 'andenes'].forEach(vivienda => {  
    Object.keys(currentData[vivienda]).forEach(hab => {  
      const btn = document.querySelector(`#btn-${vivienda}`);  
      const camas = currentData[vivienda][hab];  
      const ocupadas = Object.values(camas).filter(c => c!== null);  
  
      if (btn) {  
        btn.classList.remove('habitacion-hombres', 'habitacion-mujeres');  
        if (ocupadas.length > 0) {  
          btn.classList.add(ocupadas[0].sexo === 'M'? 'habitacion-hombres' : 'habitacion-mujeres');  
        }  
      }  
    });  
  });  
}  
  
function openVivienda(vivienda) {  
  currentVivienda = vivienda;  
  document.getElementById('modal-titulo').textContent = vivienda.toUpperCase();  
  const lista = document.getElementById('lista-habs');  
  lista.innerHTML = '';  
  
  Object.keys(currentData[vivienda]).forEach(hab => {  
    const camas = currentData[vivienda][hab];  
    const total = 3;  
    const ocupadas = Object.keys(camas).length;  
    const btn = document.createElement('button');  
    btn.className = 'hab-btn ' + (ocupadas === total? 'ocupado' : 'disponible');  
    btn.textContent = `HABITACION ${hab}`;  
    btn.onclick = () => openCuarto(hab);  
    lista.appendChild(btn);  
  });  
  
  document.getElementById('modal-habs').classList.remove('hidden');  
}  
  
function openCuarto(habitacion) {  
  currentHabitacion = habitacion;  
  document.getElementById('modal-habs').classList.add('hidden');  
  const vista = document.getElementById('vista-2d');  
  vista.innerHTML = '';  
  const camas = currentData[currentVivienda][habitacion] || {};  
  
  for (let i = 1; i <= 3; i++) {  
    const camaDiv = document.createElement('div');  
    camaDiv.className = 'cama';  
    camaDiv.innerHTML = `CAMA ${i}<br>${camas[i]? 'OCUPADA' : 'DISPONIBLE'}`;  
    if (camas[i]) {  
      camaDiv.classList.add('ocupada');  
    } else {  
      camaDiv.onclick = () => seleccionarCama(i, camaDiv);  
    }  
    vista.appendChild(camaDiv);  
  }  
  
  document.getElementById('modal-cuarto').classList.remove('hidden');  
}  
  
function seleccionarCama(cama, el) {  
  document.querySelectorAll('.cama').forEach(c => c.classList.remove('seleccionada'));  
  el.classList.add('seleccionada');  
  currentCama = cama;  
  document.getElementById('form-reserva').classList.remove('hidden');  
}  
  
async function guardarReserva(e) {  
  e.preventDefault();  
  const body = {  
    vivienda: currentVivienda,  
    habitacion: currentHabitacion,  
    cama: currentCama,  
    nombre: document.getElementById('nombre').value,  
    sexo: document.getElementById('sexo').value,  
    dni: document.getElementById('dni').value,  
    dias: document.getElementById('dias').value  
  };  
  
  const res = await fetch('/api/reservar', {  
    method: 'POST',  
    headers: {'Content-Type': 'application/json'},  
    body: JSON.stringify(body)  
  });  
  
  if (res.ok) {  
    alert('Reserva guardada');  
    closeModals();  
    loadData();  
  } else {  
    alert((await res.json()).error);  
  }  
}  
  
function openReportes() {  
  document.getElementById('modal-reportes').classList.remove('hidden');  
  document.getElementById('pass-container').classList.remove('hidden');  
  document.getElementById('reportes-content').classList.add('hidden');  
}  
  
function checkPass() {  
  if (document.getElementById('pass-reportes').value === PASS_REPORTES) {  
    document.getElementById('pass-container').classList.add('hidden');  
    document.getElementById('reportes-content').classList.remove('hidden');  
    renderReportes();  
  } else {  
    alert('Contraseña incorrecta');  
  }  
}  
  
function renderReportes() {  
  const izq = document.getElementById('reportes-izq');  
  const der = document.getElementById('reportes-der');  
  izq.innerHTML = ''; der.innerHTML = '';  
  
  ['calicanto', 'andenes'].forEach(vivienda => {  
    Object.keys(currentData[vivienda]).forEach(hab => {  
      Object.keys(currentData[vivienda][hab]).forEach(cama => {  
        const user = currentData[vivienda][hab][cama];  
        const texto = `${user.nombre} - DNI:${user.dni} - ${user.sexo} - ${user.dias} dias - ${vivienda.toUpperCase()} - HAB ${hab} - CAMA ${cama}`;  
  
        izq.innerHTML += `<div class="reporte-item">${texto}</div>`;  
        der.innerHTML += `<div class="reporte-item">${user.nombre} - ${vivienda.toUpperCase()} - HAB ${hab} <button class="btn-liberar" onclick="liberar('${vivienda}','${hab}','${cama}')">LIBERAR</button></div>`;  
      });  
    });  
  });  
}  
  
async function liberar(vivienda, habitacion, cama) {  
  await fetch('/api/liberar', {  
    method: 'POST',  
    headers: {'Content-Type': 'application/json'},  
    body: JSON.stringify({vivienda, habitacion, cama})  
  });  
  loadData();  
  renderReportes();  
}  
  
function closeModals() {  
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));  
  document.getElementById('form-reserva').classList.add('hidden');  
  document.getElementById('form-reserva').reset();  
}  
