import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Home from '../pages/Home'

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
    signOut: vi.fn().mockResolvedValue(undefined)
}))

describe('Home Page (Integración)', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('muestra el saludo personalizado al usuario autenticado', () => {
        render(<Home />)
        expect(screen.getByText(/¡Hola, Juan! 👋/i)).toBeInTheDocument()
    })

    it('permite crear una nueva tarea y la muestra en la lista', () => {
        render(<Home />)

        const titleInput = screen.getByPlaceholderText(/título de la tarea/i)
        const descInput = screen.getByPlaceholderText(/descripción/i)
        const submitBtn = screen.getByRole('button', { name: /añadir tarea/i })

        fireEvent.change(titleInput, { target: { value: 'Comprar insumos' } })
        fireEvent.change(descInput, { target: { value: 'Comprar café y fruta' } })
        fireEvent.click(submitBtn)

        expect(screen.getByText('Comprar insumos')).toBeInTheDocument()
        expect(screen.getByText('Comprar café y fruta')).toBeInTheDocument()
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('permite cambiar el estado de completada de una tarea', () => {
        render(<Home />)

        // Crear tarea
        fireEvent.change(screen.getByPlaceholderText(/título de la tarea/i), { target: { value: 'Estudiar para el examen' } })
        fireEvent.click(screen.getByRole('button', { name: /añadir tarea/i }))

        const toggleBtn = screen.getByRole('button', { name: /marcar como completada/i })
        fireEvent.click(toggleBtn)

        expect(screen.getByText('Completada')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /marcar como pendiente/i })).toBeInTheDocument()
    })

    it('permite eliminar una tarea de la lista', () => {
        render(<Home />)

        // Crear tarea
        fireEvent.change(screen.getByPlaceholderText(/título de la tarea/i), { target: { value: 'Tarea a borrar' } })
        fireEvent.click(screen.getByRole('button', { name: /añadir tarea/i }))

        expect(screen.getByText('Tarea a borrar')).toBeInTheDocument()

        const deleteBtn = screen.getByRole('button', { name: /eliminar/i })
        fireEvent.click(deleteBtn)

        expect(screen.queryByText('Tarea a borrar')).not.toBeInTheDocument()
    })

    it('persiste las tareas en localStorage', () => {
        const { unmount } = render(<Home />)

        fireEvent.change(screen.getByPlaceholderText(/título de la tarea/i), { target: { value: 'Tarea Persistente' } })
        fireEvent.click(screen.getByRole('button', { name: /añadir tarea/i }))

        // Verificar que localStorage tiene la tarea
        const savedInStorage = JSON.parse(localStorage.getItem('tasks') || '[]')
        expect(savedInStorage.length).toBe(1)
        expect(savedInStorage[0].title).toBe('Tarea Persistente')

        unmount()

        // Volver a renderizar para comprobar la recuperación de localStorage
        render(<Home />)
        expect(screen.getByText('Tarea Persistente')).toBeInTheDocument()
    })
})
