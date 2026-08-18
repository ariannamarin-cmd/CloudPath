const express = require('express');
const { generateId, addAssessment, getAllAssessments } = require('../data/assessments');
const { processAssessment } = require('../services/assessmentService');

const router = express.Router();

const VALID_ARCHITECTURES = ['monolith', 'modular-monolith', 'microservices'];
const VALID_HOSTING = [
  'on-premises',
  'virtual-machines',
  'cloud-vms',
  'containers',
  'managed-cloud-platform',
];
const VALID_DEPLOYMENT_PROCESSES = ['manual', 'scripted', 'cicd'];

const READINESS_FIELDS = [
  'containerized',
  'externalizedState',
  'externalizedSecrets',
  'healthCheck',
  'centralizedLogging',
  'infrastructureAsCode',
  'cicd',
  'horizontalScaling',
  'observability',
];

function validateAssessmentRequest(body) {
  const details = [];

  if (body.architecture === undefined) {
    details.push('architecture is required');
  } else if (!VALID_ARCHITECTURES.includes(body.architecture)) {
    details.push('architecture must be a supported option');
  }

  if (body.hosting === undefined) {
    details.push('hosting is required');
  } else if (!VALID_HOSTING.includes(body.hosting)) {
    details.push('hosting must be a supported option');
  }

  if (body.deploymentProcess === undefined) {
    details.push('deploymentProcess is required');
  } else if (!VALID_DEPLOYMENT_PROCESSES.includes(body.deploymentProcess)) {
    details.push('deploymentProcess must be a supported option');
  }

  READINESS_FIELDS.forEach((field) => {
    if (body[field] === undefined) {
      details.push(`${field} is required`);
    } else if (typeof body[field] !== 'boolean') {
      details.push(`${field} must be a boolean`);
    }
  });

  return details;
}

router.get('/', (_req, res) => {
  res.json(getAllAssessments());
});

router.post('/', (req, res) => {
  const details = validateAssessmentRequest(req.body);

  if (details.length > 0) {
    return res.status(400).json({
      error: 'Invalid assessment request',
      details,
    });
  }

  const input = {
    architecture: req.body.architecture,
    hosting: req.body.hosting,
    deploymentProcess: req.body.deploymentProcess,
    containerized: req.body.containerized,
    externalizedState: req.body.externalizedState,
    externalizedSecrets: req.body.externalizedSecrets,
    healthCheck: req.body.healthCheck,
    centralizedLogging: req.body.centralizedLogging,
    infrastructureAsCode: req.body.infrastructureAsCode,
    cicd: req.body.cicd,
    horizontalScaling: req.body.horizontalScaling,
    observability: req.body.observability,
  };

  const result = processAssessment(input);
  const assessment = {
    id: generateId(),
    ...result,
  };

  addAssessment(assessment);
  res.status(201).json(assessment);
});

module.exports = router;
