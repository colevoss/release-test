# Scripts

This directory contains Node.js scripts used in the various Github actions for
this repository. 

As of now, these scripts are ran in the workflows using the [action](https://github.com/actions/github-script)
which provides access to a Node.js runtime with a workflow aware context. These
scripts should be ported to actual github actions at some point.

There is a `package.json` in this directory simply for providing a TypeScript environment
and exposing the `@types/github-script@github:actions/github-script` package.

See: [Use scripts with jsDoc support](https://github.com/actions/github-script?tab=readme-ov-file#use-scripts-with-jsdoc-support)

## Development

In order to work on these scripts, you can navigate to this directory and install
the packages. Then your editor should be able to do type checking using JSDoc in the
files.

### Navigate

```bash
cd .github/scripts
```

### Install

```bash
npm install
```
