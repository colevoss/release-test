// @ts-check

/**
 * @typedef {Object} EnvVars - Environment varibles that should be set for this script
 * @property {string} prevReleaseTag
 * @property {string} currentVersion
 * @property {string} newTag
 * @property {string=} prevPreRelease
 */

/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ github, core, context }) => {
  /** @type {EnvVars} */
  let envVars;

  try {
    envVars = getEnvVariables();
  } catch (e) {
    core.setFailed(e.message);
    return;
  }

  console.log(envVars);
};

/**
 * Gets variables from environment and validates required variables are present
 *
 * @returns {EnvVars}
 */
function getEnvVariables() {
  const { CURRENT_VERSION, NEW_TAG, PREV_TAG, PREV_RELEASE_TAG } = process.env;

  if (CURRENT_VERSION === undefined) {
    throw new Error("CURRENT_VERSION environment variable is not present");
  }

  if (PREV_RELEASE_TAG === undefined) {
    throw new Error("PREV_RELEASE_TAG environment variable is not present");
  }

  if (NEW_TAG === undefined) {
    throw new Error("NEW_TAG environment variable is not present");
  }

  return {
    prevReleaseTag: PREV_RELEASE_TAG,
    currentVersion: CURRENT_VERSION,
    newTag: NEW_TAG,
    prevPreRelease: PREV_TAG,
  };
}
