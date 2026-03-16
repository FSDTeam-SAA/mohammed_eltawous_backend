import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_KEY, // Testing CLAUDE_KEY instead of ANTHROPIC_API_KEY
});

async function testModel(model) {
    console.log(`Testing model: ${model}...`);
    try {
        const response = await anthropic.messages.create({
            model: model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say hello' }],
        });
        console.log(`SUCCESS: ${model} works!`);
        return true;
    } catch (e) {
        console.log(`FAILED: ${model} - ${e.message}`);
        return false;
    }
}

async function run() {
    const models = [
        'claude-3-5-sonnet-20240620',
        'claude-3-5-sonnet-20241022',
        'claude-3-sonnet-20240229'
    ];

    for (const model of models) {
        if (await testModel(model)) break;
    }
}

run();
