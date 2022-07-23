import { Construct, Node } from 'constructs';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { MemoryAndTimout } from './utils/types';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface GitHubRepoProps {
  memoryAndTimeout: MemoryAndTimout;
  gitHubRepoTable: Table;
  gitHubUserSecret: ISecret;
  gitHubPatSecret: ISecret;
}

export class GitHubRepo extends Construct {
  constructor(scope: Construct, id: string, props: GitHubRepoProps) {
    super(scope, id);

    const eventRule = new Rule(this, 'EventRule', {
      schedule: Schedule.cron({
        minute: '*/5',
        hour: '4,5',
        month: '*',
        weekDay: '1,3,5,7',
      }),
    });

    const insertHandler = new NodejsFunction(this, 'InsertHandler', {
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

    const deleteHandler = new NodejsFunction(this, 'DeleteHandler', {
      memorySize: props.memoryAndTimeout.memorySize,
      timeout: props.memoryAndTimeout.timeout,
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: Code.fromAsset('lambda').path + '/github-repo-delete-function.ts',
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
      environment: {
        TABLE_NAME: props.gitHubRepoTable.tableName,
        DOWNSTREAM_FUNCTION_NAME: insertHandler.functionName,
      },
    });

    insertHandler.grantInvoke(deleteHandler);
    eventRule.addTarget(new LambdaFunction(deleteHandler));

    props.gitHubRepoTable.grantWriteData(deleteHandler);
    props.gitHubRepoTable.grantWriteData(insertHandler);
  }
}
