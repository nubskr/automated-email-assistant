import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider, ClientSecretCredential } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

const CLIENT_ID = 'your-outlook-client-id';
const CLIENT_SECRET = 'your-outlook-client-secret';
const TENANT_ID = 'your-tenant-id';
const REDIRECT_URI = 'your-redirect-uri';

const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['Mail.Read', 'Mail.Send'],
});

const client = Client.initWithMiddleware({ authProvider });

async function getOutlookAuthUrl(): Promise<string> {
  // Implement the logic to generate the auth URL
  // Usually, it's a URL with the necessary parameters for user consent
  return `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=offline_access%20user.read%20mail.read%20mail.send`;
}

async function getOutlookTokens(code: string): Promise<any> {
  const response = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'offline_access user.read mail.read mail.send',
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      client_secret: CLIENT_SECRET,
    }),
  });

  const tokens = await response.json();
  credential.token = tokens;
  return tokens;
}

async function getOutlookEmails(): Promise<any> {
  const messages = await client.api('/me/messages').get();
  return messages.value;
}

export { getOutlookAuthUrl, getOutlookTokens, getOutlookEmails };
