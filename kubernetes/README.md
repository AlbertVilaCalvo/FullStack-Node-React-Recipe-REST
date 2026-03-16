# Kubernetes Manifests

Kustomize manifests for deploying the Recipe Manager server to EKS.

## Rendering Manifests Locally

Use `kubectl kustomize` to render the final output of an overlay without applying it.

```shell
# Render the dev overlay
kubectl kustomize kubernetes/server/overlays/dev

# Render the prod overlay
kubectl kustomize kubernetes/server/overlays/prod
```

You can save the rendered output to a file.

```shell
kubectl kustomize kubernetes/server/overlays/dev > dev-manifest.yaml
```

The rendered output still contains placeholder strings (e.g. `REPLACE_WITH_ECR_IMAGE_URL`).
These are substituted at deploy time by `scripts/server/deploy-server-eks.sh` using `sed`.

To see what the final manifests look like with real values substituted, you can pipe the output
through `sed` manually:

```shell
kubectl kustomize kubernetes/server/overlays/dev | sed \
  -e 's|REPLACE_WITH_ECR_IMAGE_URL|123456789.dkr.ecr.us-east-1.amazonaws.com/recipe-manager-api:abc1234|g' \
  -e 's|REPLACE_WITH_RDS_ADDRESS|db.xxxx.us-east-1.rds.amazonaws.com|g' \
  -e 's|REPLACE_WITH_RDS_DATABASE_NAME|recipe_manager|g' \
  -e 's|REPLACE_WITH_RDS_USERNAME|postgres|g' \
  -e 's|REPLACE_WITH_CORS_ORIGINS|https://recipemanager.link|g' \
  -e 's|REPLACE_WITH_AWS_REGION|us-east-1|g'
```
