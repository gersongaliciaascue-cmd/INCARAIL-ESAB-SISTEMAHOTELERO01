// CONFIGURACIÓN INICIAL  
const CONFIG = {  
  password: 'incarail789',  
  viviendas: {  
    CALICANTO: ['HABITACION 5', 'HABITACION 10', 'HABITACION 11', 'HABITACION 19', 'HABITACION 21', 'HABITACION 22', 'HABITACION 23'],  
    ANDENES: ['HABITACION 34', 'HABITACION 35', 'HABITACION 38', 'HABITACION 39']  
  },  
  camasPorHab: 3  
};  
  
// ESTADO GLOBAL  
let datos = JSON.parse(localStorage.getItem('esab_datos')) || {};  
let seleccionActual = { vivienda: '', habitacion: '', cama: null };  
  
// BLOC DE NOTAS AISLADO  
const BlocNotas = (() => {  
  const textarea = document.getElementById('notaTexto');  
  const clave = 'esab_bloc_notas';  
  
  textarea.value = localStorage.getItem(clave) || '';  
  textarea.addEventListener('input', () => {  
    localStorage.setItem(clave, textarea.value);  
  });  
})();  
  
// UTILIDADES  
const guardarDatos = () => localStorage.setItem('esab_datos', JSON.stringify(datos));  
const $ = id => document.getElementById(id);  
  
// 1. INTRO  
$('btnIngresar').addEventListener('click', () => {  
  $('intro').classList.add('oculto');  
  $('main').classList.remove('oculto');  
});  
  
// 2. MENU PRINCIPAL  
$('btnCalicanto').addEventListener('click', () => abrirVivienda('CALICANTO'));  
$('btnAndenes').addEventListener('click', () => abrirVivienda('ANDENES'));  
$('btnReportes').addEventListener('click', solicitarPassword);  
  
// 3. ABRIR VIVIENDA  
function abrirVivienda(vivienda) {  
  seleccionActual.vivienda = vivienda;  
  $('tituloVivienda').textContent = vivienda;  
  
  const contenedor = $('listaHabitaciones');  
  contenedor.innerHTML = '';  
  
  CONFIG.viviendas[vivienda].forEach(hab => {  
    const btn = document.createElement('button');  
    btn.className = 'btn-habitacion';  
    btn.textContent = hab;  
  
    const estado = obtenerEstadoHabitacion(vivienda, hab);  
    if (estado.ocupada) {  
      btn.classList.add('ocupada');  
      btn.classList.add(estado.sexo === 'M'? 'hombre' : 'mujer');  
      btn.disabled = true;  
    }  
  
    btn.addEventListener('click', () => abrirCuarto(hab));  
    contenedor.appendChild(btn);  
  });  
  
  $('modalVivienda').classList.remove('oculto');  
}  
  
$('cerrarVivienda').addEventListener('click', () => $('modalVivienda').classList.add('oculto'));  
  
// 4. ABRIR CUARTO 2D  
function abrirCuarto(habitacion) {  
  seleccionActual.habitacion = habitacion;  
  $('tituloCuarto').textContent = `${seleccionActual.vivienda} - ${habitacion}`;  
  
  const contenedor = $('cuarto2D');  
  contenedor.innerHTML = '';  
  
  for (let i = 1; i <= CONFIG.camasPorHab; i++) {  
    const camaDiv = document.createElement('div');  
    camaDiv.className = 'cama';  
  
    const ocupada = estaCamaOcupada(seleccionActual.vivienda, habitacion, i);  
    if (ocupada) camaDiv.classList.add('ocupada');  
  
    camaDiv.innerHTML = `  
      <h4>CAMA ${i}</h4>  
      <input type="checkbox" id="cama${i}" ${ocupada? 'disabled' : ''}>  
    `;  
  
    if (!ocupada) {  
      camaDiv.addEventListener('click', () => seleccionarCama(i));  
    }  
  
    contenedor.appendChild(camaDiv);  
  }  
  
  $('modalCuarto').classList.remove('oculto');  
}  
  
$('cerrarCuarto').addEventListener('click', () => $('modalCuarto').classList.add('oculto'));  
  
