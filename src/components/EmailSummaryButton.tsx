import React, { useState } from "react"
import { createPortal } from "react-dom"
import type { Task } from "../types/task"
import "./EmailSummaryButton.css"

interface EmailSummaryButtonProps {
    tasks: Task[]
    userEmail?: string | null
    isLightMode?: boolean
}

export const EmailSummaryButton: React.FC<EmailSummaryButtonProps> = ({
    tasks,
    userEmail,
    isLightMode = false,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [recipientEmail, setRecipientEmail] = useState(userEmail || "")
    const [isSending, setIsSending] = useState(false)
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const pendingTasks = tasks.filter((t) => !t.completed)
    const completedTasks = tasks.filter((t) => t.completed)

    const handleOpenModal = () => {
        setRecipientEmail(userEmail || "")
        setStatusMessage(null)
        setIsOpen(true)
    }

    const handleCloseModal = () => {
        if (!isSending) {
            setIsOpen(false)
        }
    }

    const generateEmailContent = () => {
        const title = "📋 Resumen de tus Tareas - TODO App"

        let textBody = `Hola!\n\nEste es el resumen de tus tareas:\n`
        textBody += `- Total de tareas: ${tasks.length}\n`
        textBody += `- Pendientes: ${pendingTasks.length}\n`
        textBody += `- Completadas: ${completedTasks.length}\n\n`

        if (pendingTasks.length > 0) {
            textBody += `Tareas Pendientes:\n`
            pendingTasks.forEach((t, i) => {
                textBody += `${i + 1}. ${t.title}${t.description ? ` (${t.description})` : ""}\n`
            })
            textBody += `\n`
        }

        if (completedTasks.length > 0) {
            textBody += `Tareas Completadas:\n`
            completedTasks.forEach((t, i) => {
                textBody += `${i + 1}. ${t.title}\n`
            })
        }

        const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #3b82f6; margin-top: 0;">📋 Resumen de Tareas</h2>
            <p style="color: #555;">Aquí tienes el estado actual de tu lista de tareas:</p>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="background: #eff6ff; padding: 10px; border-radius: 6px; flex: 1; text-align: center;">
                    <strong style="color: #1d4ed8; font-size: 18px;">${tasks.length}</strong>
                    <div style="font-size: 12px; color: #3b82f6;">Total</div>
                </div>
                <div style="background: #fef3c7; padding: 10px; border-radius: 6px; flex: 1; text-align: center;">
                    <strong style="color: #b45309; font-size: 18px;">${pendingTasks.length}</strong>
                    <div style="font-size: 12px; color: #d97706;">Pendientes</div>
                </div>
                <div style="background: #ecfdf5; padding: 10px; border-radius: 6px; flex: 1; text-align: center;">
                    <strong style="color: #047857; font-size: 18px;">${completedTasks.length}</strong>
                    <div style="font-size: 12px; color: #10b981;">Completadas</div>
                </div>
            </div>

            ${pendingTasks.length > 0 ? `
                <h3 style="color: #d97706; margin-bottom: 8px;">⏳ Pendientes</h3>
                <ul style="padding-left: 20px; color: #333;">
                    ${pendingTasks.map(t => `<li><strong>${t.title}</strong>${t.description ? ` - <em>${t.description}</em>` : ''}</li>`).join('')}
                </ul>
            ` : ''}

            ${completedTasks.length > 0 ? `
                <h3 style="color: #10b981; margin-bottom: 8px;">✅ Completadas</h3>
                <ul style="padding-left: 20px; color: #666;">
                    ${completedTasks.map(t => `<li style="text-decoration: line-through;">${t.title}</li>`).join('')}
                </ul>
            ` : ''}

            <hr style="border: none; border-top: 1px solid #eee; margin-top: 25px;" />
            <p style="font-size: 12px; color: #999; text-align: center;">Enviado automáticamente desde TODO App AWS SES.</p>
        </div>
        `

        return { subject: title, body: textBody, html: htmlBody }
    }

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!recipientEmail || !recipientEmail.includes("@")) {
            setStatusMessage({ type: "error", text: "Por favor ingresa un correo electrónico válido." })
            return
        }

        setIsSending(true)
        setStatusMessage(null)

        const { subject, body, html } = generateEmailContent()

        try {
            const response = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: recipientEmail.trim(),
                    subject,
                    body,
                    html,
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setStatusMessage({
                    type: "success",
                    text: `¡Correo enviado con éxito! ID de mensaje: ${data.messageId}`,
                })
            } else {
                const detailedMsg = data.details
                    ? `${data.error ? data.error + " - " : ""}${data.details}`
                    : (data.error || "Ocurrió un error al enviar el correo.");
                setStatusMessage({
                    type: "error",
                    text: detailedMsg,
                })
            }
        } catch (err: any) {
            console.error("Error al conectar con la API de envío:", err)
            setStatusMessage({
                type: "error",
                text: "No se pudo conectar con el servidor de correos (/api/send-email).",
            })
        } finally {
            setIsSending(false)
        }
    }

    const modalContent = isOpen ? (
        <div className={`email-modal-overlay ${isLightMode ? "theme-light" : "theme-dark"}`} onClick={handleCloseModal}>
            <div className="email-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="email-modal-header">
                    <h3 className="email-modal-title">
                        ✉️ Enviar Resumen (AWS SES)
                    </h3>
                    <button className="email-modal-close" onClick={handleCloseModal} disabled={isSending}>
                        ✕
                    </button>
                </div>

                {statusMessage && (
                    <div className={`email-status-box ${statusMessage.type}`}>
                        {statusMessage.text}
                    </div>
                )}

                <form onSubmit={handleSendEmail}>
                    <div className="email-field">
                        <label className="email-label">Correo electrónico de destino:</label>
                        <input
                            type="email"
                            className="email-input"
                            placeholder="ejemplo@dominio.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            required
                            disabled={isSending}
                        />
                    </div>

                    <div className="email-summary-preview">
                        <p><strong>Resumen del correo a enviar:</strong></p>
                        <p>• Tareas totales: {tasks.length}</p>
                        <p>• Pendientes: {pendingTasks.length}</p>
                        <p>• Completadas: {completedTasks.length}</p>
                    </div>

                    <div className="email-modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleCloseModal}
                            disabled={isSending}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-send-submit" disabled={isSending}>
                            {isSending ? "Enviando..." : "Enviar Correo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null

    return (
        <div className="email-summary-container">
            <button className="email-btn" onClick={handleOpenModal} title="Enviar resumen por email con AWS SES">
                <svg className="email-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
                <span>Enviar Resumen por Email</span>
            </button>

            {modalContent && createPortal(modalContent, document.body)}
        </div>
    )
}

export default EmailSummaryButton
