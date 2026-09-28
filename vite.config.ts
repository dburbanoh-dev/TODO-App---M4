import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

function localApiPlugin() {
    return {
        name: 'local-api-send-email',
        configureServer(server: any) {
            server.middlewares.use('/api/send-email', async (req: any, res: any) => {
                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }

                if (req.method !== 'POST') {
                    res.statusCode = 405;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Método no permitido. Utiliza POST.' }));
                    return;
                }

                const env = loadEnv(server.config.mode || 'development', process.cwd(), '');

                let bodyStr = '';
                req.on('data', (chunk: any) => {
                    bodyStr += chunk;
                });

                req.on('end', async () => {
                    try {
                        const body = bodyStr ? JSON.parse(bodyStr) : {};
                        const { to, subject, body: textBody, html } = body;

                        if (!to) {
                            res.statusCode = 400;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ error: 'El parámetro "to" (correo de destino) es obligatorio.' }));
                            return;
                        }

                        const region = env.AWS_REGION || process.env.AWS_REGION || 'us-east-2';
                        const accessKeyId = env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
                        const secretAccessKey = env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
                        const senderEmail = env.AWS_SES_SENDER_EMAIL || process.env.AWS_SES_SENDER_EMAIL;

                        if (!accessKeyId || !secretAccessKey) {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({
                                error: 'Faltan credenciales de AWS (AWS_ACCESS_KEY_ID o AWS_SECRET_ACCESS_KEY) en el archivo .env.'
                            }));
                            return;
                        }

                        if (!senderEmail) {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({
                                error: 'El remitente no está configurado (AWS_SES_SENDER_EMAIL) en el archivo .env.'
                            }));
                            return;
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
                                        Data: textBody || 'Hola, este es un mensaje automático desde tu TODO App.',
                                        Charset: 'UTF-8',
                                    },
                                    ...(html ? { Html: { Data: html, Charset: 'UTF-8' } } : {}),
                                },
                            },
                        });

                        const response = await sesClient.send(command);

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                            success: true,
                            message: 'Correo enviado exitosamente vía AWS SES en desarrollo local.',
                            messageId: response.MessageId,
                        }));
                    } catch (error: any) {
                        console.error('Error al enviar correo con AWS SES en local:', error);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                            error: 'Ocurrió un error al enviar el correo con AWS SES.',
                            details: error?.message || error?.name || (typeof error === 'object' ? JSON.stringify(error) : String(error)),
                        }));
                    }
                });
            });
        },
    };
}

export default defineConfig({
    plugins: [react(), localApiPlugin()],
    test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        globals: true
    }
})