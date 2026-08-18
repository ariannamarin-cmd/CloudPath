const assessments = [];
let nextId = 1;

function generateId() {
  const id = `assessment-${nextId}`;
  nextId += 1;
  return id;
}

function addAssessment(assessment) {
  assessments.push(assessment);
  return assessment;
}

function getAllAssessments() {
  return assessments.map(({ id, readinessScore, readinessLevel, modernizationStrategy }) => ({
    id,
    readinessScore,
    readinessLevel,
    modernizationStrategy,
  }));
}

function resetStore() {
  assessments.length = 0;
  nextId = 1;
}

module.exports = {
  generateId,
  addAssessment,
  getAllAssessments,
  resetStore,
};
