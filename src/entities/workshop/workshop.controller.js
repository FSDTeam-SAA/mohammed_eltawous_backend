import { callClaudeJSON, MODELS } from './ai.service.js';

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

    const systemLock = `
You are a STRICT JSON generator.

You are currently in the "Wind Tunnel" step.
DO NOT generate scenarios.
DO NOT repeat previous outputs.

Only return output in the exact JSON format requested.
If you deviate, the response is invalid.
`;

    // const specificPrompt =
    //   "Test strategic options against scenarios (the \"Wind Tunnel\").\n" +
    //   "Company: " + company.name + "\n" +
    //   "Scenarios: " + JSON.stringify(scenarios.map(s => s.name)) + "\n" +
    //   (hasOptions
    //     ? "Strategic options to test: " + JSON.stringify(strategicOptions) + "\n"
    //     : "TASK: You must first GENERATE 3 distinct, high-impact strategic options for this company based on their context and the 4 scenarios provided. Label them Option A, B, and C.\n") +
    //   "\n" +
    //   "For each option × scenario combination:\n" +
    //   "- Rate: Excellent / Good / Moderate / Poor\n" +
    //   "- Give 2-sentence reasoning\n\n" +
    //   "Also identify based on the wind tunnel testing:\n" +
    //   "- No-regret moves (work across ALL scenarios)\n" +
    //   "- Options to keep open (hedge bets)\n" +
    //   "- Decisions to defer (wait for more signals)\n" +
    //   "- STRATEGIC CONCLUSION: A 3-sentence executive summary of which path is best and why.\n" +
    //   "- RECOMMENDED OPTION: State which option is the winner.\n" +
    //   "\n" +
    //   "Return JSON exactly matching this format:\n" +
    //   "{ " + (hasOptions ? "" : "\"generatedOptions\": [\"string\"], ") + "\"windTunnel\": [ [ { \"rating\": \"string\", \"reasoning\": \"string\" } ] ], \"robustMoves\": { \"noRegret\": [\"string\"], \"keepOpen\": [\"string\"], \"defer\": [\"string\"] }, \"strategicConclusion\": \"string\", \"recommendedOption\": \"string\" }";


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
    // const result = await callClaudeJSON(
    //   [], // 🔥 REMOVE history
    //   systemLock,
    //   specificPrompt,
    //   0.2,
    //   3500,
    //   MODELS.SONNET
    // );
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

    const sharedContext = "Full Workshop State Context: " + JSON.stringify(workshopState);

    // Helper to call Claude with a specific prompt and model
    const getSection = (title, prompt, model = MODELS.HAIKU) => {
      const specificPrompt =
        `You are a premium strategy consultant (McKinsey/Shell style).\n` +
        `Task: Generate the "${title}" section of a scenario planning report for ${company.name}.\n\n` +
        `Specific Instructions for this section:\n${prompt}\n\n` +
        `Return JSON: { "content": "string (markdown format, no top-level # header)" }`;

      return callClaudeJSON([], specificPrompt, 0.5, 2000, model, sharedContext);
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
