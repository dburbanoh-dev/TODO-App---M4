import type { Task } from "../types/task"
import TaskList from "../components/TaskList"
import TaskForm from "../components/TaskForm"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../services/firebase.ts"
import "./Home.css"

function Home() {
    const navigate = useNavigate()

    // 1. Cargar las tareas guardadas en localStorage al iniciar
    const [tasks, setTasks] = useState<Task[]>(() => {
        const savedTasks = localStorage.getItem("tasks")
        if (savedTasks) {
            try {
                const parsed = JSON.parse(savedTasks)
                // Convertir los strings de fecha de vuelta a objetos Date
                return parsed.map((task: any) => ({
                    ...task,
                    createdAt: new Date(task.createdAt)
                }))
            } catch (error) {
                console.error("Error al parsear tareas de localStorage:", error)
                return []
            }
        }
        return []
    })

    // 2. Guardar en localStorage cada vez que el estado 'tasks' cambie
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks))
    }, [tasks])

    function handleAddTask(title: string, description: string) {
        const currentUser = auth.currentUser

        const newTask: Task = {
            id: crypto.randomUUID(),
            title: title,
            description: description,
            completed: false,
            userId: currentUser ? currentUser.uid : "anonymous",
            createdAt: new Date(),
        }

        setTasks((previousTasks) => [
            ...previousTasks,
            newTask,
        ])
    }

    function handleDeleteTask(id: string) {
        setTasks((previousTasks) =>
            previousTasks.filter((task) => task.id !== id)
        )
    }

    function handleToggleComplete(id: string) {
        setTasks((previousTasks) =>
            previousTasks.map((task) =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        )
    }

    async function handleLogout() {
        try {
            await signOut(auth)
            navigate("/login")
        } catch (error) {
            console.error("Error al cerrar sesión:", error)
        }
    }

    return (
        <div className="home">
            <div className="home-container">

                <div className="home-header">
                    <h1 className="home-title">
                        Mis tareas
                    </h1>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </div>

                <TaskForm onAddTask={handleAddTask} />

                <TaskList
                    tasks={tasks}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                />

            </div>
        </div>
    )
}

export default Home