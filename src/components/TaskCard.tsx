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
    const dateObj = new Date(task.createdAt)

    // Formateamos para incluir fecha y hora en formato 12 horas (a. m. / p. m.)
    const formattedDateTime = dateObj.toLocaleString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })

    return (
        <div className={`task-card ${task.completed ? "completed" : ""}`}>
            <div className="task-content">
                <div className="task-header-row">
                    <h3 className="task-title">{task.title}</h3>
                    <span className="task-date">{formattedDateTime}</span>
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