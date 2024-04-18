// @ts-check

const core = require("@actions/core");
const github = require("@actions/github");

try {
  const releaseName = core.getInput("release-name", { required: true });

  if (releaseName === "") {
    throw new Error("release-name input required");
  }

  const re = /^(?<lang>\w*)-sdk-v(?<version>\d+\.\d+\.\d+)$/;

  const match = releaseName.match(re);

  if (match === null) {
    throw new Error(`Invalid release name: ${releaseName}`);
  }

  // This should never happen but .groups is possibly undefined
  if (match.groups === undefined) {
    throw new Error(`No match groups found in release-name ${releaseName}`);
  }

  core.setOutput("lang", match.groups.lang);
  core.setOutput("version", match.groups.version);
} catch (e) {
  core.setFailed(e.message);
}
