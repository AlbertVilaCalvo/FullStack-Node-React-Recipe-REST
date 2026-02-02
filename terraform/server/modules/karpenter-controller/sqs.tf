# SQS Queue for node termination due to spot instance interruption and other events

# https://karpenter.sh/docs/reference/cloudformation/#interruption-handling
# https://github.com/aws/karpenter-provider-aws/blob/v1.8.3/website/content/en/preview/getting-started/getting-started-with-karpenter/cloudformation.yaml

resource "aws_sqs_queue" "karpenter" {
  name                      = "${var.app_name}-karpenter-interruption-queue-${var.environment}"
  message_retention_seconds = 300
  sqs_managed_sse_enabled   = true
}

resource "aws_sqs_queue_policy" "karpenter" {
  queue_url = aws_sqs_queue.karpenter.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EC2InterruptionPolicy"
        Effect = "Allow"
        Principal = {
          Service = [
            "events.amazonaws.com",
            "sqs.amazonaws.com"
          ]
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.karpenter.arn
      },
      {
        Sid       = "DenyHTTP"
        Effect    = "Deny"
        Principal = "*"
        Action    = "sqs:*"
        Resource  = aws_sqs_queue.karpenter.arn
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

# EventBridge rules to send EC2 events to SQS
# The target_id can be different or the same (like in the CloudFormation template)

# ScheduledChangeRule

resource "aws_cloudwatch_event_rule" "scheduled_change" {
  name        = "${var.app_name}-karpenter-sqs-scheduled-change-${var.environment}"
  description = "AWS Health Event for scheduled changes"

  event_pattern = jsonencode({
    source      = ["aws.health"]
    detail-type = ["AWS Health Event"]
  })
}

resource "aws_cloudwatch_event_target" "scheduled_change" {
  rule      = aws_cloudwatch_event_rule.scheduled_change.name
  target_id = "KarpenterScheduledChange"
  arn       = aws_sqs_queue.karpenter.arn
}

# SpotInterruptionRule

resource "aws_cloudwatch_event_rule" "spot_interruption" {
  name        = "${var.app_name}-karpenter-sqs-spot-interruption-${var.environment}"
  description = "Spot Instance Interruption Warning"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Spot Instance Interruption Warning"]
  })
}

resource "aws_cloudwatch_event_target" "spot_interruption" {
  rule      = aws_cloudwatch_event_rule.spot_interruption.name
  target_id = "KarpenterSpotInterruption"
  arn       = aws_sqs_queue.karpenter.arn
}

# RebalanceRule

resource "aws_cloudwatch_event_rule" "instance_rebalance" {
  name        = "${var.app_name}-karpenter-sqs-instance-rebalance-${var.environment}"
  description = "EC2 Instance Rebalance Recommendation"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Instance Rebalance Recommendation"]
  })
}

resource "aws_cloudwatch_event_target" "instance_rebalance" {
  rule      = aws_cloudwatch_event_rule.instance_rebalance.name
  target_id = "KarpenterInstanceRebalance"
  arn       = aws_sqs_queue.karpenter.arn
}

# InstanceStateChangeRule

resource "aws_cloudwatch_event_rule" "instance_state_change" {
  name        = "${var.app_name}-karpenter-sqs-instance-state-change-${var.environment}"
  description = "EC2 Instance State-change Notification"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Instance State-change Notification"]
  })
}

resource "aws_cloudwatch_event_target" "instance_state_change" {
  rule      = aws_cloudwatch_event_rule.instance_state_change.name
  target_id = "KarpenterInstanceStateChange"
  arn       = aws_sqs_queue.karpenter.arn
}
