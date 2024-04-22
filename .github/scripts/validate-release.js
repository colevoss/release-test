// @ts-check

/**
 * Validate the new release name
 *
 * Name should follow this pattern:
 *
 * <language>-sdk-v<version>
 *
 * @example
 * typescript-sdk-v0.1.2
 * kotlin-sdk-v10.20.30
 *
 * @param {import('github-script').AsyncFunctionArguments} ctx
 */
module.exports = async (ctx) => {
  try {
    const releaseName = process.env.RELEASE_NAME ?? "";

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

    const language = match.groups.lang;
    const version = match.groups.version;

    ctx.core.setOutput("lang", match.groups.lang);
    ctx.core.setOutput("version", match.groups.version);

    ctx.core.summary.addRaw(`Valid release name: \`${releaseName}\``, true);

    ctx.core.summary.addHeading(`Language`, 3);
    ctx.core.summary.addCodeBlock(`${language}`, "text");

    ctx.core.summary.addHeading(`Version`, 3);
    ctx.core.summary.addCodeBlock(`${version}`, "text");

    ctx.core.summary.write();
  } catch (e) {
    ctx.core.setFailed(e.message);
  }
};
