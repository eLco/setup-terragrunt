const os = require('os');
const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const { Octokit } = require("@octokit/rest");

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch) {
  const mappings = {
    x32: '386',
    x64: 'amd64',
    arm: 'arm64'
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(os) {
  const mappings = {
    darwin: 'darwin',
    win32: 'windows',
    linux: 'linux'
  };
  return mappings[os] || os;
}

function getOctokit() {
  const options = {};
  const token = core.getInput('github_token');
  if (token) {
    core.debug('Using token authentication for Octokit');
    options.auth = token;
  }

  return new Octokit(options);
}

function getDownloadObject(releaseData) {
  const platform = os.platform();
  // If we're on Windows, then the executable ends with .exe
  const exeSuffix = platform.startsWith('win') ? '.exe' : '';
  const assetName = `terragrunt_${ mapOS(platform) }_${ mapArch(os.arch()) }${exeSuffix}`;
  let asset = releaseData.assets.find(obj => {
      return obj.name == assetName
  })

  const fullUrl = asset.browser_download_url;
  return {
    fullUrl
  };
}

async function resolveReleaseData(version) {
  const octokit = new getOctokit();
  let releaseData = null;

  let params = {
      owner: 'gruntwork-io',
      repo: 'terragrunt',
      headers: {
          accept: 'application/vnd.github.v3+json',
      }
  }

  if ((!version) || (version.toLowerCase() === 'latest')) {
      core.info("Get release info for latest version")
      releaseData = await octokit.repos.getLatestRelease(params).then(result => {
          return result.data;
      })
  } else {
      core.info(`Get release info for release ${version}`)
      params["tag"] = `v${version}`
      releaseData = await octokit.repos.getReleaseByTag(params).then(result => {
          return result.data;
      })
  }

  return releaseData
}

function isInstalled(version) {
  let toolPath;
  if (version) {
    toolPath = tc.find('terragrunt', version);
    return toolPath != undefined && toolPath !== '';
  }
  toolPath = tc.findAllVersions('terragrunt');
  return toolPath.length > 0;
}


async function downloadCLI (url) {
  core.debug(`Downloading Terragrunt CLI from ${url}`);
  const pathToCLI = await tc.downloadTool(url);
  core.debug(`Terragrunt CLI path is ${pathToCLI}.`);

  if (!pathToCLI) {
    throw new Error(`Unable to download Terragrunt from ${url}`);
  }
  core.debug(`Making Terragrunt binary executable`);
  await exec.exec("chmod", ["+x", pathToCLI]);

  return pathToCLI;
}

async function run() {
  try {
    // Get version of terragrunt cli to be installed
    const version = core.getInput('terragrunt_version');
    // Install the terragrunt if not already present
    if (!isInstalled(version)) {
      // Download the specific version of the terragrunt
      const releaseInfo = await resolveReleaseData(version);
      const download = getDownloadObject(releaseInfo);
      const pathToCLI = await downloadCLI(download.fullUrl);
      const cachedPath = await tc.cacheFile(pathToCLI, 'terragrunt', 'Terragrunt', version);
      // Expose terragrunt cli by adding it to the PATH
      core.addPath(cachedPath);
    } else {
        const toolPath = tc.find('terragrunt', version);
        core.addPath(toolPath);
    }
  } catch (error) {
    core.error(error);
    throw error;
  }
}

module.exports = run;
