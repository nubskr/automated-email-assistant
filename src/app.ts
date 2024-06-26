import { Email } from './types/email';
import { categorizeWorker, catergorizeQueue } from "./jobs/categorizeEmail";
import { responseWorker } from './jobs/generateResponse';
import { sendWorker } from './jobs/sendReply';
import path from 'path'
import express from 'express';
import { getGmailAuthUrl, getGmailTokens, getGmailEmails } from './auth/gmailAuth';
import { getOutlookAuthUrl, getOutlookTokens, getOutlookEmails } from './auth/outlookAuth';

categorizeWorker.on('completed', (job) => {
  console.log(`Categorization complete for Job ${job.id}`);
});
  
responseWorker.on('completed', (job) => {
  console.log(`Response generated for Job ${job.id}`);
});

sendWorker.on('completed', (job) => {
  console.log(`Reply sent to ${job.data.from}`);
});

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', async (req,res) => {
  res.sendFile(path.join(__dirname,'frontpage.html'));
})

app.get('/auth/gmail', async (req, res) => {
  const url = await getGmailAuthUrl();
  res.redirect(url);
});


app.get('/auth/gmail/callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    const tokens = await getGmailTokens(code);
    setInterval(async () => {
      const newEmails = await getGmailEmails();
      if(newEmails.length > 0){
      console.log("new mails received");
      }
      newEmails.forEach((email: any) => {
        // console.log(email.from);
        const relevantEmails = {
          id: email.id,
          from: email.from,
          to: email.to,
          body: email.body,
          subject: email.subject,
          category: null,
          response: null,
          vendor: "gmail",
          accessToken: null
        }
        catergorizeQueue.add('categorize', relevantEmails);
      });
    }, 5000); // Check every 5 seconds

    // res.send('Gmail authentication successful and email polling has started.');
    console.log("listening for new emails on Gmail!");
    res.redirect('/'); // Redirect to the homepage or another route
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Error retrieving access token');
  }
});

app.get('/auth/outlook', async (req, res) => {
  const url = await getOutlookAuthUrl();
  res.redirect(url);
});

app.get('/auth/outlook/callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    // const tokens = await getOutlookTokens(code);
    // setInterval(async () => {
    //   try {
    //     const newAccessToken = await getOutlookTokens(code); // Refresh token if needed
    
    //     const newEmails = await getOutlookEmails(newAccessToken);
    
    //     if (newEmails.length > 0) {
    //       console.log("New mails received");
    
    //       newEmails.forEach((email: any) => {
    //         console.log(email.from);
    
    //         const relevantEmails = {
    //           id: email.id,
    //           from: email.from,
    //           to: email.to,
    //           body: email.body,
    //           subject: email.subject,
    //           category: null,
    //           response: null,
    //           vendor: "outlook",
    //           accessToken: newAccessToken, // Use the refreshed token
    //         };
    
    //         // Process or categorize emails as needed
    //         // catergorizeQueue.add('categorize', relevantEmails);
    //       });
    //     }
    //   } catch (error) {
    //     console.error('Error fetching or processing emails:', error);
    //   }
    // }, 6000);
    const newAccessToken = await getOutlookTokens(code); // Refresh token if needed
    
            const newEmails = await getOutlookEmails(newAccessToken);
            console.log(newEmails);
            newEmails.forEach((email: any) => {
              //         console.log(email.from);
              
                      const relevantEmails = {
                        id: email.id,
                        from: email.from,
                        to: email.to,
                        body: email.body,
                        subject: email.subject,
                        category: null,
                        response: null,
                        vendor: "outlook",
                        accessToken: newAccessToken, // Use the refreshed token
                      };
              
              //         // Process or categorize emails as needed
                      catergorizeQueue.add('categorize', relevantEmails);
                    });
    // res.send('Gmail authentication successful and email polling has started.');
    console.log("listening for new emails on Outlook!");
    res.redirect('/'); // Redirect to the homepage or another route
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Error retrieving access token');
  }
  // nah man, not today, thing thing is not good!
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});