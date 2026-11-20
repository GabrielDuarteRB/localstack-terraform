resource "aws_s3_bucket" "arquivos" {
  bucket = "${local.prefixo}-arquivos"
}

resource "aws_s3_bucket_versioning" "arquivos" {
  bucket = aws_s3_bucket.arquivos.id

  versioning_configuration {
    status = "Enabled"
  }
}