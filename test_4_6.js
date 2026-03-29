import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function test(model) {
    console.log("Testing " + model);
    try {
        const response = await anthropic.messages.create({
            model: model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'hi' }],
        });
        console.log("SUCCESS: " + model);
        return true;
    } catch (e) {
        console.log("FAILED: " + model + " - " + e.message);
        return false;
    }
}

test('claude-sonnet-4-6');
