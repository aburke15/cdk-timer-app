import { SecretValue } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
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
      handler: Types.handlerName,
      entry: Code.fromAsset(Types.directory).path + '/github-repo-read-function.ts',
      bundling: Types.bundling,
      environment: {
        TABLE_NAME: props.gitHubRepoTable.tableName,
      },
    });

    props.gitHubRepoTable.grantReadData(gitHubRepoReadHandler);

    this.restApi = new LambdaRestApi(this, 'Api', {
      handler: gitHubRepoReadHandler,
      proxy: false,
    });

    new Secret(this, 'GitHubRepoApiIdSecret', {
      secretName: 'GitHubRepoApiId',
      secretStringValue: new SecretValue(this.restApi.restApiId),
    });

    const projects = this.restApi.root.addResource('projects');

    projects.addMethod('GET');
    projects.addCorsPreflight({
      allowOrigins: ['*'],
      allowMethods: ['GET'],
    });
  }
}
