import { Duration } from 'aws-cdk-lib';

export interface GitHubProject {
  id: string | undefined;
  name: string | undefined;
  createdAt: string | undefined;
  description: string | undefined;
  htmlUrl: string | undefined;
  language: string | undefined;
}

export interface MemoryAndTimoutOptions {
  memorySize: number;
  timeout: Duration;
}

export interface BundlingOptions {
  readonly externalModules: string[];
  readonly minify: boolean;
}

export const bundling: BundlingOptions = {
  externalModules: ['aws-sdk', 'aws-lambda'],
  minify: true,
};

export const directory: string = 'lambda';
export const handler: string = 'handler';
export const gitHubRepo: string = 'GitHubRepo';
