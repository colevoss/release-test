// @ts-check

/**
 * @typedef {Object} EnvVars - Environment varibles that should be set for this script
 * @property {string} currentVersion
 * @property {string} newTag
 * @property {string=} prevTag
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

function getEnvVariables() {
  const { CURRENT_VERSION, NEW_TAG, PREV_TAG } = process.env;

  if (CURRENT_VERSION === undefined) {
    throw new Error("CURRENT_VERSION environment variable is not present");
  }

  if (NEW_TAG === undefined) {
    throw new Error("NEW_TAG environment variable is not present");
  }

  return {
    currentVersion: CURRENT_VERSION,
    newTag: NEW_TAG,
    prevTag: PREV_TAG,
  };
}
