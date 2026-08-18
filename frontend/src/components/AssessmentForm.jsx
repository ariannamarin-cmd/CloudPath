import { useState } from 'react';

const ARCHITECTURE_OPTIONS = [
  { value: 'monolith', label: 'Monolith' },
  { value: 'modular-monolith', label: 'Modular Monolith' },
  { value: 'microservices', label: 'Microservices' },
];

const HOSTING_OPTIONS = [
  { value: 'on-premises', label: 'On-Premises' },
  { value: 'virtual-machines', label: 'Virtual Machines' },
  { value: 'cloud-vms', label: 'Cloud VMs' },
  { value: 'containers', label: 'Containers' },
  { value: 'managed-cloud-platform', label: 'Managed Cloud Platform' },
];

const DEPLOYMENT_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'scripted', label: 'Scripted' },
  { value: 'cicd', label: 'CI/CD' },
];

const READINESS_QUESTIONS = [
  { key: 'containerized', label: 'Is the application containerized?' },
  { key: 'externalizedState', label: 'Is application state stored externally?' },
  {
    key: 'externalizedSecrets',
    label: 'Are secrets externalized from application code and configuration files?',
  },
  { key: 'healthCheck', label: 'Does the application expose a health-check endpoint?' },
  { key: 'centralizedLogging', label: 'Are logs centralized?' },
  { key: 'infrastructureAsCode', label: 'Is infrastructure managed using Infrastructure as Code?' },
  { key: 'cicd', label: 'Is deployment automated through CI/CD?' },
  { key: 'horizontalScaling', label: 'Can the application scale horizontally?' },
  { key: 'observability', label: 'Is monitoring and observability configured?' },
];

const INITIAL_FORM = {
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

function AssessmentForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleReadinessChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="assessment-form" onSubmit={handleSubmit}>
      <section className="form-section card">
        <h2>Application Profile</h2>

        <div className="form-field">
          <label htmlFor="architecture">Current Architecture</label>
          <select
            id="architecture"
            name="architecture"
            value={form.architecture}
            onChange={handleProfileChange}
          >
            {ARCHITECTURE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="hosting">Current Hosting</label>
          <select id="hosting" name="hosting" value={form.hosting} onChange={handleProfileChange}>
            {HOSTING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="deploymentProcess">Deployment Process</label>
          <select
            id="deploymentProcess"
            name="deploymentProcess"
            value={form.deploymentProcess}
            onChange={handleProfileChange}
          >
            {DEPLOYMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="form-section card">
        <h2>Cloud Engineering Readiness</h2>

        {READINESS_QUESTIONS.map(({ key, label }) => (
          <fieldset key={key} className="readiness-field">
            <legend>{label}</legend>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name={key}
                  checked={form[key] === true}
                  onChange={() => handleReadinessChange(key, true)}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name={key}
                  checked={form[key] === false}
                  onChange={() => handleReadinessChange(key, false)}
                />
                No
              </label>
            </div>
          </fieldset>
        ))}
      </section>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Assessing Application…' : 'Assess Application'}
      </button>
    </form>
  );
}

export default AssessmentForm;
