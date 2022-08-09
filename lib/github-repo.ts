import { Construct } from 'constructs';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as Types from './utils/types';

interface GitHubRepoProps {
  memoryAndTimeout: Types.MemoryAndTimoutOptions;
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
      handler: Types.handler,
      entry: Code.fromAsset(Types.directory).path + '/github-repo-insert-function.ts',
      bundling: Types.bundling,
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
      handler: Types.handler,
      entry: Code.fromAsset(Types.directory).path + '/github-repo-delete-function.ts',
      bundling: Types.bundling,
      environment: {
        TABLE_NAME: props.gitHubRepoTable.tableName,
        DOWNSTREAM_FUNCTION_NAME: insertHandler.functionName,
      },
    });

    insertHandler.grantInvoke(deleteHandler);
    eventRule.addTarget(new LambdaFunction(deleteHandler));

    props.gitHubRepoTable.grantReadWriteData(deleteHandler);
    props.gitHubRepoTable.grantWriteData(insertHandler);
  }
}
