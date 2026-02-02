# API Endpoint DNS Record module variables

variable "api_endpoint" {
  description = "The API endpoint domain name (e.g., api.recipemanager.link)"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", var.api_endpoint))
    error_message = "The API endpoint must be a valid domain name."
  }
}

variable "route53_zone_id" {
  description = "The Route53 hosted zone ID for the DNS record"
  type        = string
}

variable "load_balancer_name" {
  description = "The name of the load balancer created by the Kubernetes Ingress"
  type        = string
}
