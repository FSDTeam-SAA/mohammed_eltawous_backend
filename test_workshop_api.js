import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1/workshop';

const companyData = {
  name: "AlWasl Capital",
  focalQuestion: "Should we build a retail digital wealth platform or double down on relationship banking?",
  horizonYear: "2030"
};

const scenarios = [
  { name: "Majlis Holds" },
  { name: "Digital Souk" },
  { name: "Velvet Rope" },
  { name: "Sandstorm" }
];

const strategicOptions = [
  "Option A: Full digital platform build — invest AED 400M over five years",
  "Option B: Digitally enhanced relationship model — invest AED 120M",
  "Option C: Stay the course — minimal digital investment"
];

async function runTest() {
  console.log("Testing Wind Tunnel Endpoint...");
  
  try {
    const response = await fetch(`${BASE_URL}/windtunnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        company: companyData,
        scenarios: scenarios,
        strategicOptions: strategicOptions,
        conversationHistory: []
      })
    });

    const result = await response.json();
    console.log("Wind Tunnel Results:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("\nTesting Report Generation...");
      const reportResponse = await fetch(`${BASE_URL}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workshopState: {
            company: companyData,
            scenarios: scenarios,
            windTunnel: result.data.windTunnel,
            robustMoves: result.data.robustMoves
          }
        })
      });

      const reportResult = await reportResponse.json();
      console.log("Report Result:", JSON.stringify(reportResult, null, 2));
    }
  } catch (error) {
    console.error("Test Failed:", error.message);
  }
}

runTest();
