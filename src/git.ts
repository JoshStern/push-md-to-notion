import { execSync } from 'node:child_process';

/**
 * Query git repo for any markdown files that have changed in the last commit.
 * @returns List of markdown files.
 */
export function getChangedMdFiles(): string[] {
  const gitOutput = execSync('git diff --name-only HEAD~1 HEAD', {
    encoding: 'utf-8',
  });

  return gitOutput
    .trim()
    .split('\n')
    .filter((fn) => fn.endsWith('.md'));
}
