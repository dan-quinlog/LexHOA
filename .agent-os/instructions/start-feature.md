---
description: Rules to start feature development with proper git branch management
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Start Feature Development Rules

## Overview

Create feature branch, set up development environment, and begin task execution with proper git workflow.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="analyze_feature_scope">

### Step 1: Analyze Feature Scope

Determine if this is a single feature or multi-feature epic to choose appropriate branch naming strategy.

<scope_analysis>
  <single_feature>
    - One task from roadmap
    - Isolated functionality
    - Can be completed independently
    - Branch: feature/[task-name]
  </single_feature>
  <multi_feature_epic>
    - Multiple related tasks
    - Interdependent functionality  
    - Spans multiple sub-tasks
    - Branch: feature/[epic-name]
  </multi_feature_epic>
</scope_analysis>

<instructions>
  ACTION: Analyze the tasks to be implemented
  DETERMINE: Single feature or multi-feature scope
  CHOOSE: Appropriate branch naming strategy
  PREPARE: Branch name using kebab-case format
</instructions>

</step>

<step number="2" name="setup_base_branches">

### Step 2: Setup Base Branches

Ensure proper branch structure exists with main, staging, and dev branches.

<branch_setup>
  <check_existing>
    git branch -r
    IF main exists: ✓
    IF staging missing: CREATE from main
    IF dev missing: CREATE from main
  </check_existing>
  <create_missing>
    git checkout main
    git checkout -b staging
    git checkout -b dev
    git push -u origin staging
    git push -u origin dev
  </create_missing>
</branch_setup>

<instructions>
  ACTION: Check if base branches exist (main, staging, dev)
  CREATE: Missing base branches from main
  PUSH: New branches to remote origin
  ENSURE: Proper branch structure is established
</instructions>

</step>

<step number="3" name="create_feature_branch">

### Step 3: Create Feature Branch

Create feature branch from latest dev with appropriate naming convention.

<branch_creation>
  <prepare_base>
    git checkout dev
    git pull origin dev
  </prepare_base>
  <create_feature>
    git checkout -b feature/[FEATURE_NAME]
    git push -u origin feature/[FEATURE_NAME]
  </create_feature>
  <naming_examples>
    - feature/bulletin-board
    - feature/user-authentication
    - feature/resident-portal
    - feature/payment-processing
  </naming_examples>
</branch_creation>

<instructions>
  ACTION: Switch to dev branch and pull latest changes
  CREATE: Feature branch with descriptive name
  PUSH: Feature branch to remote with upstream tracking
  CONFIRM: Ready for feature development
</instructions>

</step>

<step number="4" name="setup_development_environment">

### Step 4: Setup Development Environment  

Prepare development environment and verify all dependencies are ready.

<environment_setup>
  <verify_dependencies>
    - Check Node.js version matches tech-stack.md
    - Verify npm/yarn package manager
    - Ensure git configuration is set
  </verify_dependencies>
  <project_initialization>
    IF new project:
      - Run npm init or create React app
      - Install base dependencies
      - Setup initial project structure
    ELSE:
      - Run npm install
      - Verify existing setup
  </project_initialization>
</environment_setup>

<instructions>
  ACTION: Verify development environment requirements  
  INSTALL: Required dependencies and tools
  INITIALIZE: Project structure if needed
  CONFIRM: Ready to begin feature development
</instructions>

</step>

<step number="5" name="begin_feature_development">

### Step 5: Begin Feature Development

Start feature development following AgentOS task execution workflow.

<development_start>
  <task_selection>
    REFERENCE: @.agent-os/product/roadmap.md
    IDENTIFY: Specific tasks for this feature
    PRIORITIZE: Tasks in dependency order
  </task_selection>
  <execution_workflow>
    EXECUTE: @.agent-os/instructions/execute-task.md
    FOLLOW: TDD methodology
    COMMIT: Regularly with descriptive messages
  </execution_workflow>
</development_start>

<commit_message_format>
  feat: add bulletin board infinite scroll
  fix: resolve authentication token refresh
  test: add unit tests for user profile
  docs: update API documentation
  style: format code with prettier
  refactor: extract reusable form components
</commit_message_format>

<instructions>
  ACTION: Reference roadmap for feature tasks
  EXECUTE: Standard AgentOS task execution workflow
  COMMIT: Changes regularly with conventional commit format
  TEST: Ensure all tests pass before each commit
</instructions>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
