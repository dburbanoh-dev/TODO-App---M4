import { useState } from "react"
import type { FormEvent } from "react"
import "./TaskForm.css"

interface TaskFormProps {
    onAddTask: (title: string, description: string) => void
}

function TaskForm({ onAddTask }: TaskFormProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onAddTask(title, description)

        setTitle("")
        setDescription("")
    }

    return (
        <div className="task-form">
            <form onSubmit={handleSubmit}>
                <div className="task-form-fields">
                    <input type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titulo"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripcion"
                    />
                </div>

                <button type="submit">Add Task</button>
            </form>
        </div>
    )
}

export default TaskForm