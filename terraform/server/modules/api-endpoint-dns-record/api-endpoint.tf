# Data source to retrieve the ALB created by the Kubernetes Ingress
# The ALB is created dynamically by Kubernetes Ingress resources, not by Terraform.
# We need to use a data source to fetch the load balancer information after it's created.
data "aws_lb" "api" {
  name = var.load_balancer_name
}

data "aws_route53_zone" "api_endpoint" {
  # Get the root domain from the full API endpoint domain (api.recipemanager.link -> recipemanager.link)
  name         = join(".", slice(split(".", var.api_endpoint), length(split(".", var.api_endpoint)) - 2, length(split(".", var.api_endpoint))))
  private_zone = false
}

# Route 53 A record for API subdomain (e.g., api.recipemanager.link)
# This points the API domain to the ALB created by the Kubernetes Ingress
resource "aws_route53_record" "api_endpoint" {
  zone_id = data.aws_route53_zone.api_endpoint.zone_id
  name    = var.api_endpoint
  type    = "A"

  alias {
    name                   = data.aws_lb.api.dns_name
    zone_id                = data.aws_lb.api.zone_id
    evaluate_target_health = true
  }
}
