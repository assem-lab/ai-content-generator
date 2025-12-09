# Variables 
variable "gcp_project_id" {
  description = "ID вашего GCP проекта"
  type        = string
}

variable "region" {
  description = "Регион для ресурсов"
  type        = string
  default     = "us-central1"
}

variable "project_name" {
  description = "Название проекта для префиксов"
  type        = string
  default     = "content-gen"
}