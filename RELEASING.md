# Releasing Generative Charts

The publishable workspace is `packages/chartkit`; the root workspace is private.

## Validate and package

From the repository root, run:

```sh
npm ci
npm run release:check
npm run pack:release
```

The checks validate lint, application and library types, unit tests, tarball contents, source map targets, preserved client directives, and isolated React 18/19 installations. Consumer types are compiled with strict checking and both NodeNext and Bundler module resolution, including the CSS export.

`pack:release` writes `generative-charts-<version>.tgz` to the repository root. It contains compiled ESM, declarations, CSS, original sources for source maps, the README, changelog, and MIT license. It excludes the gallery, credentials, test output, and development dependencies.

## Publish

Authenticate interactively in your terminal; do not put credentials in this repository or chat:

```sh
npm login --registry=https://registry.npmjs.org
npm whoami --registry=https://registry.npmjs.org
npm run publish:package
```

`publish:package` reruns the release checks before publishing the library workspace to the public npm registry. Complete any npm authentication or two-factor prompt locally. The name and version cannot be reused after publication. For subsequent releases, update the package version, lockfile, and changelog before repeating these steps.

The source repository is [kasturikhanke/generativecharts](https://github.com/kasturikhanke/generativecharts). Local publication does not request provenance. Once the repository is public and a supported trusted publisher is configured, enable provenance in that CI release workflow. See [npm's provenance requirements](https://docs.npmjs.com/generating-provenance-statements/).

## Verify publication

```sh
npm view generative-charts@0.2.0 version dist.integrity --registry=https://registry.npmjs.org
```

Install that registry version in a fresh application, import `generative-charts/styles.css`, and render a chart. After registry verification succeeds, update the release status and publish any accompanying gallery changes. Versions `0.1.0` and `0.2.0` are published; `0.2.0` is the public launch release. Package publication does not change the site's access policy.
