# Start And Check Action

Run a service or script and fail if stdout doesn't contain `checkForLog` or it returns with a non-zero exit code.

## Usage
```yaml
on: pull_request

jobs:
  job_name:
    name: Job Name
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: startup check
      uses: resideo/actions/start-and-check@master
      with:
        command: node dist/run/service
        checkForLog: 🚀 Server ready at http://localhost:8080/graphql
```
