# Production Rollout Guide

Currently, CareSync is designed to operate seamlessly in a Development (`dev`) environment. Moving to Production (`prod`) requires standing up isolated AWS Infrastructure and securely pointing ArgoCD to that new cluster.

Follow this guide when your team is ready to launch Production.

## Step 1: Provision Production Infrastructure
You must provision a completely isolated VPC, RDS database, and EKS cluster for Production. 

1. Navigate to the `caresync-infra` repository.
2. Inside `terraform/environments/prod`, define your production `main.tf`, `variables.tf`, and `terraform.tfvars`. 
3. These should point to larger instance sizes (e.g., `db.t3.medium` for RDS, `m5.large` for EKS nodes) compared to Dev.
4. Run `terraform apply` to provision the Production EKS cluster.

## Step 2: Establish Production AWS Secrets
CareSync relies on the External Secrets Operator to pull secure variables from AWS Secrets Manager.

1. Open AWS Secrets Manager in your AWS Console.
2. Create a new secret named: `caresync/app-secrets-prod`.
3. Fill it with the identical JSON keys as your dev secret, but use the real production database credentials, strong production JWT secrets, and production third-party API keys.

## Step 3: Define Production Helm Values
We use a single "Umbrella Chart" that dynamically targets environments based on values.

1. Navigate to `caresync-gitops/helm/`.
2. Create a new file named `values-prod.yaml`.
3. In this file, define your production-specific overrides. At minimum:
   ```yaml
   namespace: caresync-prod
   environment: prod
   secrets:
     awsSecretName: caresync/app-secrets-prod
   ```

## Step 4: Register Production with ArgoCD
Once the cluster and secrets exist, you instruct ArgoCD to continuously deploy the production code.

1. Navigate to `caresync-gitops/gitops/apps/`.
2. Duplicate `caresync-dev.yaml` and rename it to `caresync-prod.yaml`.
3. Modify the new file:
   - Change `metadata.name` to `caresync-prod`.
   - Change `spec.destination.namespace` to `caresync-prod`.
   - Change `spec.source.helm.valueFiles` to include `values-prod.yaml`.
4. Commit `caresync-prod.yaml` to GitHub. ArgoCD will automatically detect it and deploy your Production environment.
