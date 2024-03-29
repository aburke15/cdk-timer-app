import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as Types from './utils/types';

interface GitHubRepoReadProps {
  memoryAndTimeout: Types.MemoryAndTimoutOptions;
  gitHubRepoTable: Table;
}

export class GitHubRepoRead extends Construct {
  public readonly restApi: LambdaRestApi;

  constructor(scope: Construct, id: string, props: GitHubRepoReadProps) {
    super(scope, id);

    const gitHubRepoReadHandler = new NodejsFunction(this, 'Handler', {
      memorySize: 256,
      timeout: props.memoryAndTimeout.timeout,
      runtime: Runtime.NODEJS_14_X,
      handler: Types.handler,
      entry: Code.fromAsset(Types.directory).path + '/github-repo-read-function.ts',
      bundling: Types.bundling,
      environment: {
        TABLE_NAME: props.gitHubRepoTable.tableName,
      },
    });

    props.gitHubRepoTable.grantReadData(gitHubRepoReadHandler);

    this.restApi = new LambdaRestApi(this, `GitHubRepoApi`, {
      handler: gitHubRepoReadHandler,
      proxy: false,
    });

    const projects = this.restApi.root.addResource('projects');

    projects.addMethod('GET');
    projects.addCorsPreflight({
      allowOrigins: ['*'],
      allowMethods: ['GET'],
    });
  }
}
