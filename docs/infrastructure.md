# Illustrative Cloud Target Architecture (Non-Executed)

This document is architectural documentation only. It is **not** a working
Terraform configuration, it is not wired into any CI job, and it must never be
applied:

- Do not run `terraform init`, `terraform plan`, or `terraform apply` against
  these snippets.
- No `.tf` files exist in this repository, intentionally, to avoid any
  accidental provisioning.
- CloudPath itself never provisions real cloud infrastructure — it only
  recommends a modernization strategy.

The snippets below sketch what a `REPLATFORM` target on AWS could eventually
look like, purely to communicate intent for the bootcamp material.

## Example target: containerized platform (illustrative only)

```hcl
# Illustrative only — do not apply.
resource "aws_ecr_repository" "cloudpath_backend" {
  name = "cloudpath-backend"
}

resource "aws_ecs_cluster" "cloudpath" {
  name = "cloudpath-cluster"
}

resource "aws_ecs_service" "backend" {
  name            = "cloudpath-backend"
  cluster         = aws_ecs_cluster.cloudpath.id
  launch_type     = "FARGATE"
  desired_count   = 1
}

resource "aws_lb" "cloudpath" {
  name               = "cloudpath-alb"
  load_balancer_type = "application"
}
```

## Mapping to CloudPath's own recommendation engine

If CloudPath assessed an application in this illustrative target state
(containerized, externalized state/secrets, CI/CD, IaC, observability, and
horizontal scaling all `true`), it would score in the `HIGH` or
`CLOUD READY` range and typically recommend `REPLATFORM` or no further action.

This file exists purely to document that mapping — it is not required for
running the application locally and has no effect on `npm test`, `npm start`,
or Docker builds.
