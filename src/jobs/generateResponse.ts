import { Job, Queue, Worker } from 'bullmq';
import { catergorizeQueue , categorizeWorker } from './categorizeEmail';
import { Email } from '../types/email';
import { responseApi } from '../controllers/apiProcess';

const connectionOptions = {
    host: '0.0.0.0',
    port: 6379
};

const responseQueue = new Queue<Email>('generateResponse',{connection: connectionOptions});
const sendQueue = new Queue<Email>('sendReply',{connection: connectionOptions});

async function responseWorker(job: Job<Email>){
    // returns a promise!
    const email = job.data;

    email.response = await responseApi(email.body);
    // console.log(proce)

    await sendQueue.add('sendReply', email);
}

const worker = new Worker<Email>('generateResponse', responseWorker, {connection: connectionOptions});

export {sendQueue , worker as responseWorker};