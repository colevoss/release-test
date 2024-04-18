// @ts-check

/** @param {import('github-script').AsyncFunctionArguments} ctx */
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

    ctx.core.summary.addRaw(`Language: ${language}`, true);
    ctx.core.summary.addRaw(`Version: ${version}`, false);

    ctx.core.summary.addTable([
      [
        { data: "Language", header: true },
        { data: "Version", header: true },
        { data: language, header: true },
        { data: version, header: true },
      ],
    ]);

    ctx.core.summary.write();
  } catch (e) {
    ctx.core.setFailed(e.message);
  }
};
