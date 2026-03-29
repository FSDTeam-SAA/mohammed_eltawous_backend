import { callClaudeJSON, MODELS } from './ai.service.js';

export const classifyForces = async (req, res, next) => {
  try {
    const { company, forces, conversationHistory } = req.body;

    const specificPrompt =
      "Detailed Company context: " + JSON.stringify(company) + "\\n\\n" +
      "Focal Strategic Question: " + (company.focalQuestion || "General strategy") + "\\n" +
      "Horizon Year: " + (company.horizonYear || "2030") + "\\n\\n" +
      "Here are the driving forces identified: " + JSON.stringify(forces) + "\\n\\n" +
      "Task: Classify these driving forces with respect to the Focal Question above.\\n" +
      "Categorize them into:\\n" +
      "1. Predetermined elements (structural changes almost certain to happen regardless of the future outcome).\\n" +
      "2. Critical uncertainties (high impact on the focal question but genuinely unpredictable outcome).\\n\\n" +
      "Return JSON exactly matching this format: { \"predetermined\": [], \"uncertainties\": [] }";

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.1, 800, MODELS.HAIKU);
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

    const specificPrompt =
      "Company Context: " + JSON.stringify(company) + "\\n\\n" +
      "From this list of critical uncertainties:\\n" +
      JSON.stringify(classification.uncertainties) + "\\n\\n" +
      "Task: Select EXACTLY 2 critical uncertainties to become the scenario axes.\\n" +
      "Selection Criteria:\\n" +
      "1. Highest strategic impact on the focal question.\\n" +
      "2. Genuine unpredictability.\\n" +
      "3. Independence (uncorrelated — if one moves, the other doesn't necessarily move with it).\\n\\n" +
      "For each axis define 2 polar end labels (extreme opposite outcomes).\\n" +
      "Also, pre-generate 4 scenario names and 1-sentence summaries for the resulting matrix quadrants:\\n" +
      "- topRight (poleA2 + poleB2)\\n" +
      "- topLeft (poleA1 + poleB2)\\n" +
      "- bottomLeft (poleA1 + poleB1)\\n" +
      "- bottomRight (poleA2 + poleB1)\\n\\n" +
      "Return JSON exactly matching this format:\\n" +
      "{" +
      "  \"axisA\": { \"label\": \"string\", \"poleA1\": \"string\", \"poleA2\": \"string\", \"reason\": \"string\" }," +
      "  \"axisB\": { \"label\": \"string\", \"poleB1\": \"string\", \"poleB2\": \"string\", \"reason\": \"string\" }," +
      "  \"scenarios\": {" +
      "    \"topRight\": { \"name\": \"string\", \"summary\": \"string\" }," +
      "    \"topLeft\": { \"name\": \"string\", \"summary\": \"string\" }," +
      "    \"bottomLeft\": { \"name\": \"string\", \"summary\": \"string\" }," +
      "    \"bottomRight\": { \"name\": \"string\", \"summary\": \"string\" }" +
      "  }" +
      "}";

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.1, 1000, MODELS.HAIKU);
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

    // Quadrant definitions
    const quadrants = [
      { id: 1, comb: "A1+B1", pA: axes.axisA.poleA1, pB: axes.axisB.poleB1 },
      { id: 2, comb: "A1+B2", pA: axes.axisA.poleA1, pB: axes.axisB.poleB2 },
      { id: 3, comb: "A2+B1", pA: axes.axisA.poleA2, pB: axes.axisB.poleB1 },
      { id: 4, comb: "A2+B2", pA: axes.axisA.poleA2, pB: axes.axisB.poleB2 }
    ];

    const scenarioPromises = quadrants.map(q => {
      const specificPrompt =
        `Build the scenario story for ${company.name} in the world where both ${axes.axisA.label} is ${q.pA} AND ${axes.axisB.label} is ${q.pB}.\n` +
        `Focal question: ${company.focalQuestion}\n` +
        `All driving forces for context: ${JSON.stringify(forces)}\n\n` +
        `Task: Generate 1 detailed scenario for this quadrant (${q.comb}).\n` +
        `- Give it a vivid memorable name.\n` +
        `- Write a 2-3 paragraph story of the world in ${company.horizonYear}.\n` +
        `- Explain implications for ${company.name} (2-3 sentences).\n` +
        `- List 3-4 early warning signposts.\n\n` +
        `Return JSON exactly matching this format: { "name": "string", "story": "string", "implications": "string", "signposts": ["string"] }`;

      return callClaudeJSON(conversationHistory, specificPrompt, 0.7, 1200, MODELS.SONNET)
        .then(result => ({ ...result, id: q.id, combination: q.comb }));
    });

    const scenarios = await Promise.all(scenarioPromises);
    const finalResult = { scenarios };

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
      "Test strategic options against scenarios (the \"Wind Tunnel\").\n" +
      "Company: " + company.name + "\n" +
      "Scenarios: " + JSON.stringify(scenarios.map(s => s.name)) + "\n" +
      (hasOptions
        ? "Strategic options to test: " + JSON.stringify(strategicOptions) + "\n"
        : "TASK: You must first GENERATE 3 distinct, high-impact strategic options for this company based on their context and the 4 scenarios provided. Label them Option A, B, and C.\n") +
      "\n" +
      "For each option × scenario combination:\n" +
      "- Rate: Excellent / Good / Moderate / Poor\n" +
      "- Give 2-sentence reasoning\n\n" +
      "Also identify based on the wind tunnel testing:\n" +
      "- No-regret moves (work across ALL scenarios)\n" +
      "- Options to keep open (hedge bets)\n" +
      "- Decisions to defer (wait for more signals)\n" +
      "- STRATEGIC CONCLUSION: A 3-sentence executive summary of which path is best and why.\n" +
      "- RECOMMENDED OPTION: State which option is the winner.\n" +
      "\n" +
      "Return JSON exactly matching this format:\n" +
      "{ " + (hasOptions ? "" : "\"generatedOptions\": [\"string\"], ") + "\"windTunnel\": [ [ { \"rating\": \"string\", \"reasoning\": \"string\" } ] ], \"robustMoves\": { \"noRegret\": [\"string\"], \"keepOpen\": [\"string\"], \"defer\": [\"string\"] }, \"strategicConclusion\": \"string\", \"recommendedOption\": \"string\" }";

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.2, 3500, MODELS.SONNET);
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

