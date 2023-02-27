import { execSync } from 'node:child_process';

/**
 * Query git repo for any markdown files that have changed in the last commit.
 * @returns List of markdown files.
 */
export function getChangedMdFiles(): string[] {
  const gitOutput = execSync('git show --name-only --pretty=format:', {
    encoding: 'utf-8',
  });

  console.log({ gitOutput });

  return gitOutput
    .trim()
    .split('\n')
    .filter((fn) => fn.endsWith('.md'));
}
