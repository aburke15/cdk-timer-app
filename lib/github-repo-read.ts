import { Size } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { MemoryDB } from 'aws-sdk';
import { Construct } from 'constructs';
import { MemoryAndTimout } from './utils/types';

export interface GitHubRepoReadProps {
  memoryAndTimeout: MemoryAndTimout;
  gitHubRepoTable: Table;
  gitHubUserSecret: ISecret;
  gitHubPatSecret: ISecret;
}

export class GitHubRepoRead extends Construct {
  constructor(scope: Construct, id: string, props: GitHubRepoReadProps) {
    super(scope, id);

    const handler = new NodejsFunction(this, 'Handler', {
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
        GITHUB_USER: props.gitHubUserSecret.secretValue.unsafeUnwrap().toString(),
        GITHUB_PAT: props.gitHubPatSecret.secretValue.unsafeUnwrap().toString(),
        TABLE_NAME: props.gitHubRepoTable.tableName,
      },
    });

    props.gitHubRepoTable.grantReadData(handler);

    new LambdaRestApi(this, 'Endpoint', {
      handler: handler,
    });
  }
}
