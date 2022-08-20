import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { CdkTimerAppPipelineStage } from './cdk-time-app-pipeline-stage';

export class CdkTimerAppPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline: CodePipeline = new CodePipeline(this, 'CdkTimerAppPipeline', {
      pipelineName: 'CdkTimerAppPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('aburke15/cdk-timer-app', 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    pipeline.addStage(new CdkTimerAppPipelineStage(this, 'CdkTimerAppPipelineStage'));
  }
}
