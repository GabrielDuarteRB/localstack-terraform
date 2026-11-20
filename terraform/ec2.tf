resource "aws_instance" "api" {
  ami                    = "ami-03c3da4cfa8e8943a"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.api.id]

  tags = {
    Name = "${local.prefixo}-ec2"
  }
}