export const generateReport = async (req, res, next) => {
  try {
    const { workshopState } = req.body;
    const { company, classification, axes, scenarios, windTunnelResult } = workshopState;

    // Helper to call Claude with a specific prompt and model
    const getSection = (title, prompt, model = MODELS.HAIKU) => {
      const fullPrompt =
        `You are a premium strategy consultant (McKinsey/Shell style).\n` +
        `Task: Generate the "${title}" section of a scenario planning report for ${company.name}.\n\n` +
        `Full Context: ${JSON.stringify(workshopState)}\n\n` +
        `Specific Instructions for this section:\n${prompt}\n\n` +
        `Return JSON: { "content": "string (markdown format, no top-level # header)" }`;
      return callClaudeJSON([], fullPrompt, 0.5, 2000, model);
    };

    const sectionPromises = [
      // 1. Executive Summary (Sonnet)
      getSection("Executive Summary",
        "Summarize the key findings, the most critical uncertainties, the 4 scenarios at a high level, and the final strategic recommendations. 2-3 paragraphs. Sound authoritative.",
        MODELS.SONNET
      ),
      // 2. Focal Question & Horizon (Haiku)
      getSection("Focal Question & Horizon",
        "State the focal question being addressed and the horizon year. Explain why this specific question is critical for the company's future.",
        MODELS.HAIKU
      ),
      // 3. Key Uncertainties (Haiku)
      getSection("The Driving Forces of Uncertainty",
        "Summarize the 2 key axes/uncertainties selected. For each, explain the two polar outcomes (Poles) and why this uncertainty matters. Mention the predetermined elements discovered briefly.",
        MODELS.HAIKU
      ),
      // 4. Future Scenarios (Sonnet)
      getSection("The 4 Future Scenarios",
        "Present the 4 scenarios (topRight, topLeft, bottomLeft, bottomRight). For each, give its name and a concise, vivid synthesis of the world it describes. Use the provided scenario-stories for details.",
        MODELS.SONNET
      ),
      // 5. Wind Tunnel Stress-Test (Sonnet)
      getSection("Strategy Stress-Test (Wind Tunnel)",
        "Synthesize the results of the wind tunnel testing. Which options performed well across all scenarios? Which options were fragile? Summarize the robustness of the strategy.",
        MODELS.SONNET
      ),
      // 6. Strategic Recommendations (Sonnet)
      getSection("Robust Strategic Recommendations",
        "Provide final, actionable recommendations based on the 'No-Regret moves' and 'Recommended Option'. Explain the logic for the chosen path.",
        MODELS.SONNET
      ),
      // 7. Early Warning Dashboard (Haiku)
      getSection("Early Warning Dashboard",
        "List the key signposts from all scenarios that the leadership team should monitor to know which future is unfolding.",
        MODELS.HAIKU
      )
    ];

    const results = await Promise.all(sectionPromises);

    const reportMarkdown = [
      `# Strategic Scenario Planning Report: ${company.name}`,
      `## Executive Summary\n${results[0].content}`,
      `## 1. The Focal Question & Horizon\n${results[1].content}`,
      `## 2. The Driving Forces of Uncertainty\n${results[2].content}`,
      `## 3. Four Alternative Worlds (Scenarios)\n${results[3].content}`,
      `## 4. Stress-Testing Our Strategy (Wind Tunnel)\n${results[4].content}`,
      `## 5. Strategic Recommendations & Path Forward\n${results[5].content}`,
      `## 6. Early Warning Dashboard\n${results[6].content}`,
      `\n---\n*Report generated by AI Scenario Planning Workshop*`
    ].join("\n\n");

    res.status(200).json({
      success: true,
      data: { fullReportMarkdown: reportMarkdown }
    });

  } catch (error) {
    next(error);
  }
};
