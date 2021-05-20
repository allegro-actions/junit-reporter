# JUnit Reporter

Report JUnit test results as annotations on Github Pull Request and collect them on remote server.

# Usage

<!-- start usage -->
```yaml
- uses: allegro-actions/junit-reporter@v1
  # Execute action if previous job fails or succeeds, otherwise it won't report failurs
  # Default for workflows is success()
  if: ${{ success() || failure() }}
  with:
    # JUnit XML report path in glob format
    # Default: '**/TEST-*.xml'
    path: '**/test-results/*/*.xml'
```
<!-- end usage -->
## Code in Main

Install the dependencies
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)
```

## Change action.yml

The action.yml contains defines the inputs and output for your action.

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/allegro-actions/junit-reporter/actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action.
