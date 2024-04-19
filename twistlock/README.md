# Twistlock Action

Run Twistlock to list dependencies that have security vulnerabilities. Twistlock will look in module folders and the package file. In the case of Nodejs, please run `yarn install`, etc., before this action.

The `code repo` scan which runs by default scans the [following manifest files](https://docs.paloaltonetworks.com/prisma/prisma-cloud/prisma-cloud-admin-compute/vulnerability_management/code_repo_scanning.html): `package.json`, `package-lock.json`, `npm-shrinkwrap.json`, `bower.json`.

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
      - run: yarn install
      - uses: resideo/actions/twistlock@master
        with:
          consoleURL: https://us-east1.cloud.twistlock.com/us-1-113032316
          username: ${{ secrets.TWISTLOCK_CLOUD_USERNAME }}
          password: ${{ secrets.TWISTLOCK_CLOUD_PASSWORD }}
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
    - run: yarn install
    - uses: resideo/actions/twistlock@master
      with:
        consoleURL: https://us-east1.cloud.twistlock.com/us-1-113032316
        username: ${{ secrets.TWISTLOCK_CLOUD_USERNAME }}
        password: ${{ secrets.TWISTLOCK_CLOUD_PASSWORD }}
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
      - run: docker pull node:14 # module dependencies should already be on the image
      - name: Run Twistlock
        uses: resideo/actions/twistlock@master
        with:
          consoleURL: https://us-east1.cloud.twistlock.com/us-1-113032316
          username: ${{ secrets.TEMP_TWISTCLI_USERNAME }}
          password: ${{ secrets.TEMP_TWISTCLI_PASSWORD }}
          image: node:14
```
