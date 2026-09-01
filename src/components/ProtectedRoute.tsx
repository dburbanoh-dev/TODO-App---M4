import { useEffect, useState, type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "../services/firebase"
import "./ProtectedRoute.css"

interface ProtectedRouteProps {
    children?: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="protected-loader-container">
                <div className="protected-spinner" />
                <p>Verificando sesión...</p>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children ? <>{children}</> : null
}

export default ProtectedRoute
