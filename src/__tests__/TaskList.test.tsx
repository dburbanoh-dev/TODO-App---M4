import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskList from '../components/TaskList'
import type { Task } from '../types/task'

describe('TaskList Component', () => {
    const mockTasks: Task[] = [
        {
            id: '1',
            title: 'Tarea 1',
            description: 'Descripción 1',
            completed: false,
            userId: 'u1',
            createdAt: new Date('2026-08-19T10:00:00Z')
        },
        {
            id: '2',
            title: 'Tarea 2',
            description: 'Descripción 2',
            completed: true,
            userId: 'u1',
            createdAt: new Date('2026-08-19T11:00:00Z')
        }
    ]

    it('renderiza la lista de tareas correctamente', () => {
        render(
            <TaskList
                tasks={mockTasks}
                onDelete={vi.fn()}
                onToggleComplete={vi.fn()}
            />
        )

        expect(screen.getByRole('heading', { name: /mis tareas.../i })).toBeInTheDocument()
        expect(screen.getByText('Tarea 1')).toBeInTheDocument()
        expect(screen.getByText('Tarea 2')).toBeInTheDocument()
    })
})
