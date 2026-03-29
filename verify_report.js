import { generateReport } from './src/entities/workshop/workshop.controller.js';
import dotenv from 'dotenv';
dotenv.config();

// Mock req, res, next
const req = {
  body: {
    workshopState: {
      company: { name: "TestCorp", focalQuestion: "How to grow in 2030?", horizonYear: "2030" },
      classification: { predetermined: [], uncertainties: [] },
      axes: { axisA: { label: "Tech" }, axisB: { label: "Market" } },
      scenarios: { scenarios: [] },
      windTunnelResult: { windTunnel: [] }
    }
  }
};

const res = {
  status: (code) => ({
    json: (data) => {
      console.log('SUCCESS:', data.success);
      console.log('REPORT LENGTH:', data.data.fullReportMarkdown.length);
      console.log('REPORT SAMPLE:', data.data.fullReportMarkdown.substring(0, 500));
    }
  })
};

const next = (err) => console.error('ERROR:', err);

console.log('Starting parallel report generation test...');
const start = Date.now();
generateReport(req, res, next).then(() => {
  console.log(`Execution time: ${Date.now() - start}ms`);
});