function seleccionarCama(numCama) {  
  seleccionActual.cama = numCama;  
  $('modalCuarto').classList.add('oculto');  
  $('modalFormulario').classList.remove('oculto');  
  $('formRegistro').reset();  
}  
  
$('cerrarFormulario').addEventListener('click', () => $('modalFormulario').classList.add('oculto'));  
  
// 5. GUARDAR REGISTRO  
$('formRegistro').addEventListener('submit', e => {  
  e.preventDefault();  
  
  const registro = {  
    nombre: $('nombreCompleto').value.toUpperCase(),  
    sexo: $('sexo').value,  
    dni: $('dni').value,  
    dias: $('dias').value,  
    vivienda: seleccionActual.vivienda,  
    habitacion: seleccionActual.habitacion,  
    cama: seleccionActual.cama,  
    fecha: new Date().toISOString()  
  };  
  
  const key = `${seleccionActual.vivienda}_${seleccionActual.habitacion}_CAMA${seleccionActual.cama}`;  
  datos[key] = registro;  
  guardarDatos();  
  
  $('modalFormulario').classList.add('oculto');  
  alert('Registro guardado correctamente');  
  abrirVivienda(seleccionActual.vivienda);  
});  
  
// 6. REPORTES CON PASSWORD  
function solicitarPassword() {  
  const pass = prompt('Ingrese contraseña para acceder a REPORTES:');  
  if (pass === CONFIG.password) {  
    mostrarReportes();  
  } else if (pass!== null) {  
    alert('Contraseña incorrecta');  
  }  
}  
  
function mostrarReportes() {  
  const listaCompleta = $('listaCompleta');  
  const listaLiberar = $('listaLiberar');  
  
  listaCompleta.innerHTML = '';  
  listaLiberar.innerHTML = '';  
  
  const registros = Object.values(datos);  
  
  if (registros.length === 0) {  
    listaCompleta.innerHTML = '<p>No hay registros</p>';  
    listaLiberar.innerHTML = '<p>No hay registros</p>';  
  } else {  
    registros.forEach(reg => {  
      // Izquierda: Detalle completo  
      const item1 = document.createElement('div');  
      item1.className = 'item-reporte';  
      item1.textContent = `${reg.nombre} - ${reg.habitacion} - ${reg.vivienda} - CAMA ${reg.cama}`;  
      listaCompleta.appendChild(item1);  
  
      // Derecha: Con botón liberar  
      const item2 = document.createElement('div');  
      item2.className = 'item-reporte';  
      item2.innerHTML = `  
        <span>${reg.nombre} - ${reg.vivienda} - ${reg.habitacion}</span>  
        <button class="btn-liberar" data-key="${reg.vivienda}_${reg.habitacion}_CAMA${reg.cama}">LIBERAR</button>  
      `;  
      listaLiberar.appendChild(item2);  
    });  
  
    // Eventos liberar  
    document.querySelectorAll('.btn-liberar').forEach(btn => {  
      btn.addEventListener('click', e => {  
        const key = e.target.dataset.key;  
        if (confirm('¿Seguro que desea liberar esta habitación?')) {  
          delete datos[key];  
          guardarDatos();  
          mostrarReportes();  
          abrirVivienda(seleccionActual.vivienda);  
        }  
      });  
    });  
  }  
  
  $('modalReportes').classList.remove('oculto');  
}  
  
$('cerrarReportes').addEventListener('click', () => $('modalReportes').classList.add('oculto'));  
  
// 7. LÓGICA DE OCUPACIÓN  
function obtenerEstadoHabitacion(vivienda, habitacion) {  
  const camasOcupadas = [];  
  for (let i = 1; i <= CONFIG.camasPorHab; i++) {  
    const key = `${vivienda}_${habitacion}_CAMA${i}`;  
    if (datos[key]) camasOcupadas.push(datos[key]);  
  }  
  
  if (camasOcupadas.length === 0) return { ocupada: false };  
  return { ocupada: true, sexo: camasOcupadas[0].sexo };  
}  
  
function estaCamaOcupada(vivienda, habitacion, cama) {  
  const key = `${vivienda}_${habitacion}_CAMA${cama}`;  
  return!!datos[key];  
}  
