import { Job, Queue, Worker } from 'bullmq';
import { catergorizeQueue , categorizeWorker } from './categorizeEmail';
import { Email } from '../types/email';
import { responseApi } from '../controllers/apiProcess';

const connectionOptions = {
    host: 'localhost',
    port: 6379
};

const sendQueue = new Queue<Email>('sendReply',{connection: connectionOptions});

async function sendWorker(job: Job<Email>){
    // returns a promise!
    const email = job.data;

    console.log(`Sending email to ${email.to}: ${email.response}`);
}

const worker = new Worker<Email>('sendReply', sendWorker, {connection: connectionOptions});

export {worker as sendWorker};