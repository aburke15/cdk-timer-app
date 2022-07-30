import { Duration } from 'aws-cdk-lib';

export interface GitHubProject {
  id: string | undefined;
  name: string | undefined;
  createdAt: string | undefined;
  description: string | undefined;
  htmlUrl: string | undefined;
  language: string | undefined;
}

export type MemoryAndTimoutOptions = {
  memorySize: number;
  timeout: Duration;
};

export type BundlingOptions = {
  readonly externalModules: string[];
  readonly minify: boolean;
};

export const directory: string = 'lambda';
export const handlerName: string = 'handler';

export const bundling: BundlingOptions = {
  externalModules: ['aws-sdk', 'aws-lambda'],
  minify: true,
};
