terraform {
  backend "gcs" {
    bucket = "ai-content-generator-tfstate"  # Уже есть у вас
    prefix = "terraform/state"
  }
}