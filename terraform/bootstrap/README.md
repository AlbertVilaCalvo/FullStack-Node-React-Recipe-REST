# Bootstrap Terraform State Buckets

This directory contains the Terraform configuration to bootstrap the S3 buckets used for storing Terraform state for the Recipe Manager project.

## Usage

Use the provided script to create the state bucket for your environment and automatically generate the `backend.config` files for the server and web Terraform projects.

For the Development environment:

```bash
./scripts/bootstrap/create-state-bucket.sh dev
```

For the Production environment:

```bash
./scripts/bootstrap/create-state-bucket.sh prod
```

This will:

1. Initialize and apply the bootstrap Terraform configuration.
2. Create the S3 bucket with a unique name.
3. Generate a `backend.config` file in:
   - `terraform/server/environments/<env>/backend.config`
   - `terraform/web/environments/<env>/backend.config`

The `backend.config` file contains the bucket name and AWS region, allowing subsequent Terraform commands in those directories to initialize the backend correctly.

When running `terraform init`, make sure to specify the generated `backend.config` file:

```bash
terraform init -backend-config="backend.config"
```
