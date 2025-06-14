
/**
 * Converts a keycloak JSON realm file into a mock Terragrunt representation.
 */
export function keycloakRealmJsonToTerragrunt(json: any, fileName: string): string {
  // Check if valid
  if (!json || typeof json !== "object" || !json.realm) {
    return `# Could not parse realm file: missing "realm" property`;
  }

  const realm = json.realm;
  const displayName = json.displayName || "";
  const enabled = typeof json.enabled === "boolean" ? json.enabled : true;

  let terragrunt = `# Terragrunt code generated for ${fileName}
resource "keycloak_realm" "${realm}" {
  realm        = "${realm}"
  display_name = "${displayName}"
  enabled      = ${enabled}
`;

  // Users example (produce a user resource for each user)
  if (Array.isArray(json.users) && json.users.length > 0) {
    terragrunt += "\n  # Users in this realm\n";
    json.users.forEach((user: any, idx: number) => {
      const userName = user.username || `user_${idx}`;
      terragrunt += 
      `  resource "keycloak_user" "${userName}" {
    realm_id = keycloak_realm.${realm}.id
    username = "${userName}"`;
      if (user.email) {
        terragrunt += `\n    email = "${user.email}"`;
      }
      terragrunt += "\n  }\n";
    });
  } else {
    terragrunt += "  # No users found in this realm\n";
  }

  terragrunt += "}\n";

  return terragrunt;
}

/**
 * Validate if a given file content is a Keycloak realm export (minimal check)
 */
export function isValidKeycloakJson(json: any): boolean {
  return typeof json === "object" && !!json.realm;
}

