# Kubernetes Manifests

Kustomize manifests for deploying the Recipe Manager server to EKS and Argo CD Application manifests for GitOps sync.

## GitOps layout

- `kubernetes/server`: Kustomize base and overlays for the server workload.
- `kubernetes/argocd-apps`: Argo CD Application manifests. Terraform installs Argo CD and bootstraps the root Application, then Argo CD syncs the environment directory in this tree.

Phase 1 uses Argo CD to deploy the server application only. The default deployment flow is:

1. Push server changes to GitHub.
2. GitHub Actions builds and pushes the Docker image.
3. GitHub Actions updates the image tag in `kubernetes/server/overlays/<environment>/kustomization.yaml`.
4. Argo CD detects the Git change and syncs the server overlay.

## Render manifests locally

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

## Render Argo CD applications locally

Use `kubectl kustomize` to inspect the Argo CD Application manifests that the root Application syncs.

```shell
# Render the dev Argo CD applications
kubectl kustomize kubernetes/argocd-apps/dev

# Render the prod Argo CD applications
kubectl kustomize kubernetes/argocd-apps/prod
```

## Sync Kubernetes manifests with Terraform configuration

To keep the Kubernetes manifests in sync with the current infrastructure configuration in your `terraform.tfvars` files, you can run the script `scripts/server/sync-k8s-with-tfvars.sh`. Whenever you change values in your `terraform.tfvars` files (like API endpoints or database configuration), run this script to update the Kubernetes manifests (like `ingress_patch.yaml`, `configmap_patch.yaml` or `secret-store.yaml`) with the new values:

```shell
./scripts/server/sync-k8s-with-tfvars.sh dev  # Or prod
```
