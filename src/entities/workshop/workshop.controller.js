import { callClaudeJSON } from './ai.service.js';

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

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.1, 1500);
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
      "Return JSON exactly matching this format:\\n" +
      "{ \"axisA\": { \"label\": \"string\", \"poleA1\": \"string\", \"poleA2\": \"string\", \"reason\": \"string\" }, \"axisB\": { \"label\": \"string\", \"poleB1\": \"string\", \"poleB2\": \"string\", \"reason\": \"string\" } }";

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.1, 1200);
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
    
    const specificPrompt = 
      "Build 4 scenario narratives for " + company.name + ".\\n" +
      "Focal question: " + company.focalQuestion + "\\n" +
      "Axis A: " + axes.axisA.label + " — poles: [" + axes.axisA.poleA1 + "] vs [" + axes.axisA.poleA2 + "]\\n" +
      "Axis B: " + axes.axisB.label + " — poles: [" + axes.axisB.poleB1 + "] vs [" + axes.axisB.poleB2 + "]\\n\\n" +
      "All driving forces for context: " + JSON.stringify(forces) + "\\n\\n" +
      "For each of the 4 quadrant combinations (A1+B1, A1+B2, A2+B1, A2+B2):\\n" +
      "- Give the scenario a vivid memorable name\\n" +
      "- Write a 3-4 paragraph story of what the world looks like in " + company.horizonYear + " in this scenario\\n" +
      "- Explain what this means specifically for " + company.name + "\\n" +
      "- List 4-5 early warning signposts — observable signals that this scenario is beginning to unfold\\n\\n" +
      "Use the benchmark example as your quality target for depth and specificity.\\n" +
      "Return JSON exactly matching this format:\\n" +
      "{ \"scenarios\": [ { \"id\": 1, \"name\": \"string\", \"combination\": \"A1+B1\", \"story\": \"string\", \"implications\": \"string\", \"signposts\": [\"string\"] } ] }";

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.7, 4096);
    res.status(200).json({ 
      success: true, 
      data: result,
      history: [
        ...(conversationHistory || []),
        { role: 'user', content: "Build scenarios." },
        { role: 'assistant', content: JSON.stringify(result) }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const runWindTunnel = async (req, res, next) => {
  try {
    const { company, scenarios, strategicOptions, conversationHistory } = req.body;
    
    const specificPrompt = 
      "Test each strategic option against each scenario (the \"Wind Tunnel\").\\n" +
      "Company: " + company.name + "\\n" +
      "Scenarios: " + JSON.stringify(scenarios.map(s => s.name)) + "\\n" +
      "Strategic options: " + JSON.stringify(strategicOptions) + "\\n\\n" +
      "For each option × scenario combination:\\n" +
      "- Rate: Excellent / Good / Moderate / Poor\\n" +
      "- Give 2-sentence reasoning\\n\\n" +
      "Also identify based on the wind tunnel testing:\\n" +
      "- No-regret moves (work across ALL scenarios)\\n" +
      "- Options to keep open (hedge bets)\\n" +
      "- Decisions to defer (wait for more signals)\\n" +
      "- Early warning dashboard per scenario (Signal, Metric, Trigger point)\\n\\n" +
      "Return JSON exactly matching this format:\\n" +
      "{ \"windTunnel\": [ [ { \"rating\": \"string\", \"reasoning\": \"string\" } ] ], \"robustMoves\": { \"noRegret\": [\"string\"], \"keepOpen\": [\"string\"], \"defer\": [\"string\"] }, \"earlyWarnings\": [ { \"scenario\": \"string\", \"signal\": \"string\", \"metric\": \"string\", \"trigger\": \"string\" } ] }";

    const result = await callClaudeJSON(conversationHistory, specificPrompt, 0.2, 3000);
    res.status(200).json({ 
      success: true, 
      data: result,
      history: [
        ...(conversationHistory || []),
        { role: 'user', content: "Run wind tunnel." },
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
    
    const specificPrompt = 
      "You are compiling the final executive report for a scenario planning workshop.\\n" +
      "Here is the complete state of everything decided and generated in the workshop:\\n" +
      JSON.stringify(workshopState) + "\\n\\n" +
      "Write a professional, cohesive executive report in Markdown format. The report should include:\\n" +
      "- Executive Summary\\n" +
      "- The Focal Question & Horizon Year\\n" +
      "- The 2 Key Uncertainties (Axes)\\n" +
      "- The 4 Future Scenarios\\n" +
      "- Synthesis of the Wind Tunnel Strategy Stress-Test\\n" +
      "- Robust Strategic Recommendations\\n" +
      "- Early Warning Dashboard\\n\\n" +
      "Make it sound like a premium consultancy report (like McKinsey or Shell's scenario team).\\n" +
      "Return JSON exactly matching this format:\\n" +
      "{ \"fullReportMarkdown\": \"string (the markdown content)\" }";

    const result = await callClaudeJSON([], specificPrompt, 0.5, 8192);
    res.status(200).json({ 
      success: true, 
      data: result
    });
  } catch (error) {
    next(error);
  }
};
