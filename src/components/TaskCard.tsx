import type { Task } from "../types/task"
import "./TaskCard.css"

interface TaskCardProps {
    task: Task
    onDelete: (id: string) => void
    onToggleComplete: (id: string) => void
}

function TaskCard({
    task,
    onDelete,
    onToggleComplete,
}: TaskCardProps) {
    // Convierte 'createdAt' a objeto Date si viene como string desde localStorage
    const dateObj = new Date(task.createdAt)

    const formattedDate = dateObj.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })

    return (
        <div className={`task-card ${task.completed ? "completed" : ""}`}>
            <div className="task-content">
                <div className="task-header-row">
                    <h3 className="task-title">{task.title}</h3>
                    <span className="task-date">{formattedDate}</span>
                </div>

                <p className="task-description">{task.description}</p>
            </div>

            <span className={`status-badge ${task.completed ? "status-completed" : "status-pending"}`}>
                {task.completed ? "Completada" : "Pendiente"}
            </span>

            <div className="task-actions">
                <button
                    className="btn-toggle"
                    onClick={() => onToggleComplete(task.id)}
                >
                    {task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                </button>

                <button
                    className="btn-delete"
                    onClick={() => onDelete(task.id)}
                >
                    Eliminar
                </button>
            </div>
        </div>
    )
}

export default TaskCard