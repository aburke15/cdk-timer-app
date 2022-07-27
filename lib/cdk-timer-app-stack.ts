import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { ARecord, HostedZone, PublicHostedZone, RecordSet, RecordTarget, RecordType } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Route53 } from 'aws-sdk';
import { Construct } from 'constructs';
import { domain } from 'process';
import { GitHubRepo } from './github-repo';
import { GitHubRepoRead } from './github-repo-read';

const memoryAndTimeout = {
  memorySize: 512,
  timeout: Duration.minutes(3),
} as const;

export class CdkTimerAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const gitHubRepoTable = new Table(this, 'GitHubRepoTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
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

    const record = new ARecord(this, 'AliasRecord', {
      target: RecordTarget.fromAlias(new ApiGateway(gitHubRepoRead.Api)),
      zone: zone,
      recordName: 'proj',
    });
  }
}
