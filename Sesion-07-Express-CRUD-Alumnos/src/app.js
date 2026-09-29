/**
 * app.js — Servidor Express (API REST + sitio estático)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 */

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RepositorioAlumnos, datosSemilla } from './repositorio.js';

// __dirname en ES Modules
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// ============================================================
// MIDDLEWARES
// ============================================================

/**
 * Autenticación falsa mediante x-api-key.
 */
export function autenticacionFalsa(req, res, next) {
    const clave = req.get('x-api-key');
    const claveCorrecta = process.env.API_KEY ?? 'umg-2026';

    if (clave !== claveCorrecta) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    next();
}

/**
 * Valida los datos de un alumno.
 */
export function validarAlumno(req, res, next) {
    const { nombre, apellido, email, edad } = req.body;

    if (
        typeof nombre !== 'string' ||
        nombre.trim() === '' ||
        typeof apellido !== 'string' ||
        apellido.trim() === '' ||
        typeof email !== 'string' ||
        email.trim() === '' ||
        !email.includes('@')
    ) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    if (
        edad !== undefined &&
        (typeof edad !== 'number' || edad < 0)
    ) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    next();
}

// ============================================================
// CREAR APP
// ============================================================

export function crearApp(
    repositorio = new RepositorioAlumnos(datosSemilla)
) {
    const app = express();

    // Permite recibir JSON
    app.use(express.json());

    // Sirve el sitio web de public/
    app.use(express.static(join(__dirname, '..', 'public')));

    // ========================================================
    // GET /alumnos
    // ========================================================

    app.get('/alumnos', (req, res) => {
        res.status(200).json(repositorio.listar());
    });

    // ========================================================
    // GET /alumnos/:id
    // ========================================================

    app.get('/alumnos/:id', (req, res) => {
        const alumno = repositorio.obtener(req.params.id);

        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        res.status(200).json(alumno);
    });

    // ========================================================
    // POST /alumnos
    // ========================================================

    app.post(
        '/alumnos',
        autenticacionFalsa,
        validarAlumno,
        (req, res) => {
            const alumno = repositorio.crear(req.body);

            res.status(201).json(alumno);
        }
    );

    // ========================================================
    // PUT /alumnos/:id
    // ========================================================

    app.put(
        '/alumnos/:id',
        autenticacionFalsa,
        validarAlumno,
        (req, res) => {
            const alumnoExistente = repositorio.obtener(req.params.id);

            if (!alumnoExistente) {
                return res.status(404).json({
                    error: 'Alumno no encontrado'
                });
            }

            const actualizado = repositorio.actualizar(
                req.params.id,
                req.body
            );

            res.status(200).json(actualizado);
        }
    );

    // ========================================================
    // DELETE /alumnos/:id
    // ========================================================

    app.delete(
        '/alumnos/:id',
        autenticacionFalsa,
        (req, res) => {
            const eliminado = repositorio.eliminar(req.params.id);

            if (!eliminado) {
                return res.status(404).json({
                    error: 'Alumno no encontrado'
                });
            }

            res.status(204).send();
        }
    );

    return app;
}