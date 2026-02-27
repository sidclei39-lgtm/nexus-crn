import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getGoogleAuthUrl, getGoogleCalendar } from './src/services/google';
import { google } from 'googleapis';
import oauth2Client from './src/services/google';
import { GoogleGenAI } from '@google/genai';
import bodyParser from 'body-parser';

dotenv.config();

async function createServer() {
  const app = express();

  // Body parser middleware should be first
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // API routes must be registered BEFORE the Vite middleware
  app.get('/api/google/auth-url', (req, res) => {
    res.json({ url: getGoogleAuthUrl() });
  });

  app.get('/api/google/callback', async (req, res) => {
    const { code, error } = req.query;
    
    if (error) {
      return res.status(400).send(`
        <html><body>
        <h3>Erro na Autenticação</h3>
        <p>O Google retornou o seguinte erro: <b>${error}</b></p>
        <p>Por favor, feche esta janela e tente novamente.</p>
        </body></html>
      `);
    }

    try {
      const calendar = await getGoogleCalendar(code as string);
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Autenticação realizada com sucesso! Esta janela deve se fechar automaticamente.</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('Error getting Google Calendar:', err);
      res.status(500).send(`
        <html><body>
        <h3>Erro ao processar o código do Google</h3>
        <p>Detalhes do erro: <b>${err.message || err}</b></p>
        <p>Verifique se as credenciais no AI Studio estão corretas.</p>
        </body></html>
      `);
    }
  });

  app.post('/api/google/create-event', async (req, res) => {
    const { summary, description, start, end } = req.body;
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary,
          description,
          start: { dateTime: start, timeZone: 'America/Sao_Paulo' },
          end: { dateTime: end, timeZone: 'America/Sao_Paulo' },
        },
      });
      res.json(event.data);
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      res.status(500).send('Failed to create event');
    }
  });

  app.post('/api/gemini/extract-event', async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set on the server.');
      return res.status(500).json({ error: 'Server configuration error: Missing Gemini API Key.' });
    }

    const { audio } = req.body;
    if (!audio) {
      return res.status(400).send('No audio data provided.');
    }

    try {
      const ai = new GoogleGenAI();
      const prompt = `A partir do áudio, extraia as seguintes informações para um evento de calendário: nome do paciente, data, hora e tipo de evento. Formate a resposta como JSON com as chaves: "patientName", "date", "time", "eventType". Exemplo de áudio: "Marcar retorno do paciente João para o dia 10 de março às 14 horas". Exemplo de saída: {"patientName": "João", "date": "2024-03-10", "time": "14:00", "eventType": "Retorno"}.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'audio/webm', data: audio } }
          ]
        }
      });
      
      const text = response.text || '';
      
      const jsonResponse = text.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        const parsedJson = JSON.parse(jsonResponse);
        res.json(parsedJson);
      } catch (e) {
        console.error('Failed to parse JSON from Gemini response:', jsonResponse);
        res.status(500).json({ error: 'Failed to parse AI response.' });
      }
    } catch (error) {
      console.error('Error with Gemini API on server:', error);
      res.status(500).json({ error: 'Failed to process audio with Gemini' });
    }
  });

  app.post('/api/gemini/chat-crm', async (req, res) => {
    const { message, customers, deals } = req.body;
    
    if (!message) {
      return res.status(400).send('No message provided.');
    }

    try {
      const ai = new GoogleGenAI();
      const prompt = `Você é um assistente avançado de CRM e gestão de vendas. Sua função é gerenciar um "Dashboard de Contatos" e um "Funil de Vendas" em tempo real.
      
      Mensagem do usuário: "${message}"
      
      Clientes Atuais: ${JSON.stringify(customers.map((c: any) => ({ id: c.id, name: c.name })))}
      Negócios Atuais: ${JSON.stringify(deals.map((d: any) => ({ id: d.id, customerId: d.customerId, stage: d.stage })))}
      
      1. Etapas do Funil de Vendas:
      - lead (Prospecção)
      - contact (Contato)
      - proposal (Proposta)
      - negotiation (Negociação)
      - closed (Fechado)
      
      2. Regras de Contabilização (Dashboard):
      Apenas marque isCommunicationAction como true para ações ativas de comunicação (ex: novos leads abordados, follow-ups realizados).
      
      Responda em JSON com a sua resposta em texto e uma lista de ações a serem tomadas no sistema.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT' as any,
            properties: {
              reply: { type: 'STRING' as any, description: 'Sua resposta amigável para o usuário' },
              actions: {
                type: 'ARRAY' as any,
                items: {
                  type: 'OBJECT' as any,
                  properties: {
                    type: { type: 'STRING' as any, description: '"add_lead", "update_stage", "log_interaction"' },
                    customerName: { type: 'STRING' as any },
                    stage: { type: 'STRING' as any, description: '"lead", "contact", "proposal", "negotiation", "closed"' },
                    notes: { type: 'STRING' as any },
                    isCommunicationAction: { type: 'BOOLEAN' as any }
                  },
                  required: ['type', 'customerName']
                }
              }
            },
            required: ['reply', 'actions']
          }
        }
      });
      
      const text = response.text || '{}';
      const parsedJson = JSON.parse(text);
      res.json(parsedJson);
    } catch (error) {
      console.error('Error with Gemini API chat:', error);
      res.status(500).json({ error: 'Failed to process chat with Gemini' });
    }
  });

  // Vite middleware should be last, after all API routes
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
  });
}

createServer();
