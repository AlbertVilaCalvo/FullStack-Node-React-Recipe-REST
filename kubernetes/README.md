# Kubernetes Manifests

Kustomize manifests for deploying the Recipe Manager server to EKS.

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

## Deploy a new image tag

To deploy a new image tag, update the image reference in the overlay's `kustomization.yaml`:

```shell
cd kubernetes/server/overlays/dev
kustomize edit set image recipe-manager-api-server=<YOUR_ECR_REGISTRY_URL>:<TAG>
```

This adds or modifies the following to `kubernetes/server/overlays/dev/kustomization.yaml`:

```yaml
images:
  - name: recipe-manager-api-server
    newName: 123456789012.dkr.ecr.us-east-1.amazonaws.com/recipe-manager-server-dev
    newTag: abc1234
```

## Sync Kubernetes manifests with Terraform configuration

To keep the Kubernetes manifests in sync with the current infrastructure configuration in your `terraform.tfvars` files, you can run the script `scripts/server/sync-k8s-with-tfvars.sh`. Whenever you change values in your `terraform.tfvars` files (like API endpoints or database configuration), run this script to update the Kubernetes manifests (like `ingress_patch.yaml`, `configmap_patch.yaml` or `secret-store.yaml`) with the new values:

```shell
./scripts/server/sync-k8s-with-tfvars.sh dev  # Or prod
```
