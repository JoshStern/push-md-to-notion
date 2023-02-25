---
notion_page: https://mesquite-utahraptor-20e.notion.site/Github-Markdown-files-in-Notion-c038333a9e13468ea9cb109dc6838a68
title: Github Markdown files in Notion
---

# Managing documentation

As projects scale it's important to keep documentation accessible and up-to-date. README's and other markdown files that live alongside source can be extremely useful for building context as you work throughout a repository.

For many organizations Notion is the central store for many types of documentation. This project hopes to let engineers continue to author project documentation alongside their work and also make sure it stays up to date with the broader organization documentation.

# Usage

This Github action automatically scans commits for markdown changes and uses some frontmatter fields to push the changes to Notion.

It's intentionally set up to be used with an internal integration so document data stays within your organization.

## 1. Get an integration key

Head to the [Notion dashboard](https://www.notion.so/my-integrations) and create a new internal integration. It will need read, update, and insert capabilities.

## 2. Configure a Github workflow

This workflow will run for every push to `main`. It is dependent on having access to `git` and the repo being checked. It will check the latest commit on whichever branch is checked out for markdown changes.

```yaml
on:
  push:
    branches:
      - main

jobs:
  push_markdown_job:
    runs-on: ubuntu-latest
    name: Push markdown to Notion
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Push markdown
        uses: joshstern/push-md-to-notion@v0.1
        id: push_markdown
        with:
          notion-token: ${{ secrets.NOTION_TOKEN }}
```

## 3. Create a Notion page and add the integration

A Notion page needs to be created before markdown content will be synced to it. You can add your integration to a root page or to each synced page.

## 4. Add the page link

You're now ready to start pushing changes to Notion! You can add the following frontmatter fields to an existing markdown file or to a new one.

```
---
notion_page: https://www.notion.so/<your_path>
title: <Your Title>
---

# My README

This content will by synced to Notion!
```

Repeat steps 3 and 4 for new markdown files.

# Limitations

## Notion API

This tool has all of the standard [Notion API limits](https://developers.notion.com/reference/request-limits).

## Slow syncs

Notion does not have a bulk delete blocks API. When trying to speed things up by batching delete requests the sync job began erroring because of state conflicts in Notion. We're left with deleting blocks one-by-one, which for large pages can take some time. The update API also has very limited options so it can't be used to replace existing elements.

Some optimizations could be made to also parallelize by documents but the current implementation fits my needs. Contributions welcome!

# Thanks

This project is mostly a wire-up of the [Notion client](https://www.npmjs.com/package/@notionhq/client) and [`@tryfabric/martian`](https://www.npmjs.com/package/@tryfabric/martian). Many thanks to the maintainers of those projects!
