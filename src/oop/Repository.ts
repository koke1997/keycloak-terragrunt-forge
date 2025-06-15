
/**
 * OOP Entity for a repository (can be GitHub, GitLab, etc).
 */
export class Repository {
  name: string;
  url: string;
  description?: string;

  constructor(name: string, url: string, description?: string) {
    this.name = name;
    this.url = url;
    this.description = description;
  }
}
