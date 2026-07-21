/**
 * HTTP Inspector CLI
 *
 * Tarea de la Sesión 1: Fundamentos de la Web.
 *
 * Esta herramienta trabaja únicamente con la biblioteca estándar de Node.js
 * y tipos básicos de TypeScript. No realiza solicitudes de red y tampoco
 * utiliza async/await ni librerías externas.
 *
 * Su propósito es aplicar conceptos básicos de HTTP mediante funciones puras
 * para analizar URLs, clasificar códigos de estado, procesar cabeceras y
 * generar un resumen legible de una petición.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/**
 * Representa las partes principales obtenidas al analizar una URL.
 */
export interface UrlParts {
  /** Protocolo de la URL, por ejemplo: "https:". */
  protocol: string;

  /** Dominio y puerto, si existe. */
  host: string;

  /** Ruta de la URL. */
  pathname: string;

  /** Cadena de búsqueda incluyendo el signo "?". */
  search: string;

  /** Lista de parámetros de consulta en pares clave-valor. */
  query: Array<[string, string]>;
}

/**
 * Categorías disponibles para clasificar un código de estado HTTP.
 */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/**
 * Objeto que representa un conjunto de cabeceras HTTP.
 */
export type Headers = Record<string, string>;

// ---------------------------------------------------------------------------
// Funciones
// ---------------------------------------------------------------------------

/**
 * Analiza una URL y devuelve sus partes principales.
 *
 * @param url URL que se desea analizar.
 * @returns Objeto con protocolo, host, ruta, búsqueda y parámetros.
 * @throws Error si la URL proporcionada no es válida.
 *
 * @example
 * const result = parseUrl(
 *   "https://api.ejemplo.com/users?id=1&name=Ana",
 * );
 *
 * console.log(result.host);
 * // "api.ejemplo.com"
 */
export function parseUrl(url: string): UrlParts {
  const parsedUrl = new URL(url);

  return {
    protocol: parsedUrl.protocol,
    host: parsedUrl.host,
    pathname: parsedUrl.pathname,
    search: parsedUrl.search,
    query: Array.from(parsedUrl.searchParams.entries()),
  };
}

/**
 * Clasifica un código de estado HTTP según el rango al que pertenece.
 *
 * @param code Código de estado HTTP que se desea clasificar.
 * @returns Categoría correspondiente al código.
 *
 * @example
 * classifyStatus(200);
 * // "2xx Éxito"
 *
 * @example
 * classifyStatus(404);
 * // "4xx Error del cliente"
 */
export function classifyStatus(code: number): StatusCategory {
  if (code >= 100 && code <= 199) {
    return "1xx Informativo";
  }

  if (code >= 200 && code <= 299) {
    return "2xx Éxito";
  }

  if (code >= 300 && code <= 399) {
    return "3xx Redirección";
  }

  if (code >= 400 && code <= 499) {
    return "4xx Error del cliente";
  }

  if (code >= 500 && code <= 599) {
    return "5xx Error del servidor";
  }

  return "Desconocido";
}

/**
 * Convierte un bloque de texto con cabeceras HTTP en un objeto.
 *
 * Cada cabecera debe tener el formato `Nombre: valor`.
 * Las líneas vacías y las líneas que no contienen dos puntos se ignoran.
 * También se eliminan los espacios sobrantes del nombre y del valor.
 *
 * @param text Texto que contiene una o varias cabeceras HTTP.
 * @returns Objeto con las cabeceras válidas encontradas.
 *
 * @example
 * const headers = parseHeaders(
 *   "Content-Type: application/json\nAuthorization: Bearer abc",
 * );
 *
 * console.log(headers);
 * // {
 * //   "Content-Type": "application/json",
 * //   "Authorization": "Bearer abc"
 * // }
 */
export function parseHeaders(text: string): Headers {
  const headers: Headers = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const name = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!name) {
      continue;
    }

    headers[name] = value;
  }

  return headers;
}

/**
 * Genera un resumen legible de una petición HTTP.
 *
 * Esta función combina los resultados de `parseUrl`, `classifyStatus`
 * y `parseHeaders`.
 *
 * @param url URL de la petición.
 * @param status Código de estado HTTP.
 * @param headersText Cabeceras HTTP escritas como texto.
 * @returns Resumen de la petición en formato de texto.
 *
 * @example
 * const summary = summarizeRequest(
 *   "https://api.ejemplo.com/users",
 *   200,
 *   "Content-Type: application/json",
 * );
 *
 * console.log(summary);
 */
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {
  const urlParts = parseUrl(url);
  const statusCategory = classifyStatus(status);
  const headers = parseHeaders(headersText);
  const headerEntries = Object.entries(headers);

  const lines: string[] = [
    "Resumen de la petición HTTP",
    `URL: ${url}`,
    `Protocolo: ${urlParts.protocol}`,
    `Host: ${urlParts.host}`,
    `Ruta: ${urlParts.pathname}`,
    `Estado: ${status} - ${statusCategory}`,
    "Cabeceras:",
  ];

  if (headerEntries.length === 0) {
    lines.push("- Sin cabeceras");
  } else {
    for (const [name, value] of headerEntries) {
      lines.push(`- ${name}: ${value}`);
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

/**
 * Ejecuta el comando recibido desde la terminal.
 *
 * Los comandos disponibles son:
 *
 * - `parse-url`
 * - `status`
 * - `headers`
 * - `summary`
 */
function main(): void {
  const [, , command, ...args] = process.argv;

  if (!command) {
    console.log("Uso:");
    console.log('  npm start -- parse-url "https://ejemplo.com/ruta?id=1"');
    console.log("  npm start -- status 404");
    console.log('  npm start -- headers "Content-Type: application/json"');
    console.log(
      '  npm start -- summary "https://ejemplo.com" 200 "Content-Type: application/json"',
    );
    return;
  }

  try {
    switch (command) {
      case "parse-url": {
        const url = args[0];

        if (!url) {
          throw new Error("Debes proporcionar una URL.");
        }

        console.log(JSON.stringify(parseUrl(url), null, 2));
        break;
      }

      case "status": {
        const codeText = args[0];

        if (!codeText) {
          throw new Error("Debes proporcionar un código de estado.");
        }

        const code = Number(codeText);

        if (!Number.isInteger(code)) {
          throw new Error("El código de estado debe ser un número entero.");
        }

        console.log(classifyStatus(code));
        break;
      }

      case "headers": {
        const headersText = args.join(" ");

        if (!headersText) {
          throw new Error("Debes proporcionar las cabeceras.");
        }

        console.log(JSON.stringify(parseHeaders(headersText), null, 2));
        break;
      }

      case "summary": {
        const url = args[0];
        const statusText = args[1];
        const headersText = args.slice(2).join(" ");

        if (!url || !statusText) {
          throw new Error(
            "Debes proporcionar la URL, el código de estado y las cabeceras.",
          );
        }

        const status = Number(statusText);

        if (!Number.isInteger(status)) {
          throw new Error("El código de estado debe ser un número entero.");
        }

        console.log(summarizeRequest(url, status, headersText));
        break;
      }

      default:
        throw new Error(`Comando desconocido: ${command}`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("Ocurrió un error desconocido.");
    }

    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}