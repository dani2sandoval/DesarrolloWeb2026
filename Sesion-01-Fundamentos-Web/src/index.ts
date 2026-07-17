/**
 * HTTP Inspector CLI
 *
 * Tarea de la Sesión 1: Fundamentos de la Web
 *
 * Esta tarea NO usa la red, ni async/await, ni librerías externas.
 * Solo la biblioteca estándar de Node + tipos básicos de TypeScript.
 *
 * Idea: aplicar lo que aprendiste sobre HTTP (URLs, métodos, códigos
 * de estado y cabeceras) implementando pequeñas funciones puras.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Resultado de analizar una URL. */
export interface UrlParts {
  /** Protocolo tal como lo devuelve la WHATWG URL, p. ej. "https:". */
  protocol: string;

  /** Host (puede incluir puerto), p. ej. "api.ejemplo.com:443". */
  host: string;

  /** Ruta, p. ej. "/users". */
  pathname: string;

  /** Query string con el "?" inicial, p. ej. "?id=1&name=Ana". */
  search: string;

  /** Lista de pares [clave, valor] de los query params. */
  query: Array<[string, string]>;
}

/** Categoría de un código de estado HTTP. */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/** Mapa de cabeceras HTTP. */
export type Headers = Record<string, string>;

// ---------------------------------------------------------------------------
// Funciones a implementar
// ---------------------------------------------------------------------------

/**
 * Analiza una URL y devuelve sus partes.
 *
 * @param url URL que se desea analizar.
 * @returns Las partes principales de la URL.
 *
 * Si la URL no es válida, el constructor URL lanza un error automáticamente.
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
 * Clasifica un código de estado HTTP según su rango.
 *
 * @param code Código de estado HTTP.
 * @returns La categoría correspondiente al código.
 */
export function classifyStatus(code: number): StatusCategory {
  if (code >= 100 && code <= 199) {
    return "1xx Informativo";
  } else if (code >= 200 && code <= 299) {
    return "2xx Éxito";
  } else if (code >= 300 && code <= 399) {
    return "3xx Redirección";
  } else if (code >= 400 && code <= 499) {
    return "4xx Error del cliente";
  } else if (code >= 500 && code <= 599) {
    return "5xx Error del servidor";
  }

  return "Desconocido";
}

/**
 * TODO: Parsea un texto con líneas de cabeceras HTTP al formato
 * `Record<string, string>`. El separador entre nombre y valor es ":".
 *
 * Reglas:
 *   - Cada línea no vacía debe tener formato "Nombre: valor".
 *   - Ignora líneas vacías o que no contengan ":".
 *   - No tienes que normalizar mayúsculas/minúsculas del nombre.
 *
 * Ejemplo:
 *   parseHeaders("Content-Type: application/json\nAuthorization: Bearer abc")
 *   → { "Content-Type": "application/json", "Authorization": "Bearer abc" }
 *
 * Pista: `text.split("\n")` te da las líneas; `String.split(":")` te separa
 * nombre y valor. Recuerda `.trim()` para quitar espacios sobrantes.
 */
export function parseHeaders(text: string): Headers {
  // TODO: tu implementación aquí
  throw new Error("Not implemented");
}

/**
 * TODO: Combina las funciones anteriores en un resumen legible.
 *
 * El formato exacto lo decides tú (los tests solo verifican que el string
 * no esté vacío y que contenga la URL y el código). Un ejemplo:
 *
 *   Resumen de la petición
 *   ──────────────────────
 *   URL:     https://api.ejemplo.com/users
 *   Status:  200 (2xx Éxito)
 *   Headers:
 *     • Content-Type: application/json
 *     • Authorization: Bearer abc
 */
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {
  // TODO: tu implementación aquí
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// CLI (opcional, pero recomendado para probar manualmente)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const [, , cmd, ...args] = process.argv;

  try {
    if (cmd === "parse-url" && args[0]) {
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2));
    } else if (cmd === "status" && args[0]) {
      const cat = classifyStatus(Number(args[0]));
      console.log(cat);
    } else if (cmd === "headers" && args.length > 0) {
      const h = parseHeaders(args.join(" "));
      console.log(JSON.stringify(h, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      const [url, status, ...rest] = args;
      console.log(summarizeRequest(url, Number(status), rest.join(" ")));
    } else {
      console.log("Uso:");
      console.log('  npm start parse-url "https://ejemplo.com/path?a=1"');
      console.log("  npm start status 404");
      console.log('  npm start headers "Content-Type: application/json"');
      console.log(
        '  npm start summary "https://x.com" 200 "Content-Type: application/json"',
      );
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
    process.exit(1);
  }
}