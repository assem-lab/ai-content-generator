# AI Content Generator - ИНФРАСТРУКТУРА ГОТОВА

## 🚀 Живые ссылки
- **Frontend**: https://storage.googleapis.com/ai-content-generator-478607-content-gen-frontend/index.html
- **API Endpoint**: https://content-generator-gateway-9xzc6s0.uc.gateway.dev/generate
- **Cloud Function**: https://generate-content-dy7entf6xa-uc.a.run.app

## 📦 Созданные ресурсы в GCP
1. **Cloud Function** `generate-content` (Python 3.12, Gen2)
2. **API Gateway** с публичным доступом
3. **Cloud Storage** для фронтенда и кода функций
4. **Secret Manager** для Gemini API ключа
5. **Firestore Database** (Native mode)
6. **Service Account** с нужными правами

## 👥 Инструкция для команды

### Dev2 (Backend):
- API ключ Gemini добавляй в Secret Manager
- Новые версии кода функций заливай в бакет: `ai-content-generator-478607-content-gen-functions`
- Используй Service Account для доступа

### Dev3 (Frontend):
- Собирай статику в `frontend/dist/`
- Заливай в бакет: `ai-content-generator-478607-content-gen-frontend`
- API для фронтенда: `https://content-generator-gateway-9xzc6s0.uc.gateway.dev/generate`

## 🏗️ Terraform команды
```bash
cd infrastructure
terraform init
terraform apply