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
                Mis tareas
            </h2>

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
        </div>
    )
}

export default TaskList