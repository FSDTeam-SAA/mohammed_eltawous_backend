import { generatePremiumPDF } from '../../utility/pdfGenerator.js';
import { callClaudeJSON, callClaudeStream, MODELS } from './ai.service.js';
import { cloudinaryUploadBuffer } from '../../lib/cloudinaryUpload.js';

export const classifyForces = async (req, res, next) => {
  try {
    const { company, forces, conversationHistory } = req.body;

    const sharedContext =
      "Detailed Company context: " + JSON.stringify(company) + "\n\n" +
      "All driving forces: " + JSON.stringify(forces);

    const specificPrompt =
      "Focal Strategic Question: " + (company.focalQuestion || "General strategy") + "\n" +
      "Horizon Year: " + (company.horizonYear || "2030") + "\n\n" +
      "Task: Comprehensive Classification. Classify EVERY driving force provided in the Shared Context with respect to the Focal Question above.\n" +
      "Categorize them into:\n" +
      "1. Predetermined elements (structural changes almost certain to happen regardless of the future outcome).\n" +
      "2. Critical uncertainties (high impact on the focal question but genuinely unpredictable outcome).\n\n" +
      "Return JSON exactly matching this format: { \"predetermined\": [], \"uncertainties\": [] }.\n" +
      "CRITICAL: Do not omit any forces. If a force is provided in the input, it must appear in exactly one of the two categories above.";

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.1, 4096, MODELS.SONNET, sharedContext);
    res.status(200).json({
      success: true,
      data: result,
      history: [
        ...(conversationHistory || []),
        { role: 'user', content: "Classify forces." },
        { role: 'assistant', content: JSON.stringify(result) }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const selectAxes = async (req, res, next) => {
  try {
    const { company, classification, conversationHistory } = req.body;

    const sharedContext =
      "Company Context: " + JSON.stringify(company) + "\n\n" +
      "Critical Uncertainties: " + JSON.stringify(classification.uncertainties);

    const specificPrompt =
      "Task: Select EXACTLY 2 individual critical uncertainties from the Shared Context to become the scenario axes.\n" +
      "Selection Criteria:\n" +
      "1. Highest strategic impact on the focal question.\n" +
      "2. Genuine unpredictability.\n" +
      "3. Independence (uncorrelated — if one moves, the other doesn't necessarily move with it).\n\n" +
      "CRITICAL: Do NOT synthesize or combine multiple forces into a 'theme'. Pick exactly one specific, individual force from the input list for Axis A and one for Axis B.\n\n" +
      "For each axis define 2 polar end labels (extreme opposite outcomes).\n\n" +
      "Also, pre-generate 4 scenario names and 1-sentence summaries for the resulting matrix quadrants:\n" +
      "- topRight (poleA2 + poleB2)\n" +
      "- topLeft (poleA1 + poleB2)\n" +
      "- bottomLeft (poleA1 + poleB1)\n" +
      "- bottomRight (poleA2 + poleB1)\n\n" +
      "Return JSON exactly matching this format:\n" +
      "{\n" +
      "  \"axisA\": { \"label\": \"concise UI name\", \"selectedForce\": \"exact original force string from input\", \"poleA1\": \"string\", \"poleA2\": \"string\", \"reason\": \"string\" },\n" +
      "  \"axisB\": { \"label\": \"concise UI name\", \"selectedForce\": \"exact original force string from input\", \"poleB1\": \"string\", \"poleB2\": \"string\", \"reason\": \"string\" },\n" +
      "  \"scenarios\": {\n" +
      "    \"topRight\": { \"name\": \"string\", \"summary\": \"string\" },\n" +
      "    \"topLeft\": { \"name\": \"string\", \"summary\": \"string\" },\n" +
      "    \"bottomLeft\": { \"name\": \"string\", \"summary\": \"string\" },\n" +
      "    \"bottomRight\": { \"name\": \"string\", \"summary\": \"string\" }\n" +
      "  }\n" +
      "}";

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.1, 1500, MODELS.SONNET, sharedContext);
    res.status(200).json({
      success: true,
      data: result,
      history: [
        ...(conversationHistory || []),
        { role: 'user', content: "Select axes." },
        { role: 'assistant', content: JSON.stringify(result) }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const buildScenarios = async (req, res, next) => {
  try {
    const { company, axes, forces, conversationHistory } = req.body;

    const sharedContext =
      "Detailed Company context: " + JSON.stringify(company) + "\n\n" +
      "All driving forces: " + JSON.stringify(forces);

    // Quadrant definitions
    const quadrants = [
      { id: 1, comb: "A1+B1", pA: axes.axisA.poleA1, pB: axes.axisB.poleB1 },
      { id: 2, comb: "A1+B2", pA: axes.axisA.poleA1, pB: axes.axisB.poleB2 },
      { id: 3, comb: "A2+B1", pA: axes.axisA.poleA2, pB: axes.axisB.poleB1 },
      { id: 4, comb: "A2+B2", pA: axes.axisA.poleA2, pB: axes.axisB.poleB2 }
    ];

    // Helper to generate a single scenario
    const generateScenario = async (q) => {
      const specificPrompt =
        `Build a scenario story where both ${axes.axisA.label} is ${q.pA} AND ${axes.axisB.label} is ${q.pB}.\n` +
        `Focal question: ${company.focalQuestion}\n\n` +
        `Task: Concise Scenario Construction. Generate 1 scenario for this quadrant (${q.comb}).\n` +
        `- Give it a vivid memorable name.\n` +
        `- Write a concise but impactful 1-2 paragraph story of the world in ${company.horizonYear}.\n` +
        `- Explain implications for ${company.name} (exactly 2 concise sentences).\n` +
        `- List 3-4 key early warning signposts.\n\n` +
        `Return JSON exactly matching this format: { "name": "string", "story": "string", "implications": "string", "signposts": ["string"] }`;

      const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.7, 2500, MODELS.SONNET, sharedContext);
      return { ...result, id: q.id, combination: q.comb };
    };

    // To prevent hitting TPM limits and deployment timeouts on huge data, 
    // we process scenarios in batches (2 + 2)
    const batch1 = await Promise.all([generateScenario(quadrants[0]), generateScenario(quadrants[1])]);
    const batch2 = await Promise.all([generateScenario(quadrants[2]), generateScenario(quadrants[3])]);

    const finalResult = { scenarios: [...batch1, ...batch2] };

    res.status(200).json({
      success: true,
      data: finalResult,
      history: [
        ...(conversationHistory || []),
        { role: 'user', content: "Build 4 scenarios." },
        { role: 'assistant', content: JSON.stringify(finalResult) }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const runWindTunnel = async (req, res, next) => {
  try {
    const { company, scenarios, strategicOptions, conversationHistory } = req.body;

    const hasOptions = strategicOptions && strategicOptions.length > 0;

    const specificPrompt =
      "TASK: WIND TUNNEL ANALYSIS ONLY.\n" +
      "You are evaluating strategic options across predefined scenarios.\n\n" +

      "CRITICAL INSTRUCTIONS:\n" +
      "- DO NOT generate or repeat scenarios\n" +
      "- DO NOT include narratives, opportunities, or threats\n" +
      "- DO NOT return anything except the required JSON\n" +
      "- If you deviate from the format, the response is invalid\n\n" +

      "Company: " + company.name + "\n" +
      "Focal Question: " + company.focalQuestion + "\n" +
      "Horizon Year: " + company.horizonYear + "\n\n" +

      "Scenarios (names only): " + JSON.stringify(scenarios.map(s => s.name)) + "\n\n" +

      (hasOptions
        ? "Strategic options: " + JSON.stringify(strategicOptions) + "\n\n"
        : "TASK: First generate 3 distinct, high-impact strategic options labeled exactly as Option A, Option B, Option C.\n\n") +

      "EVALUATION INSTRUCTIONS:\n" +
      "For EACH combination of (Option × Scenario):\n" +
      "- Provide rating: Excellent | Good | Moderate | Poor\n" +
      "- Provide reasoning: exactly 2 concise sentences\n\n" +

      "Also identify:\n" +
      "- No-regret moves (work across ALL scenarios)\n" +
      "- Options to keep open (hedge bets)\n" +
      "- Decisions to defer (wait for more signals)\n\n" +

      "FINAL OUTPUT FORMAT (STRICT JSON ONLY):\n" +
      "{\n" +
      (hasOptions ? "" : "  \"generatedOptions\": [\"string\", \"string\", \"string\"],\n") +
      "  \"windTunnel\": [\n" +
      "    [ { \"rating\": \"string\", \"reasoning\": \"string\" } ]\n" +
      "  ],\n" +
      "  \"robustMoves\": {\n" +
      "    \"noRegret\": [\"string\"],\n" +
      "    \"keepOpen\": [\"string\"],\n" +
      "    \"defer\": [\"string\"]\n" +
      "  },\n" +
      "  \"strategicConclusion\": \"string\",\n" +
      "  \"recommendedOption\": \"string\"\n" +
      "}";


    const sharedContext =
      "Company: " + JSON.stringify(company) + "\n\n" +
      "Scenarios: " + JSON.stringify(scenarios.map(s => ({ name: s.name, story: s.story })));

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.2, 3500, MODELS.SONNET, sharedContext);
    res.status(200).json({
      success: true,
      data: result,
      history: [
        ...(conversationHistory || []),
        { role: 'user', content: hasOptions ? "Run wind tunnel." : "Generate and test options." },
        { role: 'assistant', content: JSON.stringify(result) }
      ]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * STREAMING Report Generation (No PDF/Cloudinary for now)
 */
export const generateReport = async (req, res, next) => {
  try {
    const { workshopState } = req.body;
    const { company } = workshopState;

    const specificPrompt =
      `You are a premium strategy consultant (McKinsey/Shell style).\n` +
      `TASK: Generate a COMPREHENSIVE STRATEGIC REPORT for ${company.name} based on the provided workshop state.\n\n` +
      `FOCAL QUESTION: ${company.focalQuestion}\n` +
      `HORIZON YEAR: ${company.horizonYear}\n\n` +
      `OUTPUT ONLY THE MARKDOWN CONTENT. NO JSON, NO PREAMBLE. USE ## FOR HEADERS.\n\n` +
      "1. Executive Summary\n2. Focal Question\n3. Key Uncertainties\n4. Scenarios\n5. Stress-Test Analysis\n6. Recommendations\n7. Signposts";

    const sharedContext = "Full Workshop State to base the report on: " + JSON.stringify(workshopState);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await callClaudeStream([], specificPrompt, 0.5, 4000, MODELS.SONNET, sharedContext);

    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullText += text;
        res.write(text);
      }
    }

    // Send the final JSON data for logic (HIDDEN FROM UI)
    const finalData = {
      success: true,
      reportMarkdown: fullText.trim(),
      generatedAt: new Date().toISOString()
    };
    
    // Using a more distinct marker to prevent UI leaks
    res.write("\n\n###JSON_DATA###" + JSON.stringify(finalData));
    res.end();

  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      console.error("Streaming Error:", error);
      res.end();
    }
  }
};

/**
 * FAST PDF Export & Cloud Upload: Converts provided Markdown to PDF and uploads it.
 */
export const downloadPDF = async (req, res, next) => {
  try {
    const { reportMarkdown, companyName = "Strategic Report" } = req.body;

    if (!reportMarkdown) {
      return res.status(400).json({ success: false, message: "No report content provided." });
    }

    // 1. Generate PDF Buffer locally (fast, no Chrome)
    const pdfBuffer = await generatePremiumPDF(reportMarkdown, { companyName });

    // 2. Upload to Cloudinary
    const publicId = `report_${Date.now()}`;
    const folder = "workshop_reports";

    const uploadResult = await cloudinaryUploadBuffer(pdfBuffer, publicId, folder);

    // 3. Return the secure URL
    res.status(200).json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        fileName: `${companyName.replaceAll(' ', '_')}_Strategic_Report.pdf`
      }
    });

  } catch (error) {
    next(error);
  }
};
