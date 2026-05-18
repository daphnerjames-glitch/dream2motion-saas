#!/bin/bash
# Setup Google Cloud Secrets for autonomous-income-engine

PROJECT_ID="autonomous-income-engine"
SERVICE_ACCOUNT="autonomous-income-engine@autonomous-income-engine.iam.gserviceaccount.com"

echo "Creating secrets in Secret Manager..."

# Create secrets
gcloud secrets create YT_CLIENT_ID --replication-policy="automatic" --data-file=- <<< "260985892935-2edn1n84b3l23e4inck0r6k6g81vllfd.apps.googleusercontent.com" --project=$PROJECT_ID 2>/dev/null || gcloud secrets versions add YT_CLIENT_ID --data-file=- --project=$PROJECT_ID <<< "260985892935-2edn1n84b3l23e4inck0r6k6g81vllfd.apps.googleusercontent.com"

gcloud secrets create YT_CLIENT_SECRET --replication-policy="automatic" --data-file=- <<< "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" --project=$PROJECT_ID 2>/dev/null || gcloud secrets versions add YT_CLIENT_SECRET --data-file=- --project=$PROJECT_ID <<< "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"

gcloud secrets create GRANNY_YT_REFRESH --replication-policy="automatic" --data-file=- <<< "ya29.a0AQvPyIMZ7dMcdoZ21Vy0fxSErN-Pp7ucBp_-YpS3LehTBfBWO7rT-PcDzMeKzMGxI6wNKzX4Tn4Yse99BS1JFXKGjmwJzZNDOYELGPrbjciouZOlokvOqZHI8OSKo5_iwuPdyJtHE8P_rNY3rlGg6tr9whaS2x6lsIF3K8nTHVs4TFBxHgvngSmJgDH9SV8Ys7GEBqQaCgYKAXMSARISFQHGX2Mis9uGotg9v-7gNS9jAJvhTg0206" --project=$PROJECT_ID 2>/dev/null || gcloud secrets versions add GRANNY_YT_REFRESH --data-file=- --project=$PROJECT_ID <<< "ya29.a0AQvPyIMZ7dMcdoZ21Vy0fxSErN-Pp7ucBp_-YpS3LehTBfBWO7rT-PcDzMeKzMGxI6wNKzX4Tn4Yse99BS1JFXKGjmwJzZNDOYELGPrbjciouZOlokvOqZHI8OSKo5_iwuPdyJtHE8P_rNY3rlGg6tr9whaS2x6lsIF3K8nTHVs4TFBxHgvngSmJgDH9SV8Ys7GEBqQaCgYKAXMSARISFQHGX2Mis9uGotg9v-7gNS9jAJvhTg0206"

gcloud secrets create REBEL_YT_REFRESH --replication-policy="automatic" --data-file=- <<< "ya29.a0AQvPyINlMRs5FTkMHfTzujCHDI6DCMSsDfLqbTfpKuyKDnjTFRkXcHsCfDOOUMcso_0VXaQq6U2Uw-bYKqsvwbc755lHxs9MQeWWJ5XcZux8e7c9FvudN31r9OY5Zxljfo-5lkeUrsZ8VRFi5f0vRjZC3Dv5QTX82A9F4heFCPB_kRsObXMN1LN3QSKLPAmZuB6iJUoaCgYKAVgSARcSFQHGX2MiH38vPL5m00D1l6-YlPMYIA0206" --project=$PROJECT_ID 2>/dev/null || gcloud secrets versions add REBEL_YT_REFRESH --data-file=- --project=$PROJECT_ID <<< "ya29.a0AQvPyINlMRs5FTkMHfTzujCHDI6DCMSsDfLqbTfpKuyKDnjTFRkXcHsCfDOOUMcso_0VXaQq6U2Uw-bYKqsvwbc755lHxs9MQeWWJ5XcZux8e7c9FvudN31r9OY5Zxljfo-5lkeUrsZ8VRFi5f0vRjZC3Dv5QTX82A9F4heFCPB_kRsObXMN1LN3QSKLPAmZuB6iJUoaCgYKAVgSARcSFQHGX2MiH38vPL5m00D1l6-YlPMYIA0206"

gcloud secrets create GRANNY_BUZZSPROUT_TOKEN --replication-policy="automatic" --data-file=- <<< "36a9c14335f90ca4256810537510ee21" --project=$PROJECT_ID 2>/dev/null || gcloud secrets versions add GRANNY_BUZZSPROUT_TOKEN --data-file=- --project=$PROJECT_ID <<< "36a9c14335f90ca4256810537510ee21"

gcloud secrets create REBEL_BUZZSPROUT_TOKEN --replication-policy="automatic" --data-file=- <<< "de307c10b5ddb239d262d641b288177b" --project=$PROJECT_ID 2>/dev/null || gcloud secrets versions add REBEL_BUZZSPROUT_TOKEN --data-file=- --project=$PROJECT_ID <<< "de307c10b5ddb239d262d641b288177b"

echo "Granting Cloud Run service account access to secrets..."

for secret in YT_CLIENT_ID YT_CLIENT_SECRET GRANNY_YT_REFRESH REBEL_YT_REFRESH GRANNY_BUZZSPROUT_TOKEN REBEL_BUZZSPROUT_TOKEN; do
  gcloud secrets add-iam-policy-binding $secret \
    --member=serviceAccount:$SERVICE_ACCOUNT \
    --role=roles/secretmanager.secretAccessor \
    --project=$PROJECT_ID --quiet
done

echo "✅ Secrets created and permissions granted"
echo ""
echo "Now deploy with:"
echo "gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine --set-env-vars=YT_CLIENT_ID=sm://YT_CLIENT_ID,YT_CLIENT_SECRET=sm://YT_CLIENT_SECRET,GRANNY_YT_REFRESH=sm://GRANNY_YT_REFRESH,REBEL_YT_REFRESH=sm://REBEL_YT_REFRESH,GRANNY_BUZZSPROUT_TOKEN=sm://GRANNY_BUZZSPROUT_TOKEN,REBEL_BUZZSPROUT_TOKEN=sm://REBEL_BUZZSPROUT_TOKEN,GRANNY_BUZZSPROUT_PODCAST_ID=2615568,REBEL_BUZZSPROUT_PODCAST_ID=2615589"
