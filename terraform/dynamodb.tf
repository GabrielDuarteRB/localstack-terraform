resource "aws_dynamodb_table" "livros" {
  name         = "${local.prefixo}-tabela"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}