import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
        'claude-4-6-sonnet-20260217',
        'claude-4-6-opus-20260205',
        'claude-4-5-haiku-20251015',
        'claude-3-5-sonnet-latest',
        'claude-3-opus-latest'
    ];

    for (const model of models) {
        if (await testModel(model)) break;
    }
}

run();
