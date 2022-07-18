import * as https from 'https';
import { GitHubProject } from '../utils/types';

export const parseGitHubReposIntoProjects = (repos: any[]): GitHubProject[] => {
  const projects: GitHubProject[] = [];
  repos.forEach((repo) => {
    const repoId = repo.id.toString();
    const project: GitHubProject = {
      id: repoId,
      name: repo.name,
      createdAt: repo.created_at,
      description: repo.description ?? 'N/A',
      htmlUrl: repo.html_url,
      language: repo.language ?? 'N/A',
    };
    projects.push(project);
  });

  return projects;
};

export const getGitHubUserRepos = (): Promise<any[]> => {
  const url = `https://api.github.com/users/${process.env.GITHUB_USER}/repos?per_page=100`;
  const options: https.RequestOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${process.env.GITHUB_PAT}`,
      'User-Agent': 'github-repo-insert-lambda',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunck) => {
        data += chunck;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error: any) {
          reject(new Error(error));
        }
      });
    });

    req.on('error', (error: any) => {
      reject(new Error(error));
    });
  });
};
