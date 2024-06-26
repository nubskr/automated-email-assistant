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
    messages: [{role: 'system', content: 'You are an professional email mangaer, You are given an email and you have to categorise it into one of three categories: Interested,Not Interested,More information ; only respond in one of these categories and nothing else! if you get something completely out of topic, just put that in not interested'},
        { role: 'user', content: `${message}` }],
    model: 'llama3-8b-8192',
  });

  return checkFormatting(chatCompletion.choices[0].message.content);
}

export async function responseApi(message: string) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [{role: 'system', content: 'You are a business owner and people message you regarding your product, You are given an email and you have to create an appropriate response, your response should only contain the reply body, you have to stay professional and make sure not to go off topic, If the email mentions they are interested to know more, your reply should ask them if they are willing to hop on to a demo call by suggesting a time.'},
        { role: 'user', content: `${message}` }],
    model: 'llama3-8b-8192',
  });

  return checkFormatting(chatCompletion.choices[0].message.content);
}


