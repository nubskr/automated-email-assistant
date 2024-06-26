import { Configuration, ConfidentialClientApplication, AuthorizationUrlRequest, AuthorizationCodeRequest } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env['OUTLOOK_CLIENT_ID'];
const CLIENT_SECRET = process.env['OUTLOOK_CLIENT_SECRET'];
const TENANT_ID = process.env['OUTLOOK_TENANT_ID'];
const REDIRECT_URI = 'http://localhost:3000/auth/outlook/callback';

const AUTHORITY = process.env['OUTLOOK_AUTHORITY'];

if (!CLIENT_ID || !CLIENT_SECRET || !TENANT_ID || !REDIRECT_URI || !AUTHORITY) {
  throw new Error('Missing required environment variables for Outlook API integration.');
}

const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID!,
    authority: AUTHORITY!,
    clientSecret: CLIENT_SECRET!,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

const SCOPES = ['https://graph.microsoft.com/Mail.Read', 'https://graph.microsoft.com/Mail.ReadWrite'];

let accessToken: string = '';

async function getOutlookAuthUrl(): Promise<string> {
  const authCodeUrlParameters: AuthorizationUrlRequest = {
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
  };

  const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
  return authUrl;
}

async function getOutlookTokens(code: string): Promise<string> {
  try {
    if (!code) {
      throw new Error('Authorization code is missing.');
    }

    const tokenRequest: AuthorizationCodeRequest = {
      code,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
    };

    const response = await cca.acquireTokenByCode(tokenRequest);

    if (response) {
      accessToken = response.accessToken;
    }

    return accessToken;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    throw error;
  }
}
async function getOutlookEmails(accessToken: string): Promise<any[]> {
  const client = Client.init({
    authProvider: async (done) => {
      try {
        if (!accessToken) {
          throw new Error('Access token not found.');
        }
        done(null, accessToken);
      } catch (error) {
        console.error('Error setting auth provider:', error);
        done(error, null);
      }
    },
  });

  try {
    const messages = await client.api('/me/mailFolders/inbox/messages')
      .top(10)
      .filter('isRead eq false')
      .select('id,from,toRecipients,body,subject')
      .get();

    const emails = messages.value.map((message: any) => ({
      id: message.id,
      from: message.from.emailAddress.address,
      to: message.toRecipients.map((to: any) => to.emailAddress.address).join(', '),
      subject: message.subject,
      body: message.body.content,
    }));

    for (const email of emails) {
      await client.api(`/me/messages/${email.id}`).update({ isRead: true });
    }

    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

async function sendOutlookReply(accessToken: string, to: string, subject: string, body: string, inReplyTo: string): Promise<void> {
  const client = Client.init({
    authProvider: async (done) => {
      try {
        if (!accessToken) {
          throw new Error('Access token not found.');
        }
        done(null, accessToken);
      } catch (error) {
        console.error('Error setting auth provider:', error);
        done(error, null);
      }
    },
  });

  const replyMessage = {
    message: {
      subject: `Re: ${subject}`,
      body: {
        contentType: 'Text',
        content: body,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
      conversationId: inReplyTo,
    },
    comment: 'Replying to your email',
  };

  try {
    await client.api(`/me/messages/${inReplyTo}/reply`).post(replyMessage);
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
}


export { getOutlookAuthUrl, getOutlookTokens, getOutlookEmails, sendOutlookReply };
