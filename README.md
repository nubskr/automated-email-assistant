# Plan

Since I like doing things from first principles, here's my plan:

*Note: I have exhausted all my OpenAI credits, so I'll use Llama 80B from the Groq API since it's free.*

My plan is to make a service that you only have to run once (The best weapon is the one that you only have to fire once, right?)

When you authenticate with your accounts using OAuth (it's the only interaction you have to do), it crawls the last 3 emails you received (why only the last 3? Just to be considerate with the free Llama API). It then categorizes them and sends out appropriate responses. Sounds good?

## Tasks (in order):

1. Get OAuth setup for Gmail
2. Get OAuth setup for Outlook
3. Get emails out of Gmail
4. Get emails out of Outlook

After this, we can centralize the process to handle the emails. Since they're just emails, irrespective of whether they came from Gmail or Outlook, they can be processed by the same system.

Let's call it:

**eval_system**, this good boy uses Llama 80B to take the emails and divide them into categories: Interested, Not Interested, More Information.

Once we have everything divided into categories, we can again use Llama 80B to generate responses.

Once we have the responses, we'll have to figure out how to send emails from both Gmail and Outlook accounts. We'll see about that later.

At this point, I'm assuming we have done the OAuth authentication and have access to the emails.

So, we ensure that we have authentication done and have access to the emails in a nice format like JSON.

## Job Scheduling with BullMQ:

Let's categorize the jobs:

1. Categorization of emails with the Llama API, scheduled one by one.
2. Generating the appropriate replies to emails with the Llama API.
3. Sending the replies to emails using their respective apis.

### Workflow:

When we get the emails, they all get formatted into a nice JSON and get pushed to do the first category of jobs (Categorization). When an email gets categorized, it gets pushed into the second category. Once we have the response to the email, we push it into the third category to be sent back. Sounds good?

Let's implement it now.

## Running instructions:

First, make sure you have your environment variables set up. Create a `.env` file in the root of your project and fill it with your credentials:

```bash
GROQ_API_KEY='your_groq_api_key_here'
GMAIL_CLIENT_ID='your_gmail_client_id_here'
GMAIL_CLIENT_SECRET='your_gmail_client_secret_here'
OUTLOOK_CLIENT_ID='your_outlook_client_id_here'
OUTLOOK_CLIENT_SECRET='your_outlook_client_secret_here'
OUTLOOK_TENANT_ID='your_outlook_tenant_id_here'
OUTLOOK_AUTHORITY='your_outlook_authority_here'
```

Not just install the dependencies using:

```bash
npm install
```

And start with:

```bash
npm run
```