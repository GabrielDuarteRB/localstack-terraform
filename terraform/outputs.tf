output "nome_tabela" {
  value = aws_dynamodb_table.livros.name
}

output "nome_bucket" {
  value = aws_s3_bucket.arquivos.bucket
}

output "id_instancia" {
  value = aws_instance.api.id
}