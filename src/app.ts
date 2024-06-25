import { Email } from './types/email';
import { categorizeWorker, catergorizeQueue } from "./jobs/categorizeEmail";
import { responseWorker } from './jobs/generateResponse';
import { sendWorker } from './jobs/sendReply';

import './jobs/categorizeEmail';
import './jobs/generateResponse';
import './jobs/sendReply';

categorizeWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed in categorizeWorker`);
//   console.log(`body: ${job.data.body} ; categogy: ${job.data.category}`)
});
  
responseWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed in responseWorker`);
});

sendWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed in sendWorker`);
});

// dummy as of now
const emails: Email[] = [
  { id: '1', from: 'example1@example.com', to: 'you@example.com', subject: 'Interested in your product', body: 'I am very interested in your product.', category: null, response: null },
  { id: '2', from: 'example1@example.com', to: 'you@example.com', subject: 'Interested in your product', body: 'Dont send me mails like these!.', category: null, response: null },
  { id: '3', from: 'example1@example.com', to: 'you@example.com', subject: 'Interested in your product', body: 'What exactly does thing thing do again? I need more information.', category: null, response: null },
];

// Add emails to categorize queue, start the chain reaction
emails.forEach((email) => {
    catergorizeQueue.add('categorize', email);
});

// console.log(catergorizeQueue);