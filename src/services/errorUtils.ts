import { FirebaseError } from "firebase/app"

/**
 * Extrae el código de error de Firebase de manera segura a partir de una excepción desconocida.
 */
export function getFirebaseErrorCode(error: unknown): string {
    if (error instanceof FirebaseError) {
        return error.code
    }
    if (typeof error === "object" && error !== null && "code" in error) {
        return String((error as { code: unknown }).code)
    }
    return ""
}

/**
 * Convierte un error desconocido en un mensaje formateado o string legible.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === "string") {
        return error
    }
    return "Ocurrió un error inesperado."
}
