
/**
 * Converts a Keycloak realm.json to Terraform/Terragrunt HCL code using the OpenTofu Keycloak provider syntax.
 */
export function keycloakRealmJsonToTerragrunt(json: any, fileName: string): string {
  if (!json || typeof json !== "object" || !json.realm) {
    return `# Could not parse realm file: missing "realm" property`;
  }

  const realm = json.realm;
  const displayName = json.displayName || "";
  const enabled = typeof json.enabled === "boolean" ? json.enabled : true;

  let terragrunt = `# Terraform code generated for ${fileName}\n`;

  // Realm block
  terragrunt += `resource "keycloak_realm" "${realm}" {
  realm        = "${realm}"
  display_name = "${displayName}"
  enabled      = ${enabled}
}\n\n`;

  // Users
  if (Array.isArray(json.users) && json.users.length > 0) {
    json.users.forEach((user: any, idx: number) => {
      const userName = user.username || `user_${idx}`;
      terragrunt += `resource "keycloak_user" "${userName}" {
  realm_id  = keycloak_realm.${realm}.id
  username  = "${userName}"`;

      // Optional attributes
      if (user.email) {
        terragrunt += `\n  email     = "${user.email}"`;
      }
      if (typeof user.enabled === "boolean") {
        terragrunt += `\n  enabled   = ${user.enabled}`;
      } else {
        terragrunt += `\n  enabled   = true`;
      }
      if (user.firstName) {
        terragrunt += `\n  first_name = "${user.firstName}"`;
      }
      if (user.lastName) {
        terragrunt += `\n  last_name = "${user.lastName}"`;
      }
      // Optionally add more fields as needed

      terragrunt += `\n}\n\n`;
    });
  } else {
    terragrunt += `# No users in this realm\n`;
  }

  return terragrunt.trim();
}

/**
 * Validate if a given file content is a Keycloak realm export (minimal check)
 */
export function isValidKeycloakJson(json: any): boolean {
  return typeof json === "object" && !!json.realm;
}

