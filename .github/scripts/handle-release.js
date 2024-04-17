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

  const name = `TypeScript SDK - ${envVars.currentVersion} Prerelease`;

  const changelog = await getChangelog(ctx, envVars);
  const release = await getPreRelease(ctx, envVars);

  if (release !== null) {
    ctx.core.info(`Release Exists: ${release.data.id}`);
    // update release
  } else {
    const createReleaseResult = await ctx.github.rest.repos.createRelease({
      owner: ctx.context.repo.owner,
      repo: ctx.context.repo.repo,
      tag_name: envVars.newTag,
      body: changelog.body,
      name,
      // name: changelog.name,
      prerelease: true,
    });

    ctx.core.info(
      `Created Release ${createReleaseResult.data.id}: ${createReleaseResult.data.name}`,
    );
  }
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
async function getChangelog(ctx, vars) {
  ctx.core.info(
    `Generating changelog for ${vars.prevReleaseTag}..${vars.newTag}`,
  );

  const result = await ctx.github.rest.repos.generateReleaseNotes({
    owner: ctx.context.repo.owner,
    repo: ctx.context.repo.repo,
    tag_name: vars.newTag,
    configuration_file_path: ".github/ts-release-config.yml",
    previous_tag_name: vars.prevReleaseTag,
  });

  ctx.core.info(result.data.body);

  return result.data;
}

/**
 * @param {import('github-script').AsyncFunctionArguments} ctx
 * @param {EnvVars} vars
 */
async function getPreRelease(ctx, vars) {
  if (!vars.prevPreRelease) {
    return null;
  }

  try {
    const release = await ctx.github.rest.repos.getReleaseByTag({
      owner: ctx.context.repo.owner,
      repo: ctx.context.repo.repo,
      tag: vars.prevPreRelease || "some-non-tag",
    });

    console.log(release);

    return release;
  } catch (e) {
    // TODO: Improve logging
    ctx.core.info(e.message);

    return null;
  }
}
