import { Client } from '@notionhq/client';
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';
import { markdownToBlocks } from '@tryfabric/martian';

/**
 * Class for managing Notion client state and methods needed for the action.
 */
export class NotionApi {
  private client: Client;
  constructor(token: string) {
    this.client = new Client({
      auth: token,
    });
  }

  public async updatePageTitle(pageId: string, title: string) {
    await this.client.pages.update({
      page_id: pageId,
      properties: {
        title: {
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: title },
            },
          ],
        },
      },
    });
  }

  public async clearBlockChildren(blockId: string) {
    for await (const block of this.listChildBlocks(blockId)) {
      await this.client.blocks.delete({
        block_id: block.id,
      });
    }
  }

  /**
   * Convert markdown to the notion block data format and append it to an existing block.
   * @param blockId Block which the markdown elements will be appended to.
   * @param md Markdown as string.
   */
  public async appendMarkdown(
    blockId: string,
    md: string,
    preamble: BlockObjectRequest[] = []
  ) {
    await this.client.blocks.children.append({
      block_id: blockId,
      children: [...preamble, ...markdownToBlocks(md)],
    });
  }

  /**
   * Iterate over all of the childeren of a given block. This manages the underlying paginated API.
   * @param blockId Block being listed.
   * @param batchSize Number of childeren to fetch in each call to notion. Max 100.
   */
  public async *listChildBlocks(blockId: string, batchSize = 50) {
    let has_more = true;
    do {
      const blocks = await this.client.blocks.children.list({
        block_id: blockId,
        page_size: batchSize,
      });

      for (const block of blocks.results) {
        yield block;
      }

      has_more = blocks.has_more;
    } while (has_more);
  }
}

export interface NotionFrontmatter {
  notion_page: string;
  title?: string;
  [key: string]: unknown;
}

export function isNotionFrontmatter(fm: unknown): fm is NotionFrontmatter {
  const castFm = fm as NotionFrontmatter;
  return (
    typeof castFm?.notion_page === 'string' &&
    (typeof castFm?.title === 'string' || typeof castFm?.title === 'undefined')
  );
}
