import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskForm from '../components/TaskForm'

describe('TaskForm Component', () => {
    it('renderiza el formulario con sus campos y botón', () => {
        render(<TaskForm onAddTask={vi.fn()} />)

        expect(screen.getByRole('heading', { name: /crear nueva tarea/i })).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/título de la tarea/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/descripción/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /añadir tarea/i })).toBeInTheDocument()
    })

    it('mantiene el botón deshabilitado si el título está vacío o solo contiene espacios', () => {
        render(<TaskForm onAddTask={vi.fn()} />)
        const submitBtn = screen.getByRole('button', { name: /añadir tarea/i })
        const titleInput = screen.getByPlaceholderText(/título de la tarea/i)

        expect(submitBtn).toBeDisabled()

        fireEvent.change(titleInput, { target: { value: '   ' } })
        expect(submitBtn).toBeDisabled()
    })

    it('habilita el botón de envío cuando el título tiene contenido', () => {
        render(<TaskForm onAddTask={vi.fn()} />)
        const submitBtn = screen.getByRole('button', { name: /añadir tarea/i })
        const titleInput = screen.getByPlaceholderText(/título de la tarea/i)

        fireEvent.change(titleInput, { target: { value: 'Comprar leche' } })
        expect(submitBtn).not.toBeDisabled()
    })

    it('llama a onAddTask con los valores ingresados y limpia el formulario tras enviar', () => {
        const onAddTask = vi.fn()
        render(<TaskForm onAddTask={onAddTask} />)

        const titleInput = screen.getByPlaceholderText(/título de la tarea/i)
        const descInput = screen.getByPlaceholderText(/descripción/i)
        const submitBtn = screen.getByRole('button', { name: /añadir tarea/i })

        fireEvent.change(titleInput, { target: { value: '  Nueva Tarea  ' } })
        fireEvent.change(descInput, { target: { value: '  Descripción detallada  ' } })

        fireEvent.click(submitBtn)

        expect(onAddTask).toHaveBeenCalledTimes(1)
        expect(onAddTask).toHaveBeenCalledWith('Nueva Tarea', 'Descripción detallada')

        expect(titleInput).toHaveValue('')
        expect(descInput).toHaveValue('')
    })
})
