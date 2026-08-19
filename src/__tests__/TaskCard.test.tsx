import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskCard from '../components/TaskCard'
import type { Task } from '../types/task'

describe('TaskCard Component', () => {
    const mockTask: Task = {
        id: '1',
        title: 'Aprender Vitest',
        description: 'Escribir pruebas unitarias para la aplicación',
        completed: false,
        userId: 'user-123',
        createdAt: new Date('2026-08-19T10:00:00Z')
    }

    it('renderiza la información de la tarea correctamente', () => {
        const onDelete = vi.fn()
        const onToggleComplete = vi.fn()

        render(
            <TaskCard
                task={mockTask}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
            />
        )

        expect(screen.getByText('Aprender Vitest')).toBeInTheDocument()
        expect(screen.getByText('Escribir pruebas unitarias para la aplicación')).toBeInTheDocument()
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /marcar como completada/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    })

    it('muestra la insignia "Completada" cuando la tarea está terminada', () => {
        const completedTask: Task = { ...mockTask, completed: true }
        render(
            <TaskCard
                task={completedTask}
                onDelete={vi.fn()}
                onToggleComplete={vi.fn()}
            />
        )

        expect(screen.getByText('Completada')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /marcar como pendiente/i })).toBeInTheDocument()
    })

    it('llama a onToggleComplete al hacer clic en el botón de cambiar estado', () => {
        const onToggleComplete = vi.fn()
        render(
            <TaskCard
                task={mockTask}
                onDelete={vi.fn()}
                onToggleComplete={onToggleComplete}
            />
        )

        const toggleBtn = screen.getByRole('button', { name: /marcar como completada/i })
        fireEvent.click(toggleBtn)

        expect(onToggleComplete).toHaveBeenCalledTimes(1)
        expect(onToggleComplete).toHaveBeenCalledWith('1')
    })

    it('llama a onDelete al hacer clic en el botón de eliminar', () => {
        const onDelete = vi.fn()
        render(
            <TaskCard
                task={mockTask}
                onDelete={onDelete}
                onToggleComplete={vi.fn()}
            />
        )

        const deleteBtn = screen.getByRole('button', { name: /eliminar/i })
        fireEvent.click(deleteBtn)

        expect(onDelete).toHaveBeenCalledTimes(1)
        expect(onDelete).toHaveBeenCalledWith('1')
    })
})
