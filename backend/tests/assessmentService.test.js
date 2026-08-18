const {
  calculateReadinessScore,
  classifyReadinessLevel,
  getReadinessDescription,
  generateStrengths,
  generateGaps,
  generateRecommendations,
  selectModernizationStrategy,
  getStrategyExplanation,
  processAssessment,
} = require('../src/services/assessmentService');

const demoAssessment = {
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

const allCapabilitiesTrue = {
  architecture: 'microservices',
  hosting: 'managed-cloud-platform',
  deploymentProcess: 'cicd',
  containerized: true,
  externalizedState: true,
  externalizedSecrets: true,
  healthCheck: true,
  centralizedLogging: true,
  infrastructureAsCode: true,
  cicd: true,
  horizontalScaling: true,
  observability: true,
};

const allCapabilitiesFalse = {
  architecture: 'monolith',
  hosting: 'on-premises',
  deploymentProcess: 'manual',
  containerized: false,
  externalizedState: false,
  externalizedSecrets: false,
  healthCheck: false,
  centralizedLogging: false,
  infrastructureAsCode: false,
  cicd: false,
  horizontalScaling: false,
  observability: false,
};

describe('calculateReadinessScore', () => {
  it('returns 0 when no capabilities are present', () => {
    expect(calculateReadinessScore(allCapabilitiesFalse)).toBe(0);
  });

  it('returns 100 when all capabilities are present', () => {
    expect(calculateReadinessScore(allCapabilitiesTrue)).toBe(100);
  });

  it('calculates the demo scenario score correctly', () => {
    expect(calculateReadinessScore(demoAssessment)).toBe(50);
  });

  it('applies correct weights for individual capabilities', () => {
    expect(
      calculateReadinessScore({
        ...allCapabilitiesFalse,
        containerized: true,
        cicd: true,
      })
    ).toBe(30);
  });
});

describe('classifyReadinessLevel', () => {
  it('classifies LOW readiness (0–39)', () => {
    expect(classifyReadinessLevel(0)).toBe('LOW');
    expect(classifyReadinessLevel(39)).toBe('LOW');
  });

  it('classifies MODERATE readiness (40–69)', () => {
    expect(classifyReadinessLevel(40)).toBe('MODERATE');
    expect(classifyReadinessLevel(50)).toBe('MODERATE');
    expect(classifyReadinessLevel(69)).toBe('MODERATE');
  });

  it('classifies HIGH readiness (70–89)', () => {
    expect(classifyReadinessLevel(70)).toBe('HIGH');
    expect(classifyReadinessLevel(80)).toBe('HIGH');
    expect(classifyReadinessLevel(89)).toBe('HIGH');
  });

  it('classifies CLOUD READY (90–100)', () => {
    expect(classifyReadinessLevel(90)).toBe('CLOUD READY');
    expect(classifyReadinessLevel(100)).toBe('CLOUD READY');
  });

  it('returns the description for each readiness level', () => {
    expect(getReadinessDescription('MODERATE')).toContain('targeted modernization');
    expect(getReadinessDescription('CLOUD READY')).toContain('strong cloud-ready');
  });
});

describe('selectModernizationStrategy', () => {
  it('recommends RETAIN for low readiness scores', () => {
    expect(selectModernizationStrategy(allCapabilitiesFalse, 0)).toBe('RETAIN');
    expect(selectModernizationStrategy(allCapabilitiesFalse, 35)).toBe('RETAIN');
  });

  it('recommends RETAIN for manual deployment with minimal modern capabilities', () => {
    expect(
      selectModernizationStrategy(
        {
          ...allCapabilitiesFalse,
          deploymentProcess: 'manual',
          healthCheck: true,
        },
        45
      )
    ).toBe('RETAIN');
  });

  it('recommends REHOST for traditional hosting with limited modern capabilities', () => {
    expect(
      selectModernizationStrategy(
        {
          ...allCapabilitiesFalse,
          architecture: 'modular-monolith',
          hosting: 'on-premises',
          deploymentProcess: 'scripted',
          externalizedState: true,
          cicd: true,
        },
        45
      )
    ).toBe('REHOST');
  });

  it('recommends REPLATFORM for the demo scenario', () => {
    expect(selectModernizationStrategy(demoAssessment, 50)).toBe('REPLATFORM');
  });

  it('recommends REFACTOR when architectural constraints block platform modernization', () => {
    expect(
      selectModernizationStrategy(
        {
          ...allCapabilitiesFalse,
          architecture: 'monolith',
          hosting: 'virtual-machines',
          deploymentProcess: 'scripted',
          externalizedSecrets: true,
          healthCheck: true,
        },
        45
      )
    ).toBe('REFACTOR');
  });

  it('returns a known strategy explanation for each strategy', () => {
    ['RETAIN', 'REHOST', 'REPLATFORM', 'REFACTOR'].forEach((strategy) => {
      expect(getStrategyExplanation(strategy)).toBeTruthy();
    });
  });
});

describe('generateStrengths', () => {
  it('returns strengths only for positive capabilities', () => {
    const strengths = generateStrengths(demoAssessment);
    expect(strengths).toContain('Secrets are externalized');
    expect(strengths).toContain('Health checks are implemented');
    expect(strengths).toContain('Infrastructure is managed as code');
    expect(strengths).toContain('Automated CI/CD pipeline exists');
    expect(strengths).toContain('Monitoring and observability are configured');
    expect(strengths).not.toContain('Application is containerized');
  });

  it('returns all strengths when all capabilities are present', () => {
    expect(generateStrengths(allCapabilitiesTrue)).toHaveLength(9);
  });
});

describe('generateGaps', () => {
  it('returns gaps only for missing capabilities', () => {
    const gaps = generateGaps(demoAssessment);
    expect(gaps).toContain('Application is not containerized');
    expect(gaps).toContain('Application state is stored locally');
    expect(gaps).toContain('Centralized logging is missing');
    expect(gaps).toContain('Application cannot scale horizontally');
    expect(gaps).not.toContain('Deployment is not automated');
  });

  it('returns all gaps when no capabilities are present', () => {
    expect(generateGaps(allCapabilitiesFalse)).toHaveLength(9);
  });
});

describe('generateRecommendations', () => {
  it('returns recommendations for missing capabilities', () => {
    const recommendations = generateRecommendations(demoAssessment);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.every((rec) => rec.priority && rec.action && rec.reason)).toBe(true);
  });

  it('sorts HIGH priority recommendations before MEDIUM', () => {
    const recommendations = generateRecommendations(demoAssessment);
    const firstMediumIndex = recommendations.findIndex((rec) => rec.priority === 'MEDIUM');
    const lastHighIndex = recommendations.map((rec) => rec.priority).lastIndexOf('HIGH');

    if (firstMediumIndex !== -1 && lastHighIndex !== -1) {
      expect(lastHighIndex).toBeLessThan(firstMediumIndex);
    }
  });

  it('includes expected HIGH priority actions for demo gaps', () => {
    const actions = generateRecommendations(demoAssessment).map((rec) => rec.action);
    expect(actions).toContain('Containerize the application');
    expect(actions).toContain('Externalize application state');
    expect(actions).toContain('Enable horizontal scaling');
  });
});

describe('processAssessment', () => {
  it('returns a complete assessment result for the demo scenario', () => {
    const result = processAssessment(demoAssessment);

    expect(result).toEqual({
      readinessScore: 50,
      readinessLevel: 'MODERATE',
      modernizationStrategy: 'REPLATFORM',
      strategyExplanation: expect.any(String),
      summary: expect.stringContaining('targeted modernization'),
      strengths: expect.arrayContaining(['Automated CI/CD pipeline exists']),
      gaps: expect.arrayContaining(['Application is not containerized']),
      recommendations: expect.arrayContaining([
        expect.objectContaining({ priority: 'HIGH', action: 'Containerize the application' }),
      ]),
    });
  });
});
