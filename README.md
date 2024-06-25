# Plan

Since I like doing things from the first principles, here's my plan:

Note: I have exhausted all my openai credits, so I'll use llama 80b from groq api since its free

So my plan is to make a service that you only have to run once (The best weapon is the one that you only have to fire once ?)

when you auth with your acounts with oauth(its the only interaction you have to do), it crawls  the last 3 emails you received (why only last 3 ? : just to be good on the free llama api),it then categorises them and sends out appropriate responses, sounds good.

# Tasks(in order):

- Get oauth setup for Gmail
- Get oauth setup for Outlook
- Get mails out of Gmail
- Get mails out of Outlook

after this, we can centralize the process to process the emails, since they're just emails irrespective of whether they came from gmail or outlook, they can be processed by the same thing

let's call it:

eval_system, this good boy uses llama80B and takes the emails and divides them into each category: Interested, not Interested, more information

once we have everything divided into categories,we can again use llama80B to make responses from them

once we have the responses, I guess we have to do something different to send mails from both gmail and outlook accounts ?? idk we'll see

At this point I'm assuming that we have done the auth using oauth and have access to emails

so we make sure that we have auth done at this point and have access to the emails in some nice format like json.

Okay, so we need to schedule jobs using BullMQ:

Lets catergorise the jobs:

- Categorization of emails with llama api , we schedule them one by one!
- Getting the appropriate reply of emails with llama api
- Sending the reply of emails using ???? (we'll see)

This is how it goes:

when we get the emails, they all get formatted in a nice json and gets pushed to do the first category of job (Categorisation) , when some email gets categorized, it gets pushed into the second category and when we have the response to the email, we push it into the third category to be sent back, sounds good.

Lets implement it now

