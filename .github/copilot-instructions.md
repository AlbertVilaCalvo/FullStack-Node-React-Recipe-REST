# Recipe Manager

Recipe Manager is a web application that allows users to manage cooking recipes. Users can read, create, update and delete recipes.

This is a project I'm building to learn technologies like Node.js, AWS, Terraform, Kubernetes, EKS, Docker, databases, system design, software architecture, microservices, Domain-Driven Design, CI/CD, GitHub Actions, GitOps, observability, REST API design etc.

## Project Overview & Architecture

Recipe Manager is a full-stack web application built using React on the client and Node.js on the server, with a PostgreSQL database. The application is deployed on AWS, with infrastructure managed using Terraform. Deployment of the website is done with GitHub Actions. The application is deployed to two different environments: dev and prod. Local development is done using Docker and Docker Compose.

The project structure is:

- `/server`: A Node.js (Express) REST API backend.
- `/web`: A React single-page application frontend.
  - `/web/src/ui`: React components and pages.
- `/terraform`: Terraform code for AWS infrastructure.
  - `/terraform/web`: Infrastructure for the frontend.
  - `/terraform/server`: Infrastructure for the Node.js API.
- `/scripts`: Scripts for seeding the database, deploying the AWS infrastructure, etc.
- `.github/workflows`: GitHub Actions workflows for CI/CD.

The server follows a three-layer architecture for organizing business logic:

1. Controllers (`/server/src/**/*Controller.ts`): Handle HTTP requests and responses. They are responsible for input validation and calling services.
2. Services (`/server/src/**/*Service.ts`): Contain the core application logic and orchestrate operations.
3. Database (`/server/src/**/*Database.ts`): Encapsulate all direct database interactions using the `pg` library.

## Coding Standards & Conventions

- TypeScript: The entire codebase is written in TypeScript. Avoid JavaScript.
- Code Style: Prettier is used for formatting. Adhere to its conventions (single quotes, no semicolons, 2-space indentation and trailing commas).
- Asynchronous Code: Prefer `async/await` for asynchronous operations.

## Server Patterns

- Follow RESTful API design principles.
- Error Handling: The server endpoints return a custom `ApiError` class (`/server/src/misc/ApiError.ts`) for expected errors (e.g., "not found", "invalid input").
- Result: Database functions return a result discriminated union (see `/server/src/misc/result.ts`).
- Use Jest for unit tests.
- Use Supertest for integration tests.

## Server Infrastructure

- EKS cluster for server deployment.
- RDS PostgreSQL database.
- ECR for Docker image storage.
- Secrets Manager for application secrets (RDS master password, JWT secret).
- EKS Kubernetes cluster includes:
  - Ingress with AWS Load Balancer Controller.
  - Managed Node Group that runs CoreDNS, Load Balancer Controller, Karpenter controller etc.
  - Karpenter for automatic provisioning of nodes based on workload. App pods run on Karpenter provisioned nodes.
  - Pod Identity for authentication.
  - Kustomize for managing Kubernetes manifests.

## Frontend Patterns

- State Management: Global state is managed with Valtio.
- API Communication: All HTTP requests to the backend are centralized in API modules (e.g., `/web/src/recipe/RecipeApi.ts`) which use a shared `httpClient.ts`.
- UI Components: The UI is built using Chakra UI. When creating new components, use Chakra components whenever possible.
- Navigation: React Router is used for client-side routing. Define routes in `/web/src/App.tsx` and use the `useNavigate` hook for navigation within components.

## Frontend Infrastructure

- React frontend is deployed to CloudFront, using a private S3 bucket as the origin.
- Deployment is done automatically using GitHub Actions (see `.github/workflows/web.yml`).

## Terraform

- Infrastructure as Code: All AWS infrastructure is defined using Terraform in the `/terraform` directory.
- Variables: Define input variables in `variables.tf` and outputs in `outputs.tf`.
- Organization: Group resources by AWS service (e.g., `s3.tf`, `rds.tf`, `eks.tf` or `cloudfront.tf`).
- Tagging: All resources should include the default tags `Application` and `Environment`.
- Follow Google Cloud's best practices for Terraform: https://cloud.google.com/docs/terraform/best-practices/root-modules. In particular, ensure that:
  - Don't include more than 100 resources in a single state.
  - Use separate directories for each service.
  - Split the Terraform configuration for a service into two top-level directories: a `modules` directory that contains the actual configuration for the service, and an `environments` directory that contains the root configurations for each environment.
    - Each module in the `modules` directory must contain a `required-providers.tf` file that defines the minimum required provider versions in a `required_providers` block. Avoid having a file named `main.tf` in each module, use descriptive names like `s3.tf`, `vpc.tf` or `rds.tf` instead.
    - Each `environment` directory must contain a `main.tf` file that instantiates the service modules, a `providers.tf` file that defines the provider configuration and versions, and a `backend.tf` file that defines the backend configuration.
- When defining IAM policies, prefer `jsonencode` over heredoc syntax for the `policy` and `assume_role_policy` arguments.
- When defining security groups, use `aws_vpc_security_group_egress_rule` and `aws_vpc_security_group_ingress_rule`, not the `aws_security_group_rule` resource nor the `ingress` and `egress` arguments.
- When dealing with sensitive values like passwords or database credentials, use `ephemeral` resources write-only arguments.

## Docker

- Do not use the `latest` tags for Docker images. Always specify a specific version.
