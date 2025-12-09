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

# 7. Outputs (что получим после создания)
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