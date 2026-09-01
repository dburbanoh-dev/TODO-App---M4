import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { onAuthStateChanged } from 'firebase/auth'

vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn(),
}))

vi.mock('../services/firebase', () => ({
    auth: {},
}))

describe('ProtectedRoute Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra el estado de carga mientras se resuelve la autenticación', () => {
        vi.mocked(onAuthStateChanged).mockImplementation(() => {
            // No llama al callback inmediatamente
            return () => { }
        })

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Contenido Protegido</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText(/Verificando sesión.../i)).toBeInTheDocument()
        expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument()
    })

    it('redirige a /login cuando el usuario no está autenticado', async () => {
        vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
            // Simular usuario nulo
            (callback as (user: null) => void)(null)
            return () => { }
        })

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Contenido Protegido</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Página de Login</div>} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Página de Login')).toBeInTheDocument()
            expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument()
        })
    })

    it('muestra el contenido protegido cuando el usuario está autenticado', async () => {
        const mockUser = { uid: 'user-123', email: 'test@example.com' }

        vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
            (callback as (user: typeof mockUser) => void)(mockUser)
            return () => { }
        })

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Contenido Protegido</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Contenido Protegido')).toBeInTheDocument()
        })
    })
})
