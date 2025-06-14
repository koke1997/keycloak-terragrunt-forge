
/**
 * Converts a keycloak JSON realm file into a mock Terragrunt representation.
 * This is NOT real Terragrunt code, replace with your logic as needed!
 */
export function keycloakRealmJsonToTerragrunt(json: any, fileName: string): string {
  // Here you should implement a real mapping from realm.json to Terragrunt
  // For demonstration, we'll just pretty-print the realm name and user count.
  const realm = json.realm || "unknown";
  let userCount = 0;
  if (Array.isArray(json.users)) userCount = json.users.length;

  return `# Terragrunt code generated for ${fileName}
resource "keycloak_realm" "${realm}" {
  realm = "${realm}"
  // Users: ${userCount}
  // ...etc
}
`;
}

/**
 * Validate if a given file content is a Keycloak realm export (minimal check)
 */
export function isValidKeycloakJson(json: any): boolean {
  return typeof json === "object" && !!json.realm;
}
