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

To deploy a new image tag, update the image reference in the overlay's `kustomization.yaml`:

```shell
cd kubernetes/server/overlays/dev
kustomize edit set image recipe-manager-api-server=<YOUR_ECR_REGISTRY_URL>:<TAG>
```

This adds the following to `kubernetes/server/overlays/dev/kustomization.yaml`:

```yaml
images:
  - name: recipe-manager-api-server
    newName: 123456789012.dkr.ecr.us-east-1.amazonaws.com/recipe-manager-server-dev
    newTag: abc1234
```

The rendered output still contains placeholder strings (e.g. `REPLACE_WITH_ECR_IMAGE_URL`).
These are substituted at deploy time by `scripts/server/deploy-server-eks.sh` using `sed`.

To see what the final manifests look like with real values substituted, you can pipe the output
through `sed` manually:

```shell
kubectl kustomize kubernetes/server/overlays/dev | sed \
  -e 's|REPLACE_WITH_RDS_ADDRESS|db.xxxx.us-east-1.rds.amazonaws.com|g'
```
