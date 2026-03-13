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

The rendered output still contains two deploy-time placeholders (`DEPLOY_TIME_RDS_ADDRESS` and
`DEPLOY_TIME_API_CERTIFICATE_ARN`) that are Terraform outputs — values that AWS generates and
that change when infrastructure is recreated. These are injected at deploy time via a temporary
Kustomize overlay written by `scripts/server/deploy-server-eks.sh`; they are never committed to
Git.

All other per-environment values (API endpoint, CORS origins, DB name, DB user, AWS region,
secret key names) are committed directly in each overlay's patch files.
