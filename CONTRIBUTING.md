## Thank you

First off, thanks for your interest in typed-graphlify and for wanting to contribute!

## Installation

After cheking out the repo, to install:

```
yarn install
```

And confirm that you can successfully build typed-graphqlify:

```
yarn build
```

And run test to confirm that everything works as expected:

```
yarn test
```

## Development process

- Fork it
- Add your commit
- Send PR to `master` branch

And then maintainer (currently only @acro5piano) will review your code. We might request changes, so please discuss with us.

## Release

@acro5piano will create a relase on GitHub.

- Create new branch from master e.g.) `git checkout -b 2.2.0`
- Edit `package.json` and bump version
- Add summary to `Changelog.md`
- Create a pull request to `master`
- Merge it
- Add new release from `master` on GitHub by tagging
- `npm publish`

## Versioning

We follow semantic versioning.
