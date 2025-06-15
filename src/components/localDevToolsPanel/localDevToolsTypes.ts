
export interface DockerService {
  name: string;
  image: string;
  port: string;
  status: 'running' | 'stopped' | 'building';
  description: string;
}

export interface GitOperation {
  type: 'commit' | 'push' | 'pull' | 'branch' | 'merge';
  description: string;
  command: string;
}

export interface PackageScript {
  name: string;
  description: string;
  command: string;
}
