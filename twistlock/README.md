# Twistlock Action

Run Twistlock to list dependencies that have security vulnerabilities.

## Usage
```yaml
on: pull_request

env:
  GITHUB_TOKEN: ${{ secrets.RESIDEO_BOT_TOKEN }}

jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: resideo/actions/twistlock@master
      with:
        username: ${{ secrets.TWISTLOCK_USERNAME }}
        password: ${{ secrets.TWISTLOCK_PASSWORD }}
```
