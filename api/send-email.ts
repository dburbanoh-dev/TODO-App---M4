import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Configurar cabeceras CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Utiliza POST.' });
    }

    try {
        const { to, subject, body, html } = req.body || {};

        if (!to) {
            return res.status(400).json({ error: 'El parámetro "to" (correo de destino) es obligatorio.' });
        }

        const region = process.env.AWS_REGION || 'us-east-2';
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const senderEmail = process.env.AWS_SES_SENDER_EMAIL;

        if (!accessKeyId || !secretAccessKey) {
            return res.status(500).json({
                error: 'Faltan credenciales de AWS (AWS_ACCESS_KEY_ID o AWS_SECRET_ACCESS_KEY) en las variables de entorno.',
            });
        }

        if (!senderEmail) {
            return res.status(500).json({
                error: 'El remitente no está configurado (AWS_SES_SENDER_EMAIL). Configúralo en tus variables de entorno.',
            });
        }

        const sesClient = new SESClient({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        const command = new SendEmailCommand({
            Source: senderEmail,
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to],
            },
            Message: {
                Subject: {
                    Data: subject || 'Notificación de Tareas - TODO App',
                    Charset: 'UTF-8',
                },
                Body: {
                    Text: {
                        Data: body || 'Hola, este es un mensaje automático desde tu TODO App.',
                        Charset: 'UTF-8',
                    },
                    ...(html ? { Html: { Data: html, Charset: 'UTF-8' } } : {}),
                },
            },
        });

        const response = await sesClient.send(command);

        return res.status(200).json({
            success: true,
            message: 'Correo enviado exitosamente vía AWS SES.',
            messageId: response.MessageId,
        });
    } catch (error: any) {
        console.error('Error al enviar correo con AWS SES:', error);
        return res.status(500).json({
            error: 'Ocurrió un error al intentar enviar el correo.',
            details: error?.message || String(error),
        });
    }
}
