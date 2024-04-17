// @ts-check

/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
export default async ({ github, core, context }) => {
  const input = core.getInput("PREV_TAG", { required: true });

  core.info(`PREV TAG: ${input}`);
  core.debug("Running something at the moment");

  return context.actor;
};
