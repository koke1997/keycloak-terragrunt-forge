#!/bin/bash

# Quick demonstration of Groups functionality in Keycloak-to-Terraform converter
# This script shows the complete workflow including the new groups support

set -e

echo "🏢 GROUPS FUNCTIONALITY DEMONSTRATION"
echo "====================================="
echo ""

# Check if groups test realm exists
if [ ! -f "test-samples/groups-test-realm.json" ]; then
  echo "❌ Groups test realm not found. Run the full setup first."
  exit 1
fi

echo "📊 Groups Test Realm Analysis:"
echo "------------------------------"

# Analyze the groups test realm
GROUPS_COUNT=$(jq '.groups | length' test-samples/groups-test-realm.json)
SUBGROUPS_COUNT=$(jq '[.groups[].subGroups[]?] | length' test-samples/groups-test-realm.json)
USERS_WITH_GROUPS=$(jq '[.users[] | select(.groups and (.groups | length > 0))] | length' test-samples/groups-test-realm.json)

echo "✅ Top-level groups: $GROUPS_COUNT"
echo "✅ Sub-groups: $SUBGROUPS_COUNT"  
echo "✅ Users with group assignments: $USERS_WITH_GROUPS"

echo ""
echo "🔧 Generating Terraform with Groups Support:"
echo "---------------------------------------------"

# Generate Terraform
if node generate-proper-terraform.js > /dev/null 2>&1; then
  echo "✅ Terraform generation completed"
else
  echo "❌ Terraform generation failed"
  exit 1
fi

# Check if groups.tf was created
if [ -f "terraform/groups-test-realm/groups.tf" ]; then
  echo "✅ groups.tf file created"
  
  # Analyze the groups.tf file
  GROUP_RESOURCES=$(grep -c "resource \"keycloak_group\"" terraform/groups-test-realm/groups.tf)
  ROLE_MAPPINGS=$(grep -c "resource \"keycloak_group_roles\"" terraform/groups-test-realm/groups.tf)
  PARENT_REFS=$(grep -c "parent_id" terraform/groups-test-realm/groups.tf)
  
  echo "   📊 Group resources: $GROUP_RESOURCES"
  echo "   📊 Role mappings: $ROLE_MAPPINGS"
  echo "   📊 Parent-child relationships: $PARENT_REFS"
else
  echo "❌ groups.tf file not created"
  exit 1
fi

echo ""
echo "🔍 Groups Terraform Content Preview:"
echo "------------------------------------"
head -20 terraform/groups-test-realm/groups.tf

echo ""
echo "📋 Available Test Commands:"
echo "---------------------------"
echo ""
echo "🧪 Run groups validation tests:"
echo "   node regression-tests/validation/test-groups.js"
echo ""
echo "🔧 Validate Terraform syntax:"
echo "   ./regression-tests/conversion/validate-terraform.sh"
echo ""
echo "🚀 Run full regression test suite:"
echo "   ./regression-tests/run-all-tests.sh"
echo ""
echo "📊 Test specific realm deployment:"
echo "   cd terraform/groups-test-realm"
echo "   terraform init && terraform plan"
echo ""

echo "✅ Groups functionality is ready for testing!"
echo ""
echo "🎯 KEY FEATURES DEMONSTRATED:"
echo "   • Group hierarchy creation (parent/child relationships)"
echo "   • Group role mappings (automatic role assignments)"
echo "   • Group attributes (custom metadata)"
echo "   • User group assignments (membership management)"
echo "   • Terraform resource generation (infrastructure as code)"
echo ""
echo "📁 Generated Files:"
echo "   • terraform/groups-test-realm/groups.tf - Group resources"
echo "   • terraform/groups-test-realm/realm.tf - Realm configuration"
echo "   • terraform/groups-test-realm/users.tf - User management"
echo "   • terraform/groups-test-realm/roles.tf - Role definitions"
echo "   • terraform/groups-test-realm/clients.tf - Client configuration"