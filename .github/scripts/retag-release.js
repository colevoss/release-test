// @ts-check

/**
 * Retag the Github release with the published version's tag. The Github release
 * will be tagged with an rc tag but we want to update the release with the tag
 * created when the package was published
 *
 * @param {import('github-script').AsyncFunctionArguments} ctx
 */
module.exports = async (ctx) => {
  try {
    const tag = getNewTag();
    const releaseId = getReleaseId();
    const previousReleaseTag = getPreviousReleaseTag();

    const releaseConfig = getReleaseConfigFile();

    const changelogResult = await ctx.github.rest.repos.generateReleaseNotes({
      owner: ctx.context.repo.owner,
      repo: ctx.context.repo.repo,
      tag_name: tag,
      configuration_file_path: releaseConfig,
      previous_tag_name: previousReleaseTag,
    });

    const changelog = changelogResult.data;

    const updatedReleaseResult = await ctx.github.rest.repos.updateRelease({
      release_id: releaseId,
      owner: ctx.context.repo.owner,
      repo: ctx.context.repo.repo,
      tag_name: tag,
      body: changelog.body,
    });

    ctx.core.summary.addRaw("Updated release tag to ", false);
    ctx.core.summary.addLink(tag, updatedReleaseResult.data.html_url);
    ctx.core.summary.addDetails("Changelog", changelog.body);

    ctx.core.summary.write();
  } catch (e) {
    ctx.core.setFailed(e.message);
  }
};

/**
 * @returns {string}
 */
function getNewTag() {
  const newTag = process.env.NEW_TAG;

  if (!newTag) {
    throw new Error("NEW_TAG env variable absent.");
  }

  return newTag;
}

/**
 * @returns {number}
 */
function getReleaseId() {
  const releaseId = process.env.RELEASE_ID;

  if (!releaseId) {
    throw new Error("RELEASE_ID env variable absent.");
  }

  const releaseIdNum = Number(releaseId);

  if (isNaN(releaseIdNum)) {
    throw new Error("RELEASE_ID env variable must be a number.");
  }

  return releaseIdNum;
}

/**
 * @returns {string}
 */
function getPreviousReleaseTag() {
  const previousReleaseTag = process.env.PREV_RELEASE_TAG;

  if (!previousReleaseTag) {
    throw new Error("PREV_RELEASE_TAG env variable absent.");
  }

  return previousReleaseTag;
}

/**
 * @returns {string}
 */
function getReleaseConfigFile() {
  const config = process.env.RELEASE_CONFIG;

  return config ?? "";
}
