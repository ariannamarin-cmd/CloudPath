const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/data/assessments');

const validAssessment = {
  architecture: 'monolith',
  hosting: 'virtual-machines',
  deploymentProcess: 'scripted',
  containerized: false,
  externalizedState: false,
  externalizedSecrets: true,
  healthCheck: true,
  centralizedLogging: false,
  infrastructureAsCode: true,
  cicd: true,
  horizontalScaling: false,
  observability: true,
};

describe('POST /api/assessments', () => {
  beforeEach(() => {
    resetStore();
  });

  it('creates an assessment and returns the full result', async () => {
    const response = await request(app).post('/api/assessments').send(validAssessment);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 'assessment-1',
      readinessScore: 50,
      readinessLevel: 'MODERATE',
      modernizationStrategy: 'REPLATFORM',
      summary: expect.any(String),
      strategyExplanation: expect.any(String),
      strengths: expect.any(Array),
      gaps: expect.any(Array),
      recommendations: expect.any(Array),
    });
  });

  it('returns 400 for missing required fields', async () => {
    const response = await request(app).post('/api/assessments').send({
      hosting: 'virtual-machines',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid assessment request',
      details: expect.arrayContaining(['architecture is required']),
    });
  });

  it('returns 400 for invalid architecture', async () => {
    const response = await request(app)
      .post('/api/assessments')
      .send({ ...validAssessment, architecture: 'serverless' });

    expect(response.status).toBe(400);
    expect(response.body.details).toContain('architecture must be a supported option');
  });

  it('returns 400 for invalid hosting', async () => {
    const response = await request(app)
      .post('/api/assessments')
      .send({ ...validAssessment, hosting: 'bare-metal' });

    expect(response.status).toBe(400);
    expect(response.body.details).toContain('hosting must be a supported option');
  });

  it('returns 400 for invalid deploymentProcess', async () => {
    const response = await request(app)
      .post('/api/assessments')
      .send({ ...validAssessment, deploymentProcess: 'automated' });

    expect(response.status).toBe(400);
    expect(response.body.details).toContain('deploymentProcess must be a supported option');
  });

  it('returns 400 when readiness fields are not booleans', async () => {
    const response = await request(app)
      .post('/api/assessments')
      .send({ ...validAssessment, containerized: 'yes' });

    expect(response.status).toBe(400);
    expect(response.body.details).toContain('containerized must be a boolean');
  });
});

describe('GET /api/assessments', () => {
  beforeEach(() => {
    resetStore();
  });

  it('returns an empty list when no assessments exist', async () => {
    const response = await request(app).get('/api/assessments');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('returns a summary list of stored assessments', async () => {
    await request(app).post('/api/assessments').send(validAssessment);
    await request(app).post('/api/assessments').send({
      ...validAssessment,
      containerized: true,
      externalizedState: true,
      centralizedLogging: true,
      horizontalScaling: true,
    });

    const response = await request(app).get('/api/assessments');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toEqual({
      id: 'assessment-1',
      readinessScore: 50,
      readinessLevel: 'MODERATE',
      modernizationStrategy: 'REPLATFORM',
    });
    expect(response.body[1].readinessScore).toBe(100);
  });
});
