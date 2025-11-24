# Generative AI Bias & Ethics Guidelines

## High-Risk Domains

The following domains have a history of algorithmic bias and require special attention:

- **Hiring & Recruitment**: Historical hiring data can encode gender, race, and age discrimination
- **Loans & Credit Scoring**: Past lending decisions may reflect neighborhood, race, or other protected characteristics
- **Justice & Risk Assessment**: Reoffending predictions can perpetuate systemic biases
- **Healthcare Triage**: Medical AI can replicate historical disparities in care
- **Policing & Surveillance**: Predictive policing can target certain communities disproportionately

## Core Principles

1. **No Blind Trust**: Never assume model output is neutral or unbiased. Treat every generated answer as a pattern-based guess.

2. **Historical Data = Historical Bias**: Training on past decisions means inheriting past discrimination.

3. **Human Oversight Required**: AI should assist, not replace human judgment in high-stakes decisions.

4. **Fairness Testing**: Every system must include evaluation for disparate impact.

5. **Transparency**: Users must understand when AI is making recommendations vs. decisions.

## Required Warnings

When designing systems in high-risk domains, always include:

- Warning about bias in historical data
- Recommendation for human oversight
- Suggestion for fairness audits
- Avoidance of automated final decisions
- Monitoring and evaluation requirements

## Example Warning Text

"Note: AI systems trained on historical data can replicate or amplify past biases (e.g., against certain genders, races, or neighborhoods). You should implement fairness checks, human supervision, and avoid using AI as the final decision-maker."

