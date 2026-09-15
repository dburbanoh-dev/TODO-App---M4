import TaskCard from "./TaskCard"
import type { Task } from "../types/task"
import "./TaskList.css"

interface TaskListProps {
    tasks: Task[]
    onDelete: (id: string) => void
    onToggleComplete: (id: string) => void
}

function TaskList({
    tasks,
    onDelete,
    onToggleComplete,
}: TaskListProps) {
    return (
        <div className="task-list-section">
            <h2 className="section-title">
                Mis tareas...
            </h2>

            {tasks.length === 0 ? (
                <div className="empty-tasks-state">
                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p className="empty-title">No hay tareas encontradas</p>
                    <p className="empty-subtitle">Intenta cambiar los filtros o el término de búsqueda.</p>
                </div>
            ) : (
                <div className="task-grid">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={onDelete}
                            onToggleComplete={onToggleComplete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default TaskList