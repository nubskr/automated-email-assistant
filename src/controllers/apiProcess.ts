import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env['GROQ_API_KEY'],
});

function checkFormatting(data: any): string{
  if(data===null || data===undefined){
    return "Error fetching data";
  }
  else{
    return data.toString();
  }
}

export async function categorizeApi(message: string) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [{role: 'system', content: 'You are given an email and you have to categorise it into one of three categories: Interested,Not Interested,More information ; only respond in one of these categories and nothing else!'},
        { role: 'user', content: `${message}` }],
    model: 'llama3-8b-8192',
  });

  return checkFormatting(chatCompletion.choices[0].message.content);
}

export async function responseApi(message: string) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [{role: 'system', content: 'You are given an email and you have to create an appropriate response, your response should only contain the reply body'},
        { role: 'user', content: `${message}` }],
    model: 'llama3-8b-8192',
  });

  return checkFormatting(chatCompletion.choices[0].message.content);
}


