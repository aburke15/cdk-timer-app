import { Duration } from "aws-cdk-lib";

export interface MemoryAndTimout {
  memorySize: number;
  timeout: Duration;
}

export interface GitHubProject {
  id: string;
  name: string;
  createdAt: string;
  description: string;
  htmlUrl: string;
  language: string;
}
