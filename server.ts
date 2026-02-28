import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getGoogleAuthUrl, getGoogleCalendar } from './src/services/google';
import { google } from 'googleapis';
import oauth2Client from './src/services/google';
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

  app.get('/api/google/status', (req, res) => {
    const isConnected = !!(oauth2Client.credentials && oauth2Client.credentials.access_token);
    res.json({ connected: isConnected });
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
      if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
        return res.status(401).json({ error: 'Google Calendar not connected. Please connect your account first.' });
      }

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
    } catch (error: any) {
      console.error('Error creating Google Calendar event:', error);
      res.status(500).json({ error: error.message || 'Failed to create event' });
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
