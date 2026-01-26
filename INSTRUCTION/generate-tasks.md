# Rule: Generating a Task List for New Product Development

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format for building a new product from the ground up. The task list should guide a developer through all phases of product development, from project initialization through deployment and maintenance.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[feature-name].md` (e.g., `tasks-user-profile-editing.md`)

## Process

1. **Receive Product Requirements:** The user provides a product vision, core features, technical requirements, or points to existing documentation
2. **Analyze Requirements:** The AI analyzes the functional requirements, user needs, target scope, and technical architecture from the provided information
3. **Phase 1: Generate Parent Tasks:** Based on the requirements analysis, create the file and generate the main, high-level phases required to build the complete product. **IMPORTANT: Always include task 0.0 "Initialize Project Repository" as the first task.** High-level tasks typically include: Project Setup, Core Architecture, Feature Development, Testing & QA, Documentation, and Deployment. Present these tasks to the user in the specified format (without sub-tasks yet). Inform the user: "I have generated the high-level phases based on your product requirements. Ready to generate the detailed sub-tasks? Respond with 'Go' to proceed."
4. **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
5. **Phase 2: Generate Sub-Tasks:** Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete that phase. Ensure sub-tasks logically flow from the parent task and cover all implementation details, testing, and documentation implied by the product requirements.
6. **Identify Relevant Files:** Based on the tasks and requirements, identify all potential files that will need to be created, including source code, configuration files, test files, documentation, and deployment scripts.
7. **Generate Final Output:** Combine the parent tasks, sub-tasks, relevant files, and implementation notes into the final Markdown structure.
8. **Save Task List:** Save the generated document in the `/tasks/` directory with the filename `tasks-[product-name].md`, where `[product-name]` describes the product being built (e.g., `tasks-expense-tracker.md` or `tasks-chrome-extension.md`).

## Output Format

The generated task list _must_ follow this structure:

```markdown
## Relevant Files

- `path/to/potential/file1.ts` - Brief description of why this file is relevant (e.g., Contains the main component for this feature).
- `path/to/file1.test.ts` - Unit tests for `file1.ts`.
- `path/to/another/file.tsx` - Brief description (e.g., API route handler for data submission).
- `path/to/another/file.test.tsx` - Unit tests for `another/file.tsx`.
- `lib/utils/helpers.ts` - Brief description (e.g., Utility functions needed for calculations).
- `lib/utils/helpers.test.ts` - Unit tests for `helpers.ts`.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Initialize Project Repository
  - [ ] 0.1 Create project directory and initialize version control
  - [ ] 0.2 Set up initial project configuration and dependencies
- [ ] 1.0 Project Setup & Configuration
  - [ ] 1.1 [Sub-task description 1.1]
  - [ ] 1.2 [Sub-task description 1.2]
- [ ] 2.0 Core Architecture & Foundation
  - [ ] 2.1 [Sub-task description 2.1]
  - [ ] 2.2 [Sub-task description 2.2]
- [ ] 3.0 Feature Development - Phase 1
  - [ ] 3.1 [Sub-task description 3.1]
  - [ ] 3.2 [Sub-task description 3.2]
- [ ] 4.0 Testing & Quality Assurance
  - [ ] 4.1 [Sub-task description 4.1]
  - [ ] 4.2 [Sub-task description 4.2]
- [ ] 5.0 Documentation & User Guides
  - [ ] 5.1 [Sub-task description 5.1]
- [ ] 6.0 Deployment & Release
  - [ ] 6.1 [Sub-task description 6.1]
  - [ ] 6.2 [Sub-task description 6.2]
```

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate the detailed sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

