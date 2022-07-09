import { Construct } from "constructs";

export interface GitHubTimerProps {
  temp: string;
}

export class GitHubTimer extends Construct {
  constructor(scope: Construct, id: string, props: GitHubTimerProps) {
    super(scope, id);
  }
}
