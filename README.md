1. Create/Update {proj}-prerelease Github release on merge to main per project
-- Re-use changelog generation from current tag workflow
-- use ['prereleased', 'edited']
-- Check that release is still pre-release and not ready for release

2. When {proj}-prerelease Github release is updated, cut release for corresponding project
-- See [cut release demo file](./.github/workflows/cut-release.yml)


```ts
const rel = getRelease(`${proj}-pre`)

if (rel.isPrerelease) {

}

if (!rel) {
    createRelease()
}
```
