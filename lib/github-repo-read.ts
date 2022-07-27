import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { MemoryAndTimout } from './utils/types';

export interface GitHubRepoReadProps {
  memoryAndTimeout: MemoryAndTimout;
  gitHubRepoTable: Table;
}

export class GitHubRepoRead extends Construct {
  constructor(scope: Construct, id: string, props: GitHubRepoReadProps) {
    super(scope, id);

    const gitHubRepoReadHandler = new NodejsFunction(this, 'Handler', {
      memorySize: 256,
      timeout: props.memoryAndTimeout.timeout,
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: Code.fromAsset('lambda').path + '/github-repo-read-function.ts',
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
      environment: {
        TABLE_NAME: props.gitHubRepoTable.tableName,
      },
    });

    props.gitHubRepoTable.grantReadData(gitHubRepoReadHandler);

    const api = new LambdaRestApi(this, 'Api', {
      handler: gitHubRepoReadHandler,
      proxy: false,
    });

    const projects = api.root.addResource('projects');

    projects.addMethod('GET');
    projects.addCorsPreflight({
      allowOrigins: ['*'],
      allowMethods: ['GET'],
    });
  }
}
