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

  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 100, q: 'is:unread' });
  const messages = res.data.messages || [];

  const emails = [];
  for (const message of messages) {
    if (message.id) {
      const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
      if (msg.data) {
        const headers = msg.data.payload?.headers || [];
        const fromHeader = headers.find((header: any) => header.name === 'From')?.value;
        const toHeader = headers.find((header: any) => header.name === 'To')?.value;
        const subjectHeader = headers.find((header: any) => header.name === 'Subject')?.value;
        const body = getBodyFromPayload(msg.data.payload);

        emails.push({
          id: msg.data.id,
          from: fromHeader,
          to: toHeader,
          subject: subjectHeader,
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

async function sendGmailReply(to: string, subject: string, body: string, inReplyTo: string): Promise<void> {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: Me <me@example.com>`,
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      `In-Reply-To: ${inReplyTo}`,
      `References: ${inReplyTo}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // console.log('Encoded Message:', encodedMessage);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    // console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function createLabelIfNotExists(labelName: string): Promise<string> {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const res = await gmail.users.labels.list({ userId: 'me' });
    const labels = res.data.labels || [];

    let label = labels.find((label) => label.name === labelName);

    if (!label) {
      const newLabel = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
      label = newLabel.data;
    }

    return label.id!;
  } catch (error) {
    console.error('Error creating or fetching label:', error);
    throw error;
  }
}

async function addLabelToEmail(emailId: string, labelName: string): Promise<void> {
  try {
    const labelId = await createLabelIfNotExists(labelName);
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    await gmail.users.messages.modify({
      userId: 'me',
      id: emailId,
      requestBody: {
        addLabelIds: [labelId],
      },
    });
    console.log('Label added successfully');
  } catch (error) {
    console.error('Error adding label to email:', error);
  }
}
export { getGmailAuthUrl, getGmailTokens, getGmailEmails , sendGmailReply, addLabelToEmail};