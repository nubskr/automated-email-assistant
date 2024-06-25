import { Email } from './types/email';
import { categorizeWorker, catergorizeQueue } from "./jobs/categorizeEmail";
import { responseWorker } from './jobs/generateResponse';
import { sendWorker } from './jobs/sendReply';

import express from 'express';
import { getGmailAuthUrl, getGmailTokens, getGmailEmails } from './auth/gmailAuth';
import { getOutlookAuthUrl, getOutlookTokens, getOutlookEmails } from './auth/outlookAuth';

import './jobs/categorizeEmail';
import './jobs/generateResponse';
import './jobs/sendReply';


categorizeWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed in categorizeWorker`);
});
  
responseWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed in responseWorker`);
});

sendWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed in sendWorker`);
});

// dummy as of now
// const emails: Email[] = [
//   { id: '1', from: 'example1@example.com', to: 'you@example.com', subject: 'Interested in your product', body: 'I am very interested in your product.', category: null, response: null },
//   { id: '2', from: 'example1@example.com', to: 'you@example.com', subject: 'Interested in your product', body: 'Dont send me mails like these!.', category: null, response: null },
//   { id: '3', from: 'example1@example.com', to: 'you@example.com', subject: 'Interested in your product', body: 'What exactly does thing thing do again? I need more information.', category: null, response: null },
// ];

// Add emails to categorize queue, start the chain reaction
// emails.forEach((email) => {
//     catergorizeQueue.add('categorize', email);
// });

const app = express();
const port = 3000;

app.use(express.json());

app.get('/auth/gmail', async (req, res) => {
  const url = await getGmailAuthUrl();
  res.redirect(url);
});

app.get('/auth/gmail/callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    const tokens = await getGmailTokens(code);
    
    const newEmails = await getGmailEmails();
      newEmails.forEach((email: any) => {
        const relevantEmails = {
          id: email.id,
          from: email.from,
          to: email.to,
          body: email.body,
          category: null,
          response: null
        }
        catergorizeQueue.add('categorize', relevantEmails);
      });
    // res.send('Gmail authentication successful and email polling has started.');


    res.redirect('/'); // Redirect to the homepage or another route
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Error retrieving access token');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});