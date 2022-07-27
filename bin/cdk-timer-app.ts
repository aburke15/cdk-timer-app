#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkTimerAppStack } from '../lib/cdk-timer-app-stack';

const app = new cdk.App();
new CdkTimerAppStack(app, 'CdkTimerAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
