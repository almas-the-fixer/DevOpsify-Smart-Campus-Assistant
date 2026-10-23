#!/usr/bin/env bash

set -euo pipefail

RESOURCE_GROUP="smart-campus-resource-group"
ROLE="Virtual Machine Contributor"

CLIENT_ID="${AZURE_CLIENT_ID}"
SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"

echo "Finding GitHub Actions service principal..."

SP_OBJECT_ID=$(az ad sp show \
  --id "$CLIENT_ID" \
  --query id \
  --output tsv)

SCOPE="/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}"

echo "Checking RBAC assignment..."

EXISTING=$(az role assignment list \
  --assignee-object-id "$SP_OBJECT_ID" \
  --scope "$SCOPE" \
  --role "$ROLE" \
  --query "[].id" \
  --output tsv)

if [ -n "$EXISTING" ]; then
  echo "RBAC assignment already exists."
else
  echo "Creating RBAC assignment..."

  az role assignment create \
    --assignee-object-id "$SP_OBJECT_ID" \
    --role "$ROLE" \
    --scope "$SCOPE"

  echo "RBAC assignment created."
fi