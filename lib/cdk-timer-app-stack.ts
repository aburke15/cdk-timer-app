import * as CDK from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { ARecord, PublicHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { GitHubRepo } from './github-repo';
import { GitHubRepoRead } from './github-repo-read';
import { MemoryAndTimoutOptions } from './utils/types';

const memoryAndTimeout: MemoryAndTimoutOptions = {
  memorySize: 512,
  timeout: CDK.Duration.minutes(3),
};

export class CdkTimerAppStack extends CDK.Stack {
  constructor(scope: Construct, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

    const gitHubRepoTable = new Table(this, 'GitHubRepoTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: CDK.RemovalPolicy.DESTROY,
    });

    const certificate = new Certificate(this, 'Certificate', {
      domainName: '*.aburke.tech',
      validation: CertificateValidation.fromEmail(),
    });

    const zone = new PublicHostedZone(this, 'HostedZone', {
      zoneName: 'aburke.tech',
    });

    const gitHubUserSecret = Secret.fromSecretNameV2(this, 'GitHubUserSecret', 'GitHubUser');
    const gitHubPatSecret = Secret.fromSecretNameV2(this, 'GitHubPatSecret', 'GitHubPat');

    new GitHubRepo(this, 'GitHubRepo', {
      memoryAndTimeout,
      gitHubRepoTable,
      gitHubUserSecret,
      gitHubPatSecret,
    });

    const gitHubRepoRead = new GitHubRepoRead(this, 'GitHubRepoRead', {
      memoryAndTimeout,
      gitHubRepoTable,
      certificate,
    });

    new ARecord(this, 'AliasRecord', {
      target: RecordTarget.fromAlias(new ApiGateway(gitHubRepoRead.restApi)),
      zone: zone,
      recordName: 'proj',
    });
  }
}
