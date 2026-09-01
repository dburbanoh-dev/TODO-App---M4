import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Home from '../pages/Home'
import type { Task } from '../types/task'

// State en memoria para simular Firestore en los tests
let mockTasksStore: Task[] = []
let mockListeners: Array<(tasks: Task[]) => void> = []

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}))

// Mock firebase
vi.mock('../services/firebase.ts', () => ({
    auth: {
        currentUser: {
            uid: 'test-uid-123',
            displayName: 'Juan Pérez'
        }
    }
}))

vi.mock('firebase/auth', () => ({
    signOut: vi.fn().mockResolvedValue(undefined),
    onAuthStateChanged: vi.fn((_auth, callback) => {
        callback({ uid: 'test-uid-123', displayName: 'Juan Pérez' })
        return vi.fn()
    })
}))

// Mock de servicios de tareas de Firestore
vi.mock('../services/taskService.ts', () => ({
    subscribeTasks: vi.fn((_userId: string, callback: (tasks: Task[]) => void) => {
        mockListeners.push(callback)
        callback([...mockTasksStore])
        return vi.fn(() => {
            mockListeners = mockListeners.filter((l) => l !== callback)
        })
    }),
    addTask: vi.fn(async (userId: string, title: string, description: string) => {
        const newTask: Task = {
            id: 'task-' + Math.random().toString(36).substr(2, 9),
            userId,
            title,
            description,
            completed: false,
            createdAt: new Date(),
        }
        mockTasksStore.unshift(newTask)
        mockListeners.forEach((cb) => cb([...mockTasksStore]))
        return newTask.id
    }),
    toggleTaskComplete: vi.fn(async (taskId: string, currentCompleted: boolean) => {
        mockTasksStore = mockTasksStore.map((t) =>
            t.id === taskId ? { ...t, completed: !currentCompleted } : t
        )
        mockListeners.forEach((cb) => cb([...mockTasksStore]))
    }),
    deleteTask: vi.fn(async (taskId: string) => {
        mockTasksStore = mockTasksStore.filter((t) => t.id !== taskId)
        mockListeners.forEach((cb) => cb([...mockTasksStore]))
    }),
}))

describe('Home Page (Integración con Firestore)', () => {
    beforeEach(() => {
        mockTasksStore = []
        mockListeners = []
        vi.clearAllMocks()
    })

    it('muestra el saludo personalizado al usuario autenticado', () => {
        render(<Home />)
        expect(screen.getByText(/¡Hola, Juan! 👋/i)).toBeInTheDocument()
    })

    it('permite crear una nueva tarea y la sincroniza en Firestore', async () => {
        render(<Home />)

        const titleInput = screen.getByPlaceholderText(/título de la tarea/i)
        const descInput = screen.getByPlaceholderText(/descripción/i)
        const submitBtn = screen.getByRole('button', { name: /añadir tarea/i })

        fireEvent.change(titleInput, { target: { value: 'Comprar insumos' } })
        fireEvent.change(descInput, { target: { value: 'Comprar café y fruta' } })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText('Comprar insumos')).toBeInTheDocument()
            expect(screen.getByText('Comprar café y fruta')).toBeInTheDocument()
            expect(screen.getByText('Pendiente')).toBeInTheDocument()
        })
    })

    it('permite cambiar el estado de completada de una tarea en Firestore', async () => {
        render(<Home />)

        // Crear tarea
        fireEvent.change(screen.getByPlaceholderText(/título de la tarea/i), { target: { value: 'Estudiar para el examen' } })
        fireEvent.click(screen.getByRole('button', { name: /añadir tarea/i }))

        await waitFor(() => {
            expect(screen.getByText('Estudiar para el examen')).toBeInTheDocument()
        })

        const toggleBtn = screen.getByRole('button', { name: /marcar como completada/i })
        fireEvent.click(toggleBtn)

        await waitFor(() => {
            expect(screen.getByText('Completada')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /marcar como pendiente/i })).toBeInTheDocument()
        })
    })

    it('permite eliminar una tarea de Firestore', async () => {
        render(<Home />)

        // Crear tarea
        fireEvent.change(screen.getByPlaceholderText(/título de la tarea/i), { target: { value: 'Tarea a borrar' } })
        fireEvent.click(screen.getByRole('button', { name: /añadir tarea/i }))

        await waitFor(() => {
            expect(screen.getByText('Tarea a borrar')).toBeInTheDocument()
        })

        const deleteBtn = screen.getByRole('button', { name: /eliminar/i })
        fireEvent.click(deleteBtn)

        await waitFor(() => {
            expect(screen.queryByText('Tarea a borrar')).not.toBeInTheDocument()
        })
    })

    it('sincroniza dinámicamente la lista de tareas en tiempo real desde Firestore', async () => {
        const { unmount } = render(<Home />)

        fireEvent.change(screen.getByPlaceholderText(/título de la tarea/i), { target: { value: 'Tarea Persistente Firestore' } })
        fireEvent.click(screen.getByRole('button', { name: /añadir tarea/i }))

        await waitFor(() => {
            expect(screen.getByText('Tarea Persistente Firestore')).toBeInTheDocument()
        })

        expect(mockTasksStore.length).toBe(1)
        expect(mockTasksStore[0].title).toBe('Tarea Persistente Firestore')

        unmount()

        // Re-renderizar componente para verificar recuperación de la suscripción Firestore
        render(<Home />)

        await waitFor(() => {
            expect(screen.getByText('Tarea Persistente Firestore')).toBeInTheDocument()
        })
    })
})
