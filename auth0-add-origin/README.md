# Auth0 Add Origin
`auth0-add-origin` will add a URL of your choosing to an Auth0 Client. This is especially useful for preview builds that have dynamic URLs.

## Requirements

### Event
This action is intended to run on the GitHub `pull_request` [event](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/events-that-trigger-workflows#pull-request-event-pull_request).

### Auth0
The action authenticates with Auth0 via a Machine-to-Machine Auth0 client. Instructions on how to create a M2M client can be found [here](https://auth0.com/blog/using-m2m-authorization/). Use this client's id / secret to populate `apiClientId`, and `apiClientSecret`, respectively. The M2M client will need to be granted the following scopes:
- `read:clients`
- `update:clients`

_Reminder: Ensure secrets are provided to the action via GitHub [secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)._

## Inputs

_* = required_

`domain` *: your auth0 tenant's domain

`apiClientId` *: the client ID of the machine-to-machine auth0 client

`apiClientSecret` *: the client Secret of the machine-to-machine auth0 client

`clientId` *: the ID of the auth0 client to be configured

`origin` *: the URL to be added to the client's 'Allowed Web Origins'

`callbackUrl`: the URL to be added to the client's 'Allowed Callback URLs'. Will default to `origin` if not provided.

`logoutUrl`: the URL to be added to the client's 'Allowed Logout URLs'. Will default to `origin` if not provided.

## Input Parameters
Sometimes these URLs will need to contain information about the GitHub event, such as the pull request number. `origin`, `callbackUrl`, and `logoutUrl` may make use of the [mustache](https://www.npmjs.com/package/mustache) syntax for interpolating variables from the [GitHub `event` object](https://developer.github.com/v3/activity/events/types/).


## Example Usage
```yaml
name: Auth0 Add Origin

on: pull_request

jobs:
  auth0-add-origin:
    name: Auth0 Add Origin
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: resideo/actions/auth0-add-origin@master
        with:
          domain: your-domain.auth0.com
          apiClientId: abcd1234
          apiClientSecret: ${{ secrets.AUTH0_CLIENT_SECRET }}
          clientId: efgh5678
          origin: https://deploy-preview-{{event.pull_request.number}}--yourapp.netlify.com
          callbackUrl: https://deploy-preview-{{event.pull_request.number}}--yourapp.netlify.com/authCallback
          logoutUrl: https://deploy-preview-{{event.pull_request.number}}--yourapp.netlify.com

```
