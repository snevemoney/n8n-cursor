# Scorpion Council Architecture

## Architectural Organization (Designed by Architectus)

The council is organized into 6 architectural layers, ensuring that foundational concerns are addressed before implementation details.

### Layer 1: Foundation (System Architecture & Design)
**Purpose**: Establish system structure, modularity, and design principles

- **Architectus** (1.5x) - System Architect & Design Lead
  - Ensures plans align with modular architecture
  - Validates system boundaries and service separation
  - Flags legacy patterns and architectural violations

- **Nexus** (1.1x) - Integration Specialist
  - Ensures proper API contracts and data flows
  - Validates integration points between modules
  - Checks Tool Contract v2 compliance

- **Simplicity Councillor** - Code Clarity
  - Ensures code simplicity and maintainability
  - Flags unnecessary complexity

- **Tool Sanity Councillor** - Tool Selection
  - Validates tool selection and usage
  - Ensures proper tool registry usage

### Layer 2: Execution (Implementation & Operations)
**Purpose**: Ensure plans are executable and operations are reliable

- **Pragmaton** (1.3x) - Execution Engineer & Workflow Lead
  - Validates execution feasibility
  - Ensures n8n workflow integration
  - Checks tool execution capabilities

- **DataOps Councillor** - Data Operations
  - Validates data pipeline design
  - Ensures data quality and operations

- **Performance Councillor** - Performance Optimization
  - Flags performance bottlenecks
  - Recommends optimization strategies

### Layer 3: Intelligence (Knowledge & Data)
**Purpose**: Optimize knowledge retrieval and data analysis

- **Analytica** (1.2x) - Knowledge & RAG Strategist Lead
  - Optimizes knowledge retrieval strategies
  - Ensures proper use of kb.search and ontology.search
  - Validates RAG quality

- **Oracle** (1.1x) - Data & Analytics Seer
  - Tracks metrics and observability
  - Provides data insights

- **Data Analytics Councillor** - Analytics Methodology
  - Validates analytical methodology
  - Ensures proper correlation vs causation
  - Reviews data visualization needs

### Layer 4: AI/ML (Models & Training)
**Purpose**: Guide AI/ML development and optimization

- **Mentor** (1.2x) - LLM Training & Evaluation Master Lead
  - Guides training strategies
  - Validates model selection
  - Ensures proper evaluation metrics

- **AI Foundations Councillor** - AI Best Practices
  - Validates AI foundations
  - Ensures best practices

- **Generative Models Councillor** - Model Architecture
  - Validates generative model usage
  - Ensures proper model architecture

- **Prompt Quality Councillor** - Prompt Engineering
  - Validates prompt quality
  - Ensures proper prompt structure

### Layer 5: Safety (Security, Ethics, Alignment)
**Purpose**: Ensure security, ethics, and alignment

- **Satori** (1.0x) - Alignment & Safety Lead
  - Ensures user intent alignment
  - Validates privacy and business rules
  - Checks human impact

- **Sentinel** (1.2x) - Security & Performance Guardian
  - Monitors security threats
  - Flags performance issues
  - Protects system integrity

- **Security Councillor** - Security Analysis
  - Provides detailed security analysis
  - Validates security measures

- **Ethics Councillor** - Ethics & Bias Detection
  - Detects high-risk domains
  - Flags ethical concerns

- **Bias Detection Councillor** - Bias Mitigation
  - Detects demographic, cultural, and confirmation bias
  - Recommends bias mitigation strategies

- **Human Context Councillor** - Human Sensitivity
  - Ensures human context awareness
  - Validates relationship considerations

### Layer 6: Innovation (Future & Optimization)
**Purpose**: Identify innovation opportunities

- **Catalyst** (0.9x) - Innovation Advisor
  - Identifies innovation opportunities
  - Balances innovation with complexity
  - Evaluates ROI

## Execution Flow

1. **Foundation Layer** runs first - establishes architectural foundation
2. **Execution Layer** validates implementation feasibility
3. **Intelligence Layer** optimizes knowledge and data strategies
4. **AI/ML Layer** guides model development
5. **Safety Layer** ensures security and ethics
6. **Innovation Layer** identifies future opportunities

## Weight Distribution

- **Highest Weight**: Architectus (1.5x) - System architecture is foundational
- **High Weight**: Pragmaton (1.3x), Analytica (1.2x), Sentinel (1.2x), Mentor (1.2x) - Critical execution and intelligence
- **Medium Weight**: Nexus (1.1x), Oracle (1.1x) - Important but supporting roles
- **Base Weight**: Satori (1.0x) - Alignment and safety baseline
- **Lower Weight**: Catalyst (0.9x) - Innovation is valuable but not critical

## Benefits of This Structure

1. **Architectural Clarity**: Foundation concerns addressed first
2. **Logical Flow**: Each layer builds on the previous
3. **Clear Responsibilities**: Each member has a defined role
4. **No Duplication**: Functional councils complement custom councils
5. **Scalable**: Easy to add new members to appropriate layers

