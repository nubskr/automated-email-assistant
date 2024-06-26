import { Job, Queue, Worker } from 'bullmq';
import { catergorizeQueue , categorizeWorker } from './categorizeEmail';
import { Email } from '../types/email';
import { responseApi } from '../controllers/apiProcess';
import { sendGmailReply } from '../auth/gmailAuth';
import { sendOutlookReply } from '../auth/outlookAuth';

const connectionOptions = {
    host: 'localhost',
    port: 6379
};

const sendQueue = new Queue<Email>('sendReply',{connection: connectionOptions});

async function sendWorker(job: Job<Email>){
    // returns a promise!
    const email = job.data;

    if(email.vendor === "gmail"){
        await sendGmailReply(email.from,'Re: ' + email.subject,email.response,email.id);
    }
    else{
        await sendOutlookReply(email.accessToken,email.from,email.subject,email.response,email.id);
    }
}

const worker = new Worker<Email>('sendReply', sendWorker, {connection: connectionOptions});

export {worker as sendWorker};