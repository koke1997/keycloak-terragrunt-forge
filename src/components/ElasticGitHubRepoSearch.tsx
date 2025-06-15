
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Github } from "lucide-react";

function getSavedToken() {
  return localStorage.getItem("github_pat") || "";
}

/**
 * Small Elastic-like search for GitHub repositories.
 * User must enter their GitHub Personal Access Token (PAT) (scope: public_repo).
 * PAT is saved in localStorage, not persisted elsewhere.
 */
export function ElasticGitHubRepoSearch() {
  const [token, setToken] = useState<string>(getSavedToken());
  const [showTokenInput, setShowTokenInput] = useState(!getSavedToken());
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Save token to localStorage and hide input
  const handleTokenSave = () => {
    localStorage.setItem("github_pat", token);
    setShowTokenInput(false);
  };

  const handleTokenClear = () => {
    localStorage.removeItem("github_pat");
    setToken("");
    setShowTokenInput(true);
  };

  useEffect(() => {
    if (!query || !token) {
      setResults([]);
      setErr(null);
      return;
    }
    const fetchRepos = async () => {
      setLoading(true);
      setErr(null);
      try {
        const resp = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=7`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
          }
        );
        if (!resp.ok) {
          if (resp.status === 401) throw new Error("Invalid or expired GitHub token.");
          throw new Error(`GitHub API error (${resp.status})`);
        }
        const data = await resp.json();
        setResults(data.items || []);
      } catch (e: any) {
        setErr(e?.message || "Unknown error.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchRepos, 500);
    return () => clearTimeout(debounce);
    // Only run when query or token changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, token]);

  return (
    <Card className="max-w-xl mx-auto mb-8 mt-2 border bg-white shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-800"><Github className="w-5 h-5" />Search GitHub Repositories</CardTitle>
        <CardDescription className="text-indigo-700">
          Elastic, real-time GitHub repo search.<br />
          <span className="text-xs text-gray-500">Requires your GitHub personal access token (never uploaded or persisted elsewhere).</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {showTokenInput ? (
          <div className="mb-2">
            <label className="font-medium text-indigo-900 pb-1 block">GitHub Personal Access Token</label>
            <Input
              type="password"
              autoComplete="off"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Enter your GitHub PAT..."
              className="mb-2"
            />
            <Button onClick={handleTokenSave} disabled={!token} className="bg-indigo-600 hover:bg-indigo-700 text-white mr-2">Save</Button>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/settings/tokens"
              className="text-xs text-blue-800 underline ml-1"
            >
              Get a token
            </a>
          </div>
        ) : (
          <div className="text-xs text-green-700 flex items-center gap-2 mb-1">
            Token saved and active. <Button size="sm" variant="link" className="text-red-600" onClick={handleTokenClear}>Change</Button>
          </div>
        )}

        <div>
          <div className="relative flex items-center">
            <span className="absolute left-2">
              <Search className="w-4 h-4 opacity-70" />
            </span>
            <Input
              placeholder="Search for repositories (e.g. nextjs)"
              disabled={!token}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="mb-1 pl-8"
            />
          </div>
        </div>

        {loading && <div className="py-2 text-sm text-indigo-600">Searching GitHub…</div>}
        {err && <div className="py-1 text-xs text-red-700">Error: {err}</div>}
        {!loading && results.length > 0 && (
          <ul className="divide-y divide-gray-200 border rounded p-2 bg-slate-50">
            {results.map(repo => (
              <li key={repo.id} className="py-2">
                <a
                  href={repo.html_url}
                  className="font-semibold text-indigo-800 hover:underline flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1 opacity-80" />
                  {repo.full_name}
                </a>
                <span className="block text-xs text-gray-700">{repo.description || <span className="italic text-gray-400">No description</span>}</span>
                <span className="text-xs text-gray-500">★ {repo.stargazers_count} | Language: {repo.language}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
