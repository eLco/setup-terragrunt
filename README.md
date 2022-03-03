# setup-terragrunt

<p align="left">
  <a href="https://github.com/eLco/setup-terragrunt/actions"><img alt="setup-terragrunt status" src="https://github.com/eLco/setup-terragrunt/workflows/Tests/badge.svg"></a>
</p>

## About

The `eLco/setup-terragrunt` action is a JavaScript action that sets up [Terragrunt CLI](https://terragrunt.gruntwork.io/docs/getting-started/quick-start/) in your GitHub Actions workflow by:

- Downloading a specific version of Terragrunt CLI and adding it to the `PATH`.

After you've used the action, subsequent steps in the same job can run arbitrary Terragrunt commands using [the GitHub Actions `run` syntax](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstepsrun). This allows most Terragrunt commands to work exactly like they do on your local command line.

## Usage

This action can be run on `ubuntu-latest`, `windows-latest`, and `macos-latest` GitHub Actions runners, and will install and expose a specified version of the `terragrunt` CLI on the runner environment.

The default configuration installs the latest version of Terragrunt CLI.

Setup the `terragrunt` CLI, using latest version:

```yaml
steps:
  - uses: eLco/setup-terragrunt@v1
```

A specific version of the `terragrunt` CLI can be installed:

```yaml
steps:
  - uses: eLco/setup-terragrunt@v1
    with:
      terragrunt_version: 0.35.7
```

A specific version of the `terragrunt` CLI can be installed, using personal github token:

```yaml
steps:
  - uses: eLco/setup-terragrunt@v1
    with:
      terragrunt_version: 0.35.7
      github_token: ${{ secrets.PERSONAL_GITHUB_TOKEN }}
```

## Inputs

The actions supports the following inputs:

- `terragrunt_version`: (optional) The version of `terragrunt` to install, defaulting to `latest`
- `github_token`: (optional) if set, github_token will be used for Octokit authentication. Defaulting to GitHub App installation access token.

## License

[MIT](LICENSE).
