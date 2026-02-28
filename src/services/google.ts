import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export const createOAuth2Client = (redirectUri?: string) => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri || process.env.GOOGLE_REDIRECT_URI
  );
};

export const getGoogleAuthUrl = (redirectUri: string) => {
  const oauth2Client = createOAuth2Client(redirectUri);
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
};

export const getTokensFromCode = async (code: string, redirectUri: string) => {
  const oauth2Client = createOAuth2Client(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const getCalendarClient = (tokens: any) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  return google.calendar({ version: 'v3', auth: oauth2Client });
};
