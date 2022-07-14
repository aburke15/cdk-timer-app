import { Construct } from 'constructs';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { MemoryAndTimout } from './utils/types';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface GitHubRepoInsertProps {
  memoryAndTimeout: MemoryAndTimout;
  gitHubRepoTable: Table;
  gitHubUserSecret: ISecret;
  gitHubPatSecret: ISecret;
}

export class GitHubRepoInsert extends Construct {
  constructor(scope: Construct, id: string, props: GitHubRepoInsertProps) {
    super(scope, id);

    const eventRule = new Rule(this, 'EventRule', {
      schedule: Schedule.cron({
        minute: '*/5',
        hour: '4,5',
        month: '*',
        weekDay: '1,3,5',
      }),
    });

    const handler = new NodejsFunction(this, 'Handler', {
      memorySize: props.memoryAndTimeout.memorySize,
      timeout: props.memoryAndTimeout.timeout,
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: Code.fromAsset('lambda').path + '/github-repo-insert-function.ts',
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

    eventRule.addTarget(new LambdaFunction(handler));
    props.gitHubRepoTable.grantWriteData(handler);
  }
}
