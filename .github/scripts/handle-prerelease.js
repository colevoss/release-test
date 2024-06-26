// @ts-check

/**
 * This script is repsonsible for generating a changelog for a pre-release version
 * and creating or updating the previous Github release with the new pre-release
 * version.
 *
 * @param {import('github-script').AsyncFunctionArguments} ctx
 */
module.exports = async (ctx) => {
  /** @type {EnvVars} */
  let envVars;

  try {
    envVars = getEnvVariables();
  } catch (e) {
    ctx.core.setFailed(e.message);
    return;
  }

  const name = `[PRE] ${envVars.newTag}`;

  const changelog = await getChangelog(ctx, envVars);
  const release = await getPreRelease(ctx, envVars);

  /** @type {string} */
  let releaseUrl;

  if (release !== null) {
    ctx.core.info(`Updating Release...: ${release.data.id}`);

    const updatedReleaseResult = await ctx.github.rest.repos.updateRelease({
      release_id: release.data.id,
      owner: ctx.context.repo.owner,
      repo: ctx.context.repo.repo,
      tag_name: envVars.newTag,
      body: changelog.body + releaseInstructions,
      name,
      prerelease: true,
    });

    releaseUrl = updatedReleaseResult.data.html_url;
    ctx.core.summary.addRaw("Updated Release ", false);

    ctx.core.info(`Updated Release: ${updatedReleaseResult.data.id}`);
  } else {
    ctx.core.info(`Creating prerelease...: ${envVars.newTag}`);

    const createReleaseResult = await ctx.github.rest.repos.createRelease({
      owner: ctx.context.repo.owner,
      repo: ctx.context.repo.repo,
      tag_name: envVars.newTag,
      body: changelog.body + releaseInstructions,
      name,
      prerelease: true,
    });

    releaseUrl = createReleaseResult.data.html_url;

    ctx.core.summary.addRaw("Created Release ", false);
    ctx.core.info(
      `Created Release ${createReleaseResult.data.id}: ${createReleaseResult.data.name}`,
    );
  }

  ctx.core.summary.addLink(name, releaseUrl);
  ctx.core.summary.addDetails(
    "Changelog",
    changelog.body + releaseInstructions,
  );
  ctx.core.summary.addEOL();
  ctx.core.summary.write();
};

/**
 * @typedef {Object} EnvVars - Environment varibles that should be set for this script
 * @property {string} prevReleaseTag
 * @property {string} currentVersion
 * @property {string} newTag
 * @property {string=} prevPreRelease
 */

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
 * Generate a changelog for the new/updated pre-release
 *
 * @param {import('github-script').AsyncFunctionArguments} ctx
 * @param {EnvVars} vars
 *
 * @see https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#generate-release-notes-content-for-a-release
 */
async function getChangelog(ctx, vars) {
  ctx.core.info(
    `Generating changelog for ${vars.prevReleaseTag}..${vars.newTag}`,
  );

  const releaseConfig = getReleaseConfigFile();

  const result = await ctx.github.rest.repos.generateReleaseNotes({
    owner: ctx.context.repo.owner,
    repo: ctx.context.repo.repo,
    tag_name: vars.newTag,
    configuration_file_path: releaseConfig,
    previous_tag_name: vars.prevReleaseTag ?? undefined,
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

  ctx.core.debug(`Generating release notes...`);

  try {
    const release = await ctx.github.rest.repos.getReleaseByTag({
      owner: ctx.context.repo.owner,
      repo: ctx.context.repo.repo,
      tag: vars.prevPreRelease || "some-non-tag",
    });

    ctx.core.info(`Generated release notes`);

    return release;
  } catch (e) {
    // TODO: Improve logging
    ctx.core.info(e.message);

    return null;
  }
}

/**
 * @returns {string}
 */
function getReleaseConfigFile() {
  const config = process.env.RELEASE_CONFIG;

  return config ?? "";
}

const releaseInstructions = `
\n
## Release Instructions

<details>
  <summary>Click here to see instructions for publishing this version!</summary>

1. Edit this release (pencil icon in top left).
2. Rename the release with the following format \`<language>-sdk-v<desired-release-version>\` where:
  - \`lanuage\` is the language of the package
    - \`typescript\`
    - \`kotlin\`
  - \`desired-release-version\` is the version to publish
    - This should be determined by reading the changelog of this release
  - Example:
    - \`typescript-sdk-v1.2.3\`
    - \`kotlin-sdk-v3.2.1\`
3. Uncheck the \`Set as pre-release\` checkmark under the description text area
4. Update Release
</details>
`;
