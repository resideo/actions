# Web - Create Release PR

Creates a release candidate branch and pull request (PR)

## Usage

```yaml
name: Prod - Create Release Candidate

on:
  workflow_dispatch:

env:
  GITHUB_TOKEN: ${{ secrets.BOT_TOKEN }}

jobs:
  create-release-pr:
    uses: resideo/actions/web-create-release-pr@master
    with:
      from-branch: stage
      to-branch: master
      rc-branch-prefix: release
      pr-label: Prod Release
    secrets:
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
```