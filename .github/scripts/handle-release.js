// @ts-check

/**
 * @typedef {Object} EnvVars - Environment varibles that should be set for this script
 * @property {string} prevReleaseTag
 * @property {string} currentVersion
 * @property {string} newTag
 * @property {string=} prevPreRelease
 */

/** @param {import('github-script').AsyncFunctionArguments} ctx */
module.exports = async (ctx) => {
  /** @type {EnvVars} */
  let envVars;

  try {
    envVars = getEnvVariables();
  } catch (e) {
    ctx.core.setFailed(e.message);
    return;
  }

  const release = await getPrerelease(ctx, envVars);
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

/**
 * @param {import('github-script').AsyncFunctionArguments} ctx
 * @param {EnvVars} vars
 */
async function getPrerelease(ctx, vars) {
  if (true || vars.prevPreRelease) {
    const release = await ctx.github.rest.repos.getReleaseByTag({
      owner: ctx.context.repo.owner,
      repo: ctx.context.repo.repo,
      tag: vars.prevPreRelease || "some-non-tag",
    });

    console.log(release);

    return release;
  }
}
