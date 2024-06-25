import { Job, Queue, Worker } from 'bullmq';
import { Email } from '../types/email';
import { responseApi , categorizeApi } from '../controllers/apiProcess';

const connectionOptions = {
    host: '0.0.0.0',
    port: 6379
};

const catergorizeQueue = new Queue<Email>('categorize',{connection: connectionOptions});
const responseQueue = new Queue<Email>('generateResponse',{connection: connectionOptions});

async function categorizeWorker(job: Job<Email>){
    try{
        const email = job.data;
    
        email.category = await categorizeApi(email.body);
    
        await responseQueue.add('generateResponse',email);
    }
    catch(err){
        console.error(err);
    }
    // returns a promise!!!!!!!

}

const worker = new Worker<Email>('categorize', categorizeWorker, {connection: connectionOptions});

export {catergorizeQueue , worker as categorizeWorker};