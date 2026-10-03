/**
 * app.js — Lógica del sitio (Fetch + Dialogs)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 */

const API = '/alumnos';
const API_KEY = 'umg-2026';

const cabeceras = (conJson = true) => ({
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': API_KEY,
});

const tabla = document.querySelector('#tablaAlumnos tbody');
const mensaje = document.querySelector('#mensaje');
const dialogoForm = document.querySelector('#dialogoForm');
const dialogoEliminar = document.querySelector('#dialogoEliminar');
const form = document.querySelector('#formAlumno');
const tituloForm = document.querySelector('#tituloForm');
const nombreEliminar = document.querySelector('#nombreEliminar');

let idEnEdicion = null;
let idAEliminar = null;

// Cargar todos los alumnos
async function cargarAlumnos() {
    try {
        const respuesta = await fetch(API);

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar los alumnos');
        }

        const alumnos = await respuesta.json();

        tabla.innerHTML = '';

        alumnos.forEach((alumno) => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${alumno.id}</td>
                <td>${alumno.nombre}</td>
                <td>${alumno.apellido}</td>
                <td>${alumno.email}</td>
                <td>${alumno.edad ?? ''}</td>
                <td>
                    <button type="button" class="btnEditar">Editar</button>
                    <button type="button" class="btnEliminar">Eliminar</button>
                </td>
            `;

            fila.querySelector('.btnEditar').addEventListener('click', () => {
                abrirDialogoEditar(alumno.id);
            });

            fila.querySelector('.btnEliminar').addEventListener('click', () => {
                idAEliminar = alumno.id;
                nombreEliminar.textContent =
                    `${alumno.nombre} ${alumno.apellido}`;

                dialogoEliminar.showModal();
            });

            tabla.appendChild(fila);
        });
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

// Abrir formulario para crear alumno
function abrirDialogoNuevo() {
    form.reset();
    idEnEdicion = null;
    tituloForm.textContent = 'Nuevo alumno';
    dialogoForm.showModal();
}

// Abrir formulario para editar alumno
async function abrirDialogoEditar(id) {
    try {
        const respuesta = await fetch(`${API}/${id}`);

        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el alumno');
        }

        const alumno = await respuesta.json();

        idEnEdicion = alumno.id;

        form.elements.nombre.value = alumno.nombre;
        form.elements.apellido.value = alumno.apellido;
        form.elements.email.value = alumno.email;
        form.elements.edad.value = alumno.edad ?? '';

        tituloForm.textContent = 'Editar alumno';

        dialogoForm.showModal();
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

// Crear o actualizar alumno
async function guardarAlumno(event) {
    event.preventDefault();

    const edadTexto = form.elements.edad.value;

    const datos = {
        nombre: form.elements.nombre.value.trim(),
        apellido: form.elements.apellido.value.trim(),
        email: form.elements.email.value.trim(),
        ...(edadTexto !== '' ? { edad: Number(edadTexto) } : {}),
    };

    const editando = idEnEdicion !== null;

    const url = editando
        ? `${API}/${idEnEdicion}`
        : API;

    const metodo = editando
        ? 'PUT'
        : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: cabeceras(),
            body: JSON.stringify(datos),
        });

        if (!respuesta.ok) {
            let detalle = 'No se pudo guardar el alumno';

            try {
                const error = await respuesta.json();
                detalle = error.error ?? detalle;
            } catch {
                // Se mantiene el mensaje general
            }

            throw new Error(detalle);
        }

        dialogoForm.close();

        mostrarMensaje(
            editando
                ? 'Alumno actualizado correctamente'
                : 'Alumno creado correctamente'
        );

        idEnEdicion = null;

        await cargarAlumnos();
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

// Abrir confirmación para eliminar
function eliminarAlumno(id) {
    idAEliminar = id;
    dialogoEliminar.showModal();
}

// Confirmar eliminación
async function confirmarEliminacion() {
    if (!idAEliminar) {
        return;
    }

    try {
        const respuesta = await fetch(`${API}/${idAEliminar}`, {
            method: 'DELETE',
            headers: cabeceras(false),
        });

        if (!respuesta.ok) {
            let detalle = 'No se pudo eliminar el alumno';

            try {
                const error = await respuesta.json();
                detalle = error.error ?? detalle;
            } catch {
                // Se mantiene el mensaje general
            }

            throw new Error(detalle);
        }

        dialogoEliminar.close();

        idAEliminar = null;

        mostrarMensaje('Alumno eliminado correctamente');

        await cargarAlumnos();
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

// Mostrar mensajes
function mostrarMensaje(texto, tipo = 'ok') {
    mensaje.textContent = texto;
    mensaje.className = tipo;
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelector('#btnNuevo')
        .addEventListener('click', abrirDialogoNuevo);

    form.addEventListener('submit', guardarAlumno);

    document
        .querySelector('#btnCancelar')
        .addEventListener('click', () => {
            dialogoForm.close();
        });

    document
        .querySelector('#btnCancelarEliminar')
        .addEventListener('click', () => {
            dialogoEliminar.close();
            idAEliminar = null;
        });

    document
        .querySelector('#btnConfirmarEliminar')
        .addEventListener('click', confirmarEliminacion);

    cargarAlumnos();
});