---
sidebar_position: 2
sidebar_label: Processes
---

# Processes

In this document, you will find everything about how we work, the process we follow and the guidelines.

## Git and Github

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
3. A conversation is ideally initiated by person A (the reviewer) and addressed by person B (usually the PR author). Once the comment is addressed, person B re-requests a review from person A. Person A then reviews, closes the conversation, and approves the PR. If the PR is already approved and the comment is not blocking, the conversation can be resolved by the person who opened the PR. However, this should only be a guideline and good sense always applies. There are cases where, even if the PR is not approved, it just makes sense to resolve it, especially if the conversation is about a small fix that has already been addressed. This approach prevents the process from becoming too time-consuming for everyone.
4. Once approved, the pull request can be merged by the PR author or any other developer

### Merging Guidelines

1. Pull requests should be merged using the "Squash and merge" strategy to keep the history clean.

## Build API documentation

Currently we have two possible ways of documenting our APIs:
1. OpenAPI definition files, that are technical documents which can be used to generate sdks and to be parsed and served as HTML content
2. Markdown files, used to be shared, directly of after being printed as PDFs, with the consumers

### 1. OpenAPI definition files
Registering the `fastify-swagger` as in [docs](https://github.com/fastify/fastify-swagger) it generates an `openapi-definition.yaml` file into the root folder of the Fastify service.

After that, using the [Fastify Swagger UI](https://github.com/fastify/fastify-swagger-ui) package, we can serve them using the Swagger UI.

### 2. Markdown files
The best way we've found to generate them is using [Claude AI](https://claude.ai/).

To do that we can upload an already generated document in the format we would like to obtain, as the [messaging API one](../../apps/messaging-api/docs/messaging-docs.md) and your OpenAPI definition file, e.g. [messaging API definition](../../apps/messaging-api/openapi-definition.yml).

Using the following prompt it should generate the expected document:
```
Please write documentation for the endpoints described in the open-api-definition.yaml file in markdown format. The style of the documentation must be the same as in the messaging-docs.md file. To write the comments next to the fields, you can use the description property.
```

We suggest to just upload an excerpt of the `messaging-docs.md` file and to split the `paths` part of the definition file in multiple parts before providing it to Claude because the context length, for the free version, is limited.

After the generation, you can store it to the `apps/{your-service-name}/ folder` to be able to version it.

*Please Note*: if you want to share it as PDF, during the PDF generation, please check if the pages are splitted as you expect. To add specific page breaks you can add `<div style="page-break-after: always;"></div>` in the markdown file.

# How to propose a process change

In order to propose a change to one of the above processes and guidelines, you can just create a new branch, write down your proposal and create a PR.
The discussion will happen in the PR and as soon as it has been reviewew by all the necessary people and merged, then the new process will be considered accepted and enforced (if applicable)
