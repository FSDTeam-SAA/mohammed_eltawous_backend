import { Anthropic } from '@anthropic-ai/sdk';
import { systemPrompt } from './prompt.js';
import logger from '../../core/config/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 120000, // 2 minutes
  defaultHeaders: {
    "anthropic-version": "2023-06-01"
  }
});

const DEFAULT_MODEL = 'claude-sonnet-4-5';

/**
 * Robustly extracts JSON from a potentially messy string.
 * Finds the first '{' and the last '}' to isolate a JSON object.
 */
const extractJSON = (text) => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('No valid JSON object found in response.');
  }

  return text.substring(firstBrace, lastBrace + 1);
};

export const callClaudeJSON = async (messages, specificPrompt, temperature = 0.5, maxTokens = 4096) => {
  let rawText = '';
  try {
    const defaultMessages = messages && messages.length > 0 ? messages : [];
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt + "\n\n" + specificPrompt,
      messages: [
        ...defaultMessages,
        { role: 'user', content: "Please execute step according to prompts. Output ONLY valid JSON." }
      ],
    });

    rawText = response.content[0].text.trim();
    const jsonString = extractJSON(rawText);
    return JSON.parse(jsonString);

  } catch (error) {
    logger.error("Claude JSON Parse Error. Raw Text:", { rawText, error: error.message });

    // basic retry
    try {
      const responseRetry = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,
        messages: [
          ...messages,
          { role: 'user', content: specificPrompt + "\n\nCRITICAL: YOU FAILED TO RETURN VALID JSON. RETURN ONLY STRICT VALID JSON NOW WITHOUT FENCES OR PREAMBLE." }
        ],
      });

      rawText = responseRetry.content[0].text.trim();
      const jsonString = extractJSON(rawText);
      return JSON.parse(jsonString);

    } catch (retryError) {
      logger.error("Claude Retry Error. Raw Text:", { rawText, error: retryError.message });
      throw new Error("Failed to parse AI response into JSON after retry.");
    }
  }
};
