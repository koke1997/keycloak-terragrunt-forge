
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "lucide-react";
import { Repository } from "@/oop/Repository";
import { RepositoryCombiner } from "@/oop/RepositoryCombiner";

// Basic form for selecting two repositories
export function CombineRepositoriesForm() {
  const [repoA, setRepoA] = useState({ name: "", url: "", description: "" });
  const [repoB, setRepoB] = useState({ name: "", url: "", description: "" });
  const [combined, setCombined] = useState<null | {
    name: string;
    description: string;
    sources: string[];
    mergeStrategy: string;
  }>(null);

  const handleCombine = (e: React.FormEvent) => {
    e.preventDefault();
    const repositoryA = new Repository(repoA.name, repoA.url, repoA.description);
    const repositoryB = new Repository(repoB.name, repoB.url, repoB.description);
    const combiner = new RepositoryCombiner();
    const result = combiner.combine(repositoryA, repositoryB);
    setCombined(result);
  };

  return (
    <Card className="my-6 border rounded-lg bg-white shadow-lg max-w-xl mx-auto p-0 animate-fade-in group">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-800">
          <Link className="w-5 h-5 text-indigo-500" />
          Combine Two Repositories
        </CardTitle>
        <CardDescription className="text-indigo-700">
          Use best-practices OOP architecture: enter/tweak details for two repositories, then combine them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCombine} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-1 text-indigo-900">Repository A</div>
              <Input
                placeholder="Repo A Name"
                value={repoA.name}
                onChange={e => setRepoA(v => ({ ...v, name: e.target.value }))}
                className="mb-1"
                required
              />
              <Input
                placeholder="Repo A URL"
                value={repoA.url}
                onChange={e => setRepoA(v => ({ ...v, url: e.target.value }))}
                className="mb-1"
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={repoA.description}
                onChange={e => setRepoA(v => ({ ...v, description: e.target.value }))}
              />
            </div>
            <div>
              <div className="font-semibold mb-1 text-indigo-900">Repository B</div>
              <Input
                placeholder="Repo B Name"
                value={repoB.name}
                onChange={e => setRepoB(v => ({ ...v, name: e.target.value }))}
                className="mb-1"
                required
              />
              <Input
                placeholder="Repo B URL"
                value={repoB.url}
                onChange={e => setRepoB(v => ({ ...v, url: e.target.value }))}
                className="mb-1"
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={repoB.description}
                onChange={e => setRepoB(v => ({ ...v, description: e.target.value }))}
              />
            </div>
          </div>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2 self-start">
            <Link className="w-4 h-4 mr-2" />
            Combine Repositories
          </Button>
        </form>

        {combined && (
          <div className="mt-8 border-t pt-6">
            <div className="font-bold text-indigo-800 mb-2">Combined Repository Preview:</div>
            <div className="mb-1 text-lg">{combined.name}</div>
            <div className="mb-2 text-gray-700 whitespace-pre-line">{combined.description}</div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Source URLs: </span>
              {combined.sources.map((src, i) => (
                <span key={src} className="underline text-blue-600 mr-2">
                  {src}
                  {i < combined.sources.length - 1 ? ", " : ""}
                </span>
              ))}
              <div>
                <span className="font-semibold">Merge Strategy: </span>{combined.mergeStrategy}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
