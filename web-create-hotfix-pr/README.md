# Web - Create Hotfix Release PR

Creates a hotfix release candidate branch and pull request (PR)

## Usage

```yaml
name: Stage - Create Hotfix Release Candidate (RC)

on:
  pull_request:
    types:
      - closed
    branches:
      - develop

jobs:
  stage-hotfix-rc:
    name: Stage - Create Hotfix Release Candidate
    if: |
      github.event.pull_request.merged == true && (contains(github.head_ref, 'hotfix/') || contains(github.event.pull_request.labels.*.name, 'hotfix') || contains(github.event.pull_request.labels.*.name, 'Hotfix'))
    runs-on: ubuntu-latest
    steps:
      - uses: actions/web-create-hotfix-pr@master
        with:
          fromBranch: develop
          toBranch: stage
          rcBranchPrefix: stage-release/hotfix
          prTitleHeader: '(Stage) (Hotfix)'
          prLabel: Hotfix,Stage Release
```