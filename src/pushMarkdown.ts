import pfs from 'node:fs/promises';
import path from 'node:path';

import * as core from '@actions/core';
import * as github from '@actions/github';
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';
import { markdownToRichText } from '@tryfabric/martian';
import graymatter from 'gray-matter';

import { getCtx } from './actionCtx';
import { getChangedMdFiles } from './git';
import { isNotionFrontmatter } from './notion';
import { retry, RetryError } from './retry';

export async function pushUpdatedMarkdownFiles() {
  const markdownFiles = getChangedMdFiles();
  const fileFailures: { file: string; message: string }[] = [];
  for (const mdFileName of markdownFiles) {
    const res = await retry(() => pushMarkdownFile(mdFileName), {
      tries: 2,
    });

    if (res instanceof RetryError) {
      console.log('Failed to push markdown file', res);
      fileFailures.push({ file: mdFileName, message: res.message });
    }
  }
  if (fileFailures.length) {
    core.setFailed(`Files failed to push: ${fileFailures}`);
  }
}

export async function pushMarkdownFile(mdFilePath: string) {
  const { notion } = getCtx();
  const fileContents = await pfs.readFile(mdFilePath, { encoding: 'utf-8' });
  const fileMatter = graymatter(fileContents);

  if (!isNotionFrontmatter(fileMatter.data)) {
    return;
  }

  console.log('Notion frontmatter found', {
    frontmatter: fileMatter.data,
    file: mdFilePath,
  });

  const pageData = fileMatter.data;
  const pageId = pageData.notion_page.startsWith('http')
    ? path.basename(new URL(pageData.notion_page).pathname).split('-').at(-1)
    : pageData.notion_page;

  if (!pageId) {
    throw new Error('Could not get page ID from frontmatter');
  }

  if (pageData.title) {
    console.log(`Updating title: ${pageData.title}`);
    await notion.updatePageTitle(pageId, pageData.title);
  }

  console.log('Clearing page content');
  await notion.clearBlockChildren(pageId);

  console.log('Adding markdown content');
  await notion.appendMarkdown(pageId, fileMatter.content, [
    createWarningBlock(mdFilePath),
  ]);
}

function createWarningBlock(fileName: string): BlockObjectRequest {
  return {
    type: 'callout',
    callout: {
      rich_text: markdownToRichText(
        `This file is linked to Github. Changes must be made in the [markdown file](${github.context.payload.repository?.html_url}/blob/${github.context.sha}/${fileName}) to be permanent.`
      ),
      icon: {
        emoji: '⚠',
      },
      color: 'yellow_background',
    },
  };
}
