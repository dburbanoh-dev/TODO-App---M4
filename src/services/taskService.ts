import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    type Timestamp,
    type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Task } from "../types/task"

const TASKS_COLLECTION = "tasks"

/**
 * Suscribe a los cambios en vivo de las tareas de un usuario específico en Firestore.
 */
export function subscribeTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    onError?: (error: unknown) => void
): Unsubscribe {
    const tasksRef = collection(db, TASKS_COLLECTION)
    const q = query(tasksRef, where("userId", "==", userId))

    return onSnapshot(
        q,
        (snapshot) => {
            const tasks: Task[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data()
                let createdAt = new Date()

                if (data.createdAt) {
                    if (typeof (data.createdAt as Timestamp).toDate === "function") {
                        createdAt = (data.createdAt as Timestamp).toDate()
                    } else if (data.createdAt instanceof Date) {
                        createdAt = data.createdAt
                    } else {
                        createdAt = new Date(data.createdAt)
                    }
                }

                return {
                    id: docSnap.id,
                    title: data.title || "",
                    description: data.description || "",
                    completed: Boolean(data.completed),
                    userId: data.userId || userId,
                    createdAt: createdAt,
                }
            })

            // Ordenar por fecha de creación descendente en memoria
            tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

            callback(tasks)
        },
        (error) => {
            console.error("Error al escuchar tareas de Firestore:", error)
            if (onError) {
                onError(error)
            }
        }
    )
}

/**
 * Añade una nueva tarea vinculada al usuario en Firestore.
 */
export async function addTask(
    userId: string,
    title: string,
    description: string
): Promise<string> {
    const tasksRef = collection(db, TASKS_COLLECTION)
    const docRef = await addDoc(tasksRef, {
        userId,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: serverTimestamp(),
    })
    return docRef.id
}

/**
 * Cambia el estado de completada de una tarea existente en Firestore.
 */
export async function toggleTaskComplete(
    taskId: string,
    currentCompleted: boolean
): Promise<void> {
    const taskDocRef = doc(db, TASKS_COLLECTION, taskId)
    await updateDoc(taskDocRef, {
        completed: !currentCompleted,
    })
}

/**
 * Elimina una tarea por su ID en Firestore.
 */
export async function deleteTask(taskId: string): Promise<void> {
    const taskDocRef = doc(db, TASKS_COLLECTION, taskId)
    await deleteDoc(taskDocRef)
}
