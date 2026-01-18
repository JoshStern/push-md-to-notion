import * as core from '@actions/core';

import { actionStore } from './actionCtx';
import { NotionApi } from './notion';
import { pushUpdatedMarkdownFiles } from './pushMarkdown';

async function main() {
  try {
    const token = core.getInput('notion-token');
    const notion = new NotionApi(token);

    await actionStore.run({ notion }, pushUpdatedMarkdownFiles);
  } catch (e) {
    core.setFailed(e instanceof Error ? e.message : 'Unknown reason');
  }
}

main();
