variable "environment" {
  description = "Ambiente"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "hom"], var.environment)
    error_message = "O ambiente deve ser dev ou hom."
  }
}

variable "api_port" {
  description = "Porta TCP da API"
  type        = number
  default     = 3000
}