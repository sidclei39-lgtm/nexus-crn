import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getGoogleAuthUrl, getTokensFromCode, getCalendarClient } from './src/services/google';
import cookieSession from 'cookie-session';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
import path from 'path';

dotenv.config();

// Initialize database
const db = new Database('crm.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_data (
    email TEXT PRIMARY KEY,
    data TEXT
  )
`);

async function createServer() {
  const app = express();

  // Session middleware
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'crm-secret-key'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  }));

  // Body parser middleware
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const getRedirectUri = (req: express.Request) => {
    // Use APP_URL if available, otherwise fallback to request origin
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/api/google/callback`;
  };

  // API routes for data persistence
  app.get('/api/data/:email', (req, res) => {
    const { email } = req.params;
    try {
      const row = db.prepare('SELECT data FROM admin_data WHERE email = ?').get(email) as { data: string } | undefined;
      if (row) {
        res.json(JSON.parse(row.data));
      } else {
        res.status(404).json({ error: 'No data found' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/data/:email', (req, res) => {
    const { email } = req.params;
    const data = JSON.stringify(req.body);
    try {
      db.prepare('INSERT OR REPLACE INTO admin_data (email, data) VALUES (?, ?)').run(email, data);
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API routes
  app.get('/api/google/auth-url', (req, res) => {
    const redirectUri = getRedirectUri(req);
    res.json({ url: getGoogleAuthUrl(redirectUri) });
  });

  app.get('/api/google/status', (req, res) => {
    const isConnected = !!(req.session && req.session.tokens);
    res.json({ connected: isConnected });
  });

  app.get('/api/google/callback', async (req, res) => {
    const { code, error } = req.query;
    const redirectUri = getRedirectUri(req);
    
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
      const tokens = await getTokensFromCode(code as string, redirectUri);
      if (req.session) {
        req.session.tokens = tokens;
      }
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
      console.error('Error getting Google tokens:', err);
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
      if (!req.session || !req.session.tokens) {
        return res.status(401).json({ error: 'Google Calendar not connected. Please connect your account first.' });
      }

      const calendar = getCalendarClient(req.session.tokens);
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

  app.get('/api/google/events', async (req, res) => {
    try {
      if (!req.session || !req.session.tokens) {
        return res.status(401).json({ error: 'Not connected' });
      }

      const calendar = getCalendarClient(req.session.tokens);
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      res.json(response.data.items);
    } catch (error: any) {
      console.error('Error fetching Google Calendar events:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch events' });
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
