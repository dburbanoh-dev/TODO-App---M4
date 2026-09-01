import type { Task } from "../types/task"
import TaskList from "../components/TaskList"
import TaskForm from "../components/TaskForm"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { signOut, onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "../services/firebase"
import {
    subscribeTasks,
    addTask,
    toggleTaskComplete,
    deleteTask,
} from "../services/taskService"
import { getErrorMessage } from "../services/errorUtils"
import "./Home.css"

const LOCAL_STORAGE_KEY = "tasks_fallback"

function Home() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loadingTasks, setLoadingTasks] = useState(true)
    const [error, setError] = useState<string>("")

    // Escuchar el estado de autenticación dinámicamente
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
        })
        return () => unsubscribeAuth()
    }, [])

    const userName = currentUser?.displayName
        ? currentUser.displayName.split(" ")[0]
        : "Bienvenido"

    // Sincronización en tiempo real con Firestore con fallback a localStorage
    useEffect(() => {
        if (!currentUser) {
            return
        }

        // Temporizador de respaldo por si Firestore no responde (ej. base de datos no creada en Firebase Console)
        const timeoutId = setTimeout(() => {
            setLoadingTasks((prevLoading) => {
                if (prevLoading) {
                    setError(
                        "No se pudo conectar con Firestore. Si aún no has habilitado Cloud Firestore en Firebase Console, verifica tu configuración. Se utilizará almacenamiento local de respaldo."
                    )
                    // Cargar respaldo local si existe
                    try {
                        const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
                        if (saved) {
                            const parsed = JSON.parse(saved)
                            setTasks(parsed.map((t: Task) => ({ ...t, createdAt: new Date(t.createdAt) })))
                        }
                    } catch {
                        // ignore parse error
                    }
                    return false
                }
                return false
            })
        }, 4000)

        const unsubscribeSnapshot = subscribeTasks(
            currentUser.uid,
            (fetchedTasks) => {
                clearTimeout(timeoutId)
                setTasks(fetchedTasks)
                setLoadingTasks(false)
                setError("")
                // Guardar en respaldo local
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedTasks))
            },
            (err) => {
                clearTimeout(timeoutId)
                console.error("Error en Firestore:", err)
                const msg = getErrorMessage(err)
                setError(
                    `Error de Firestore (${msg}). Asegúrate de habilitar Cloud Firestore en Firebase Console.`
                )
                setLoadingTasks(false)

                // Cargar respaldo local
                try {
                    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
                    if (saved) {
                        const parsed = JSON.parse(saved)
                        setTasks(parsed.map((t: Task) => ({ ...t, createdAt: new Date(t.createdAt) })))
                    }
                } catch {
                    // ignore
                }
            }
        )

        return () => {
            clearTimeout(timeoutId)
            unsubscribeSnapshot()
        }
    }, [currentUser])

    async function handleAddTask(title: string, description: string) {
        if (!currentUser) return
        setError("")

        try {
            await addTask(currentUser.uid, title, description)
        } catch (err: unknown) {
            console.error("Error al añadir tarea a Firestore:", err)
            const msg = getErrorMessage(err)
            setError(`No se pudo crear la tarea en Firestore (${msg}).`)

            // Guardar localmente como fallback
            const fallbackTask: Task = {
                id: crypto.randomUUID(),
                title: title.trim(),
                description: description.trim(),
                completed: false,
                userId: currentUser.uid,
                createdAt: new Date(),
            }
            setTasks((prev) => {
                const next = [fallbackTask, ...prev]
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next))
                return next
            })
        }
    }

    async function handleDeleteTask(id: string) {
        setError("")
        try {
            await deleteTask(id)
        } catch (err: unknown) {
            console.error("Error al borrar tarea de Firestore:", err)
        }
        // Actualizar estado local siempre
        setTasks((prev) => {
            const next = prev.filter((t) => t.id !== id)
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    async function handleToggleComplete(id: string) {
        const targetTask = tasks.find((t) => t.id === id)
        if (!targetTask) return

        setError("")
        try {
            await toggleTaskComplete(id, targetTask.completed)
        } catch (err: unknown) {
            console.error("Error al actualizar tarea en Firestore:", err)
        }
        // Actualizar estado local siempre
        setTasks((prev) => {
            const next = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    async function handleLogout() {
        try {
            await signOut(auth)
            navigate("/login")
        } catch (err: unknown) {
            console.error("Error al cerrar sesión:", err)
        }
    }

    return (
        <div className="home">
            <div className="home-container">
                <div className="home-header">
                    <div className="home-header-info">
                        <h1 className="home-title">
                            ¡Hola, {userName}! 👋
                        </h1>
                        <p className="home-subtitle">
                            Organiza y gestiona tus actividades del día
                        </p>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </div>

                {error && <div className="home-error-box">{error}</div>}

                <TaskForm onAddTask={handleAddTask} />

                {loadingTasks ? (
                    <div className="tasks-loading">
                        <div className="tasks-spinner" />
                        <p>Cargando tus tareas desde Firestore...</p>
                    </div>
                ) : (
                    <TaskList
                        tasks={tasks}
                        onDelete={handleDeleteTask}
                        onToggleComplete={handleToggleComplete}
                    />
                )}
            </div>
        </div>
    )
}

export default Home