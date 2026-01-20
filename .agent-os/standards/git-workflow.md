# Git Workflow Standards

## Branch Strategy

### Branch Types
- **main**: Production-ready code
- **staging**: Pre-production testing environment
- **dev**: Development integration branch
- **feature/***: Individual feature development branches

### Branch Naming Convention
- `feature/[feature-name]` - Single feature (e.g., `feature/bulletin-board`)
- `feature/[epic-name]` - Multiple related features (e.g., `feature/resident-portal`)
- `bugfix/[bug-name]` - Bug fixes
- `hotfix/[critical-fix]` - Production hotfixes

### Development Flow
1. **Feature Development**: `feature/* → dev`
2. **Testing**: `dev → staging` 
3. **Production**: `staging → main`
4. **Emergency**: `hotfix/* → main` (then merge back to dev)

## Automated Branch Management

### Feature Branch Creation
When starting feature development:
1. Create branch from latest `dev`
2. Name using feature/task name from roadmap
3. Set up branch protection and testing requirements

### Merge Requirements
- **feature/* → dev**: Requires all tests passing
- **dev → staging**: Requires code review + all tests passing
- **staging → main**: Requires QA approval + all tests passing

### Branch Cleanup
- Delete feature branches after successful merge to dev
- Keep dev, staging, main as permanent branches
- Archive old feature branches after 30 days

## Integration with AgentOS

### Task Execution Branch Management
When executing tasks, AI should:
1. Check current branch and create feature branch if needed
2. Name branch based on task being implemented
3. Commit regularly with descriptive messages
4. Create PR when task is complete

### Multi-Feature Branch Strategy
For related tasks/features:
- Group under single feature branch (e.g., `feature/auth-system`)
- Use sub-commits for individual tasks
- Merge only when entire feature group is complete

### Testing Gates
- Unit tests must pass before any commit
- Integration tests must pass before merge to dev
- E2E tests must pass before merge to staging
