import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const CLIENT_ID = process.env['GMAIL_CLIENT_ID'];
const CLIENT_SECRET = process.env['GMAIL_CLIENT_SECRET'];
const REDIRECT_URI = 'http://localhost:3000/auth/gmail/callback';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

async function getGmailAuthUrl(): Promise<string> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
  });
  return authUrl;
}

async function getGmailTokens(code: string): Promise<any> {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  return tokens;
}

async function getGmailEmails(): Promise<any[]> {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10, q: 'is:unread' });
  const messages = res.data.messages || [];

  const emails = [];
  for (const message of messages) {
    if (message.id) {
      const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
      if (msg.data) {
        const fromHeader = msg.data.payload?.headers?.find((header: any) => header.name === 'From')?.value;
        const toHeader = msg.data.payload?.headers?.find((header: any) => header.name === 'To')?.value;
        const body = getBodyFromPayload(msg.data.payload);

        emails.push({
          id: msg.data.id,
          from: fromHeader,
          to: toHeader,
          body: body
        });

        // Mark email as read
        if (msg.data.id) {
          await gmail.users.messages.modify({
            userId: 'me',
            id: msg.data.id,
            requestBody: {
              removeLabelIds: ['UNREAD'],
            },
          });
        }
      }
    }
  }

  return emails;
}

function getBodyFromPayload(payload: any): string {
  let body = '';
  if (payload.parts) {
    payload.parts.forEach((part: any) => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    });
  } else if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  return body;
}
export { getGmailAuthUrl, getGmailTokens, getGmailEmails };