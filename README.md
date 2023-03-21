# Plume MetaMask Snap

## Getting Started

Clone the repository and setup the development environment:

```shell
yarn install && yarn start
```

## Contributing

### Testing and Linting

Run `yarn test` to run the tests once.

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and fix any automatically fixable issues.

### Releasing & Publishing

The frontend is deployed with Vercel to [plume-snap.vercel.app](https://plume-snap.vercel.app/). To deploy the Gatsby app, run the required CLI commands (Vercel, Netlify, GitHub pages) to deploy the static site in `/packages/site`.

## Notes

- Babel is used for transpiling TypeScript to JavaScript, so when building with the CLI,
  `transpilationMode` must be set to `localOnly` (default) or `localAndDeps`.
