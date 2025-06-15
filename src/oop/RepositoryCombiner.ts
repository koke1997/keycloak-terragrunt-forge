
import { Repository } from "./Repository";

/**
 * OOP Service to combine repositories using best practices.
 * This is just a stub/mock; the actual logic would be much more involved.
 */
export class RepositoryCombiner {
  /**
   * Combines two repositories into one "virtual" repo.
   * @param repoA First repository
   * @param repoB Second repository
   * @returns Object describing the combined repository result
   */
  combine(repoA: Repository, repoB: Repository) {
    // OOP: encapsulate combining logic, allow swapping strategies if needed
    return {
      name: `${repoA.name}-${repoB.name}`,
      description: `Combined repository from "${repoA.name}" and "${repoB.name}".\n\n${repoA.description ?? ""}\n${repoB.description ?? ""}`.trim(),
      sources: [repoA.url, repoB.url],
      mergeStrategy: "simple-concat", // could be extended with strategy pattern
    };
  }
}
