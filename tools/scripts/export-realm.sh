#!/bin/bash

# Export realm from Keycloak using Admin API
KEYCLOAK_URL="http://localhost:8090"
ADMIN_USER="admin"
ADMIN_PASS="admin123"
REALM_NAME="example-realm-tf"

echo "🔐 Getting admin access token..."

# Get admin access token
TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASS}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✅ Got access token"
echo "📋 Listing all realms..."

# List all realms
curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KEYCLOAK_URL}/admin/realms" | jq -r '.[] | .realm'

echo ""
echo "📤 Exporting realm: ${REALM_NAME}"

# Export realm configuration
curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" > "exported-${REALM_NAME}.json"

if [ $? -eq 0 ] && [ -s "exported-${REALM_NAME}.json" ]; then
  echo "✅ Realm exported to: exported-${REALM_NAME}.json"
  echo "📊 File size: $(wc -c < exported-${REALM_NAME}.json) bytes"
  echo "📄 First few lines:"
  head -10 "exported-${REALM_NAME}.json"
else
  echo "❌ Failed to export realm"
  exit 1
fi

echo ""
echo "👥 Exporting users from realm..."

# Export users
curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users" > "exported-${REALM_NAME}-users.json"

if [ $? -eq 0 ] && [ -s "exported-${REALM_NAME}-users.json" ]; then
  echo "✅ Users exported to: exported-${REALM_NAME}-users.json"
  echo "📊 User count: $(jq length exported-${REALM_NAME}-users.json)"
else
  echo "❌ Failed to export users"
fi

echo ""
echo "🔑 Exporting roles from realm..."

# Export roles
curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles" > "exported-${REALM_NAME}-roles.json"

if [ $? -eq 0 ] && [ -s "exported-${REALM_NAME}-roles.json" ]; then
  echo "✅ Roles exported to: exported-${REALM_NAME}-roles.json"
  echo "📊 Role count: $(jq length exported-${REALM_NAME}-roles.json)"
else
  echo "❌ Failed to export roles"
fi

echo ""
echo "🎯 Exporting clients from realm..."

# Export clients
curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" > "exported-${REALM_NAME}-clients.json"

if [ $? -eq 0 ] && [ -s "exported-${REALM_NAME}-clients.json" ]; then
  echo "✅ Clients exported to: exported-${REALM_NAME}-clients.json"
  echo "📊 Client count: $(jq length exported-${REALM_NAME}-clients.json)"
else
  echo "❌ Failed to export clients"
fi

echo ""
echo "🎉 Export completed!"