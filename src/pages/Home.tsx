import type { Task } from "../types/task"
import TaskList from "../components/TaskList"
import TaskForm from "../components/TaskForm"
import EmailSummaryButton from "../components/EmailSummaryButton"
import { useState, useEffect, useMemo } from "react"
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

type FilterStatus = "all" | "pending" | "completed"
type SortByOption = "newest" | "oldest" | "alpha"
type AccentColor = "blue" | "emerald" | "purple" | "amber" | "crimson"

function Home() {
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loadingTasks, setLoadingTasks] = useState(true)
    const [error, setError] = useState<string>("")

    // Estados de búsqueda, filtrado y vista
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortByOption>("newest")
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [isLightMode, setIsLightMode] = useState(false)
    const [accentColor, setAccentColor] = useState<AccentColor>("blue")

    // Escuchar el estado de autenticación dinámicamente
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
        })
        return () => unsubscribeAuth()
    }, [])

    const fullUserName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Usuario"
    const userName = currentUser?.displayName
        ? currentUser.displayName.split(" ")[0]
        : "Bienvenido"

    // Sincronización en tiempo real con Firestore con fallback a localStorage
    useEffect(() => {
        if (!currentUser) {
            return
        }

        const timeoutId = setTimeout(() => {
            setLoadingTasks((prevLoading) => {
                if (prevLoading) {
                    setError(
                        "No se pudo conectar con Firestore. Se utilizará almacenamiento local de respaldo."
                    )
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
            setShowTaskForm(false)
        } catch (err: unknown) {
            console.error("Error al añadir tarea a Firestore:", err)
            const msg = getErrorMessage(err)
            setError(`No se pudo crear la tarea en Firestore (${msg}).`)

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
            setShowTaskForm(false)
        }
    }

    async function handleDeleteTask(id: string) {
        setError("")
        try {
            await deleteTask(id)
        } catch (err: unknown) {
            console.error("Error al borrar tarea de Firestore:", err)
        }
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

    // Filtrar y ordenar tareas dinámicamente
    const filteredTasks = useMemo(() => {
        return tasks
            .filter((t) => {
                if (filterStatus === "pending") return !t.completed
                if (filterStatus === "completed") return t.completed
                return true
            })
            .filter((t) => {
                if (!searchQuery.trim()) return true
                const query = searchQuery.toLowerCase()
                return (
                    t.title.toLowerCase().includes(query) ||
                    t.description.toLowerCase().includes(query)
                )
            })
            .sort((a, b) => {
                if (sortBy === "oldest") {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                }
                if (sortBy === "alpha") {
                    return a.title.localeCompare(b.title)
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })
    }, [tasks, filterStatus, searchQuery, sortBy])

    const totalCount = tasks.length
    const pendingCount = tasks.filter((t) => !t.completed).length
    const completedCount = tasks.filter((t) => t.completed).length

    return (
        <div className={`home ${isLightMode ? "theme-light" : "theme-dark"}`} data-accent={accentColor}>
            <div className="home-container">
                {/* Header superior con Demo, Usuario y Salir */}
                <header className="mate-header">
                    <div className="header-actions">
                        <EmailSummaryButton tasks={tasks} userEmail={currentUser?.email} isLightMode={isLightMode} />

                        <button
                            className={`demo-badge ${isLightMode ? "mode-light" : "mode-dark"}`}
                            onClick={() => setIsLightMode((prev) => !prev)}
                            title="Haz clic para alternar entre Modo Oscuro y Modo Claro"
                        >
                            <span className="badge-icon">{isLightMode ? "☀️" : "🌙"}</span>
                            <span>{isLightMode ? "Modo Claro" : "Modo Oscuro"}</span>
                        </button>

                        <div className="user-profile-badge">
                            <svg className="user-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="user-name-text">{fullUserName}</span>
                        </div>

                        <button className="logout-button logout-btn-header" onClick={handleLogout} title="Cerrar sesión">
                            <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Salir</span>
                        </button>
                    </div>
                </header>

                {/* Banner de saludo del usuario */}
                <div className="welcome-banner">
                    <div>
                        <h1 className="home-title">¡Hola, {userName}! 👋</h1>
                        <p className="home-subtitle">Organiza y gestiona tus actividades del día</p>
                    </div>

                    <button
                        className="create-task-trigger-btn"
                        onClick={() => setShowTaskForm((prev) => !prev)}
                    >
                        <svg className="create-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{showTaskForm ? "Cerrar Formulario" : "Crear Tarea"}</span>
                    </button>
                </div>

                {error && <div className="home-error-box">{error}</div>}

                {/* Formulario desplegable / condicional */}
                {showTaskForm && (
                    <div className="task-form-wrapper">
                        <TaskForm onAddTask={handleAddTask} />
                    </div>
                )}

                {/* Barra de Filtros, Buscador y Filtros Avanzados */}
                <div className="filter-bar-card">
                    <div className="filter-tabs">
                        <button
                            className={`tab-btn ${filterStatus === "all" ? "active" : ""}`}
                            onClick={() => setFilterStatus("all")}
                        >
                            Todas
                        </button>
                        <button
                            className={`tab-btn ${filterStatus === "pending" ? "active" : ""}`}
                            onClick={() => setFilterStatus("pending")}
                        >
                            Pendientes
                        </button>
                        <button
                            className={`tab-btn ${filterStatus === "completed" ? "active" : ""}`}
                            onClick={() => setFilterStatus("completed")}
                        >
                            Completadas
                        </button>
                    </div>

                    <div className="search-input-wrapper">
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar tareas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery("")} title="Limpiar búsqueda">
                                ✕
                            </button>
                        )}
                    </div>

                    <button
                        className={`advanced-filter-btn ${showAdvancedFilters ? "active" : ""}`}
                        onClick={() => setShowAdvancedFilters((prev) => !prev)}
                    >
                        <svg className="funnel-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span>Filtros Avanzados</span>
                    </button>
                </div>

                {/* Panel de Filtros Avanzados expandible */}
                {showAdvancedFilters && (
                    <div className="advanced-filter-panel">
                        <div className="panel-group">
                            <label className="panel-label">Ordenar por:</label>
                            <select
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortByOption)}
                            >
                                <option value="newest">Más recientes primero</option>
                                <option value="oldest">Más antiguas primero</option>
                                <option value="alpha">Alfabéticamente (A-Z)</option>
                            </select>
                        </div>

                        <div className="panel-group accent-selector-group">
                            <label className="panel-label">Color del Cliente:</label>
                            <div className="color-swatches">
                                <button
                                    className={`swatch swatch-blue ${accentColor === "blue" ? "active" : ""}`}
                                    onClick={() => setAccentColor("blue")}
                                    title="Azul Eléctrico"
                                />
                                <button
                                    className={`swatch swatch-emerald ${accentColor === "emerald" ? "active" : ""}`}
                                    onClick={() => setAccentColor("emerald")}
                                    title="Verde Esmeralda"
                                />
                                <button
                                    className={`swatch swatch-purple ${accentColor === "purple" ? "active" : ""}`}
                                    onClick={() => setAccentColor("purple")}
                                    title="Púrpura Neón"
                                />
                                <button
                                    className={`swatch swatch-amber ${accentColor === "amber" ? "active" : ""}`}
                                    onClick={() => setAccentColor("amber")}
                                    title="Ámbar Dorado"
                                />
                                <button
                                    className={`swatch swatch-crimson ${accentColor === "crimson" ? "active" : ""}`}
                                    onClick={() => setAccentColor("crimson")}
                                    title="Rojo Carmesí"
                                />
                            </div>
                        </div>

                        <div className="panel-stats">
                            <span className="stat-pill">Total: {totalCount}</span>
                            <span className="stat-pill pending">Pendientes: {pendingCount}</span>
                            <span className="stat-pill completed">Completadas: {completedCount}</span>
                        </div>

                        {(searchQuery || filterStatus !== "all" || sortBy !== "newest") && (
                            <button
                                className="reset-filters-btn"
                                onClick={() => {
                                    setSearchQuery("")
                                    setFilterStatus("all")
                                    setSortBy("newest")
                                }}
                            >
                                Restablecer filtros
                            </button>
                        )}
                    </div>
                )}

                {/* Formulario integrado por defecto si no hay tareas todavía */}
                {!showTaskForm && tasks.length === 0 && !loadingTasks && (
                    <div className="empty-create-section">
                        <TaskForm onAddTask={handleAddTask} />
                    </div>
                )}

                {/* Lista de tareas */}
                {loadingTasks ? (
                    <div className="tasks-loading">
                        <div className="tasks-spinner" />
                        <p>Cargando tus tareas desde Firestore...</p>
                    </div>
                ) : (
                    <TaskList
                        tasks={filteredTasks}
                        onDelete={handleDeleteTask}
                        onToggleComplete={handleToggleComplete}
                    />
                )}
            </div>
        </div>
    )
}

export default Home