import { Duration } from "aws-cdk-lib";

export interface MemoryAndTimout {
  memorySize: number;
  timeout: Duration;
}

export interface GitHubProject {
  id: string | undefined;
  name: string | undefined;
  createdAt: string | undefined;
  description: string | undefined;
  htmlUrl: string | undefined;
  language: string | undefined;
}
