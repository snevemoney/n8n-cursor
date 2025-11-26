# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Rejected | Deprecated | Superseded]

## Context
[Describe the context and problem statement, e.g., in free form using two to three sentences. You may want to articulate the problem in form of a question.]

## Decision
[Describe the change that we're proposing or have agreed to implement.]

## Consequences
[Describe the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future.]

## Alternatives Considered
[List the alternatives that were considered, and explain why they were not chosen.]

## Implementation Notes
[Any notes about how this decision will be implemented, including timeline, resources, and dependencies.]

## References
[Links to relevant documentation, research, or discussions that informed this decision.]

---

## Template Usage

### When to Create an ADR
- **Architecture decisions** that affect multiple components
- **Technology choices** that impact the entire system
- **Design patterns** that will be used across the project
- **Infrastructure decisions** that affect deployment or scaling
- **Security decisions** that impact the entire system

### ADR Lifecycle
1. **Proposed**: Initial draft, under review
2. **Accepted**: Decision approved and will be implemented
3. **Rejected**: Decision not approved, alternative chosen
4. **Deprecated**: Decision is no longer recommended
5. **Superseded**: Decision replaced by a newer ADR

### Examples

#### ADR-001: Choosing Supabase over PostgreSQL
**Context**: We need a database solution for LightningFlow AI that supports real-time features, authentication, and scalable storage.

**Decision**: Use Supabase as our primary database solution.

**Consequences**: 
- Positive: Built-in authentication, real-time subscriptions, automatic API generation
- Negative: Vendor lock-in, potential cost increases at scale
- Neutral: Learning curve for team members

#### ADR-002: Using Docker Compose for Local Development
**Context**: We need a consistent development environment that matches production.

**Decision**: Use Docker Compose for all local development and testing.

**Consequences**:
- Positive: Consistent environments, easy onboarding, production parity
- Negative: Increased resource usage, slower startup times
- Neutral: Team needs to learn Docker basics

### Best Practices
- **Keep it simple**: Focus on the decision and its impact
- **Be specific**: Include concrete details about the decision
- **Consider alternatives**: Always list what was considered and why it wasn't chosen
- **Update status**: Keep the status current as decisions evolve
- **Link related ADRs**: Reference other ADRs that are related or superseded
