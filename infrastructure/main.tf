# Last CI/CD test: $(date)
# Main resources 

# 1. Service Account для функций
resource "google_service_account" "cloud_function_sa" {
  account_id   = "${var.project_name}-function-sa"
  display_name = "Service Account for Cloud Functions"
}

# 2. Бакет для фронтенда
resource "google_storage_bucket" "frontend_bucket" {
  name          = "${var.gcp_project_id}-${var.project_name}-frontend"
  location      = var.region
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

# 3. Секрет для API ключа Gemini (создаем пустой)
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "gemini-api-key"

  replication {
    auto {}
  }
}

# 4. Firestore Database
resource "google_firestore_database" "main" {
  project     = var.gcp_project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

# 5. Cloud Storage для исходного кода функций
resource "google_storage_bucket" "function_source" {
  name          = "${var.gcp_project_id}-${var.project_name}-functions"
  location      = var.region
  force_destroy = true
}

# 6. Назначаем роли Service Account
resource "google_project_iam_member" "sa_secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_function_sa.email}"
}

resource "google_project_iam_member" "sa_firestore_user" {
  project = var.gcp_project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_function_sa.email}"
}

# 7. Cloud Function (Gen2)
resource "google_cloudfunctions2_function" "generate_content" {
  name        = "generate-content"
  location    = var.region
  description = "Main AI content generation function"

  build_config {
    runtime     = "python312"
    entry_point = "generate_content"
    source {
      storage_source {
        bucket = google_storage_bucket.function_source.name
        object = "function-source.zip"
      }
    }
  }

  service_config {
    max_instance_count    = 5
    min_instance_count    = 0
    available_memory      = "256M"
    timeout_seconds       = 60
    service_account_email = google_service_account.cloud_function_sa.email
    environment_variables = {
      GCP_PROJECT = var.gcp_project_id
      SECRET_NAME = google_secret_manager_secret.gemini_api_key.id
    }
    ingress_settings = "ALLOW_ALL"
  }

  depends_on = [
    google_secret_manager_secret.gemini_api_key,
    google_firestore_database.main
  ]
}

# 8. Cloud Function IAM
resource "google_cloudfunctions2_function_iam_member" "invoker" {
  project        = google_cloudfunctions2_function.generate_content.project
  location       = google_cloudfunctions2_function.generate_content.location
  cloud_function = google_cloudfunctions2_function.generate_content.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}

# 9. API Gateway
resource "google_api_gateway_api" "content_api" {
  provider     = google-beta
  api_id       = "content-generator-api"
  display_name = "Content Generator API"
}

# 10. API Config - САМЫЙ ПРОСТОЙ ВАРИАНТ
resource "google_api_gateway_api_config" "api_config" {
  provider      = google-beta
  api           = google_api_gateway_api.content_api.api_id
  api_config_id = "v1-config"

  openapi_documents {
    document {
      path = "spec.yaml"
      contents = base64encode(<<EOF
swagger: "2.0"
info:
  title: "Content Generator API"
  version: "1.0.0"
paths:
  /generate:
    post:
      operationId: "generateContent"
      x-google-backend:
        address: "${google_cloudfunctions2_function.generate_content.service_config[0].uri}"
      responses:
        "200":
          description: "Success"
EOF
      )
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}
# 11. API Gateway шлюз
resource "google_api_gateway_gateway" "api_gateway" {
  provider   = google-beta
  region     = var.region
  api_config = google_api_gateway_api_config.api_config.id
  gateway_id = "content-generator-gateway"
}

# 12. Outputs
output "frontend_bucket_name" {
  value = google_storage_bucket.frontend_bucket.name
}

output "frontend_url" {
  value = "https://storage.googleapis.com/${google_storage_bucket.frontend_bucket.name}/index.html"
}

output "service_account_email" {
  value = google_service_account.cloud_function_sa.email
}

output "secret_id" {
  value = google_secret_manager_secret.gemini_api_key.id
}

output "function_source_bucket" {
  value = google_storage_bucket.function_source.name
}

output "cloud_function_uri" {
  value = google_cloudfunctions2_function.generate_content.service_config[0].uri
}

output "api_gateway_url" {
  value = "https://${google_api_gateway_gateway.api_gateway.default_hostname}"
}
# Service Account для GitHub Actions CI/CD
resource "google_service_account" "github_actions" {
  account_id   = "github-actions-sa"
  display_name = "Service Account for GitHub Actions"
}

# Минимальные необходимые роли
resource "google_project_iam_member" "github_actions_editor" {
  project = var.gcp_project_id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_service_account_key" "github_actions_key" {
  service_account_id = google_service_account.github_actions.name
}

# Output ключа (будет в terraform state)
output "github_actions_sa_key" {
  value     = base64decode(google_service_account_key.github_actions_key.private_key)
  sensitive = true
}
output "github_actions_sa_email" {
  value       = google_service_account.github_actions.email
  description = "Service Account email for GitHub Actions"
}