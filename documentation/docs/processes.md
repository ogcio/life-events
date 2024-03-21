---
sidebar_position: 2
sidebar_label: Processes
---

# Processes

In this document, you will find everything about how we work, the process we follow and the guidelines.

## Git and Github

Here's a draft for your software development project's Git and GitHub processes documentation in Markdown format. This template includes sections for branching, commit messages, and review processes. Feel free to customize it according to your project's specific guidelines and practices.

### Project Git and GitHub Processes

This document outlines the Git and GitHub processes we follow to maintain an efficient, transparent, and streamlined workflow in our software development project. Please adhere to these guidelines for branching, committing, and conducting reviews.

### Branching Strategy

##### Naming Conventions

We don't enforce yet any naming convention on the branch name.
In case you're struggling finding a name for your branch you can use this approach:

- **Feature Branches**: `feature/<feature-name>`
- **Bugfix Branches**: `bugfix/<bug-name>`

Also, since we're working on multiple packages on this monorepo, you may want to include the package name like this: `payments/feature/<feature-name>`
Again, there is no enforcement yet on hte branch name, this is just a suggestion.

##### Guidelines

1. **Main Branch**: The `dev` branch is our primary branch. All feature, bugfix, and release branches should eventually be merged back into `dev`.
2. **Branches**: For every new feature/bugfix, create a new branch from `dev` using the naming convention specified above.

### Commit Messages

We don't have yet enforcements on the commit messages.
That being said, commit messages should be clear, concise, and descriptive of the changes made. You can follow this [structure](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- **Type**: feat, fix, docs, style, refactor, test, chore.
- **Scope**: Optional, the part of the code affected.
- **Summary**: A brief description of the change.
- **Body**: Optional, a more detailed description.
- **Footer**: Optional, referencing issues fixed by the commit.

Example:

```
feat(login): implement JWT authentication

This commit introduces JWT authentication to improve the login process. It includes updates to the login controller and new tests.

Fixes #123, Related to #456
```

Currently, this is not validated with precommit hooks, you can use the commit message you feel better fits your current commit.

### Pull Requests and Reviews

#### Creating Pull Requests

1. Before creating a pull request, ensure your branch is up to date with `dev`.
2. Create a pull request with a clear title and description. If applicable, you should stick to the PR template.
3. Assign the pull request to yourself and tag relevant reviewers.

#### Review Process

1. Reviewers should provide constructive feedback and approve changes only when they meet project standards.
2. Address feedback and make necessary adjustments. Re-request reviews if needed.
3. Once approved, the pull request can be merged by the PR author or any other developer

### Merging Guidelines

1. Pull requests should be merged using the "Squash and merge" strategy to keep the history clean.

# How to propose a process change

In order to propose a change to one of the above processes and guidelines, you can just create a new branch, write down your proposal and create a PR.
The discussion will happen in the PR and as soon as it has been reviewew by all the necessary people and merged, then the new process will be considered accepted and enforced (if applicable)
