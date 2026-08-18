import { Link, useNavigate } from "react-router-dom"
import { useState, type FormEvent } from "react"
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../services/firebase"
import "./Register.css"

function Register() {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError("")

        // Validaciones personalizadas
        if (!name.trim()) {
            setError("Por favor, ingresa tu nombre completo.")
            return
        }

        if (!email.trim()) {
            setError("Por favor, ingresa un correo electrónico.")
            return
        }

        if (!password.trim()) {
            setError("Por favor, ingresa una contraseña.")
            return
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.")
            return
        }

        setLoading(true)

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)

            if (name.trim()) {
                await updateProfile(userCredential.user, { displayName: name })
            }

            navigate("/home")
        } catch (err: any) {
            console.error("Error al registrar usuario:", err)

            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("Este correo electrónico ya está registrado. Intenta iniciar sesión.")
                    break
                case "auth/invalid-email":
                    setError("El correo electrónico ingresado no es válido.")
                    break
                case "auth/weak-password":
                    setError("La contraseña es muy débil. Debe tener al menos 6 caracteres.")
                    break
                default:
                    setError("No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.")
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleRegister() {
        if (loading) return
        setError("")
        setLoading(true)

        try {
            await signInWithPopup(auth, googleProvider)
            navigate("/home")
        } catch (err: any) {
            if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
                return
            }

            console.error("Error al registrarse con Google:", err)
            if (err.code === 'auth/popup-blocked') {
                setError("Tu navegador bloqueó la ventana emergente. Por favor, permítela.")
            } else if (err.code === 'auth/unauthorized-domain') {
                setError("El dominio actual no está autorizado en Firebase Console.")
            } else {
                setError("No se pudo registrar con Google.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-card">
                <h1>Crear cuenta</h1>

                <p className="register-subtitle">
                    Regístrate para comenzar a gestionar tus tareas
                </p>

                {error && <div className="error-box">{error}</div>}

                <form className="register-form" onSubmit={handleSubmit} noValidate>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />

                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />

                    <button className="register-button" type="submit" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <div className="divider">
                    <span>o</span>
                </div>

                <button
                    type="button"
                    className="google-button"
                    onClick={handleGoogleRegister}
                    disabled={loading}
                >
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    {loading ? "Registrando..." : "Registrarse con Google"}
                </button>

                <p className="register-login">
                    ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default Register