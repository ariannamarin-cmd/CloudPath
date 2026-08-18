const express = require('express');
const assessmentsRouter = require('./routes/assessments');

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'cloudpath-api',
  });
});

app.use('/api/assessments', assessmentsRouter);

module.exports = app;
