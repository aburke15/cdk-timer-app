import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { CdkTimerPiplineStage } from './cdk-timer-pipline-stage';

export class CdkTimerPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cdkTimerPipline = new CodePipeline(this, 'CdkTimerPipeline', {
      pipelineName: 'CdkTimerPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('aburke15/cdk-timer-app', 'develop'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    cdkTimerPipline.addStage(
      new CdkTimerPiplineStage(this, 'CdkTimerPipelineStage', {
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
      })
    );
  }
}
