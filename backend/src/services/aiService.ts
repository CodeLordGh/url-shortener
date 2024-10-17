import axios from 'axios';
import Url from '../models/Url';

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching website content:', error);
    return '';
  }
}

export async function generateAIDescription(url: string, scrapedContent: string): Promise<string> {
  console.log("generateAIDescription");
  try {
    if (!scrapedContent) {
      return 'Unable to generate description due to content retrieval issues.';
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates brief descriptions of websites.' },
          { role: 'user', content: `Generate a brief description of the following website content: ${scrapedContent.substring(0, 1000)}` }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedDescription = response.data.choices[0].message.content.trim();
    return generatedDescription || 'No description available';
  } catch (error) {
    console.error('Error generating AI description:', error);
    return 'Unable to generate description at this time.';
  }
}

export async function generateAITags(url: string, scrapedContent: string): Promise<string[]> {
  console.log("generateAITags");
  try {
    if (!scrapedContent) {
      return ['Unable to generate tags'];
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates relevant tags for websites.' },
          { role: 'user', content: `Generate 5 relevant tags for the following website content. Respond with only the tags, separated by commas: ${scrapedContent.substring(0, 1000)}` }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const tags = response.data.choices[0].message.content.split(',').map((tag: string) => tag.trim());
    return tags.length > 0 ? tags : ['No tags available'];
  } catch (error) {
    console.error('Error generating AI tags:', error);
    return ['Unable to generate tags'];
  }
}

export async function generateAdvice(url: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides advice on increasing clicks for shortened URLs.' },
          { role: 'user', content: `Provide 3 to 5 brief pieces of advice to increase clicks for this URL: ${url}` }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const advice = response.data.choices[0].message.content
      .split('\n')
      .filter((item: string) => item.trim() !== '')
      .map((item: string) => item.replace(/^\d+\.\s*/, '').trim());

    return advice.slice(0, 3); // Ensure we only return up to 3 pieces of advice
  } catch (error) {
    console.error('Error generating advice:', error);
    return 'Unable to generate advice at this time.';
  }
}

export async function handleAIChat(userId: string, message: string): Promise<{ response: string, structured?: any }> {
  console.log("Handling AI chat for user:", userId);
  try {
    // Fetch user's URLs
    const userUrls = await Url.find({ userId });

    // Check if the message is a command result
    const isCommandResult = message.startsWith('Command result:');
    let commandResult;
    if (isCommandResult) {
      commandResult = JSON.parse(message.replace('Command result:', '').trim());
    }

    // Prepare messages for AI request
    const aiMessages = [
      {
        role: 'system',
        content: `You are an AI assistant that helps users manage their shortened URLs. 
                  The user has ${userUrls} links. 
                  You can provide information about links and suggest actions.
                  Users can delete links with /delete [shortCode], add new links with /add [url], list their links with /list, start scraping with /startscrap [url], and stop scraping with /stopscrap.`
      },
      {
        role: 'user',
        content: isCommandResult
          ? `The user executed a command. Here's the result: ${JSON.stringify(commandResult)}`
          : message
      }
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: aiMessages
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content.trim();

    if (isCommandResult && commandResult.success && commandResult.data) {
      return {
        response: aiResponse,
        structured: commandResult.data
      };
    }

    return { response: aiResponse };
  } catch (error) {
    console.error('Error in AI chat:', error);
    return { response: 'Sorry, I encountered an error while processing your request.' };
  }
}
