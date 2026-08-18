import { useState, type FormEvent } from "react"
import "./TaskForm.css"

interface TaskFormProps {
    onAddTask: (title: string, description: string) => void
}

function TaskForm({ onAddTask }: TaskFormProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!title.trim()) return

        onAddTask(title.trim(), description.trim())
        setTitle("")
        setDescription("")
    }

    return (
        <form className="task-form-card" onSubmit={handleSubmit}>
            <h2 className="form-title">Crear nueva tarea</h2>

            <div className="form-group">
                <input
                    type="text"
                    className="form-input"
                    placeholder="Título de la tarea..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <textarea
                    className="form-textarea"
                    placeholder="Descripción (opcional)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                />
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn-submit"
                    disabled={!title.trim()}
                >
                    Añadir tarea
                </button>
            </div>
        </form>
    )
}

export default TaskForm