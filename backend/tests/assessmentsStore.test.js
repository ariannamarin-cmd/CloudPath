const {
  generateId,
  addAssessment,
  getAllAssessments,
  resetStore,
} = require('../src/data/assessments');

describe('assessments store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('generates sequential assessment IDs', () => {
    expect(generateId()).toBe('assessment-1');
    expect(generateId()).toBe('assessment-2');
  });

  it('stores and retrieves assessments', () => {
    const assessment = {
      id: generateId(),
      readinessScore: 50,
      readinessLevel: 'MODERATE',
      modernizationStrategy: 'REPLATFORM',
      summary: 'Test summary',
      strengths: [],
      gaps: [],
      recommendations: [],
    };

    addAssessment(assessment);

    expect(getAllAssessments()).toEqual([
      {
        id: 'assessment-1',
        readinessScore: 50,
        readinessLevel: 'MODERATE',
        modernizationStrategy: 'REPLATFORM',
      },
    ]);
  });

  it('resets the store', () => {
    addAssessment({
      id: generateId(),
      readinessScore: 10,
      readinessLevel: 'LOW',
      modernizationStrategy: 'RETAIN',
    });

    resetStore();

    expect(getAllAssessments()).toEqual([]);
    expect(generateId()).toBe('assessment-1');
  });
});
