const CLAVE = 'incarail789';  
const VIVIENDAS = {  
  CALICANTO: [5, 10, 11, 19, 21, 22, 23],  
  ANDENES: [34, 35, 38, 39]  
};  
let data = { reservas: [] };  
let estado = {}; // vivienda, habitacion, cama  
  
function entrar() {  
  document.getElementById('intro').style.display = 'none';  
  document.getElementById('main').style.display = 'block';  
  cargarData();  
}  
  
async function cargarData() {  
  const res = await fetch('/api/reservas');  
  data = await res.json();  
}  
  
function cerrarModal() {  
  document.getElementById('modal').style.display = 'none';  
  document.getElementById('overlay').style.display = 'none';  
  cargarData().then(() => {});  
}  
  
function abrirVivienda(vivienda) {  
  estado.vivienda = vivienda;  
  let html = `<button class="cerrar" onclick="cerrarModal()">X</button><h2>${vivienda}</h2><div>`;  
  VIVIENDAS[vivienda].forEach(hab => {  
    const ocupadas = data.reservas.filter(r => r.vivienda === vivienda && r.habitacion == hab);  
    let clase = 'disponible';  
    if (ocupadas.length > 0) clase = ocupadas[0].sexo === 'M' ? 'ocupado-m' : 'ocupado-f';  
    html += `<div class="habitacion ${clase}" onclick="abrirCuarto(${hab})">HAB ${hab}</div>`;  
  });  
  html += '</div>';  
  mostrarModal(html);  
}  
  
function abrirCuarto(habitacion) {  
  estado.habitacion = habitacion;  
  let html = `<button class="cerrar" onclick="abrirVivienda('${estado.vivienda}')">Volver</button><h2>HAB ${habitacion}</h2>`;  
  html += '<div class="cuarto-2d">';  
  for (let i = 1; i <= 3; i++) {  
    const ocupada = data.reservas.find(r => r.vivienda === estado.vivienda && r.habitacion == habitacion && r.cama == i);  
    html += `<div class="cama ${ocupada ? 'ocupada' : ''}" onclick="seleccionarCama(${i})">${i}</div>`;  
  }  
  html += '</div>';  
  mostrarModal(html);  
}  
  
function seleccionarCama(cama) {  
  estado.cama = cama;  
  const html = `  
    <button class="cerrar" onclick="abrirCuarto(${estado.habitacion})">Volver</button>  
    <h2>Reservar HAB ${estado.habitacion} Cama ${cama}</h2>  
    <div class="form-reserva">  
      <input id="nombre" placeholder="NOMBRE COMPLETO" required>  
      <select id="sexo"><option value="">SEXO</option><option value="M">M - MASCULINO</option><option value="F">F - FEMENINO</option></select>  
      <input id="dni" placeholder="DNI" required>  
      <input id="dias" type="number" placeholder="CUANTOS DIAS" required>  
      <button onclick="guardarReserva()">GUARDAR</button>  
    </div>`;  
  mostrarModal(html);  
}  
  
async function guardarReserva() {  
  const nombre = document.getElementById('nombre').value;  
  const sexo = document.getElementById('sexo').value;  
  const dni = document.getElementById('dni').value;  
  const dias = document.getElementById('dias').value;  
  if (!nombre || !sexo || !dni || !dias) return alert('Completa todos los campos');  
  
  const res = await fetch('/api/reservar', {  
    method: 'POST',  
    headers: {'Content-Type': 'application/json'},  
    body: JSON.stringify({...estado, nombre, sexo, dni, dias})  
  });  
  const r = await res.json();  
  if (r.error) return alert(r.error);  
  alert('Reservado');  
  cerrarModal();  
}  
  
function abrirReportes() {  
  const pass = prompt('Ingrese contraseña para ver Reportes:');  
  if (pass !== CLAVE) return alert('Contraseña incorrecta');  
    
  let izq = '<h3>Todos los Registros</h3>';  
  let der = '<h3>Liberar Camas</h3>';  
  if (data.reservas.length === 0) {  
    izq += '<p>No hay registros</p>';  
    der += '<p>No hay registros</p>';  
  } else {  
    data.reservas.forEach(r => {  
      izq += `<p>${r.nombre} - HAB ${r.habitacion} - ${r.vivienda} - cama ${r.cama}</p>`;  
      der += `<div class="item-reporte">${r.nombre} - ${r.vivienda} - HAB ${r.habitacion} <button onclick="liberar('${r.vivienda}',${r.habitacion},${r.cama})">Liberar</button></div>`;  
    });  
  }  
  const html = `<button class="cerrar" onclick="cerrarModal()">X</button><h2>REPORTES</h2><div class="reportes-split"><div class="reportes-col">${izq}</div><div class="reportes-col">${der}</div></div>`;  
  mostrarModal(html);  
}  
  
async function liberar(vivienda, habitacion, cama) {  
  if (!confirm('¿Liberar esta cama?')) return;  
  await fetch('/api/liberar', {  
    method: 'POST',  
    headers: {'Content-Type': 'application/json'},  
    body: JSON.stringify({vivienda, habitacion, cama})  
  });  
  await cargarData();  
  abrirReportes();  
}  
  
function mostrarModal(html) {  
  document.getElementById('modal').innerHTML = html;  
  document.getElementById('modal').style.display = 'block';  
  document.getElementById('overlay').style.display = 'block';  
}  
