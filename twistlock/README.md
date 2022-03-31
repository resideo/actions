# Twistlock Action

Run Twistlock to list dependencies that have security vulnerabilities.

## Usage

### Code Repo Scan

```yaml
on: pull_request

jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: resideo/actions/twistlock@master
        with:
          project: Titan-QA
          consoleURL: https://twistlock.cloud.resideo.com
          username: ${{ secrets.TWISTLOCK_USERNAME }}
          password: ${{ secrets.TWISTLOCK_PASSWORD }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Additionally it works on a schedule, but does not post a comment in this case.

```yaml
  pull_request:
  schedule:
    # * is a special character in YAML so you have to quote this string
    # run every day at 12pm utc === 8am eastern
    - cron: "0 12 * * *"

jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: resideo/actions/twistlock@master
      with:
        project: Titan-QA
        consoleURL: https://twistlock.cloud.resideo.com
        username: ${{ secrets.TWISTLOCK_USERNAME }}
        password: ${{ secrets.TWISTLOCK_PASSWORD }}
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Image Scan

If there is a need to scan a docker image instead of code checked out in the runner, you may pass an image tag. The image needs to exist locally for this to work. If it doesn't, run `docker pull <image>` prior to this action.

```yaml
  pull_request:
  schedule:
    # * is a special character in YAML so you have to quote this string
    # run every day at 12pm utc === 8am eastern
    - cron: "0 12 * * *"

jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
      - run: docker pull node:14
      - name: Run Twistlock
        uses: resideo/actions/twistlock@master
        with:
          project: Titan-QA
          consoleURL: https://twistlock.cloud.resideo.com
          username: ${{ secrets.TEMP_TWISTCLI_USERNAME }}
          password: ${{ secrets.TEMP_TWISTCLI_PASSWORD }}
          image: node:14
```
