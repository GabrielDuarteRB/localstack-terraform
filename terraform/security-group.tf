data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "api" {
  name        = "${local.prefixo}-sg"
  description = "Permitir SSH na Api"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["127.0.0.1/32"]
  }

  ingress {
    description = "API de livros"
    protocol    = "tcp"
    from_port   = var.api_port
    to_port     = var.api_port
    cidr_blocks = ["127.0.0.1/32"]
  }
}