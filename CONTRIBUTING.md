# Contributing

## Issues

With bugs and problems, please try to describe the issue as detailed as possible to help us reproduce it.

## Pull Requests

Before creating a pull request, please

- Make sure all guidelines are followed
- Make sure your branch is free of merge conflicts

## Development workflow

To get started with the project, run `yarn bootstrap` in the root directory to install the required dependencies for each package and cocoapods dependencies for the example app:

```sh
yarn bootstrap
```

> While it's possible to use [`npm`](https://github.com/npm/cli), the tooling is built around [`yarn`](https://classic.yarnpkg.com/), so you'll have an easier time if you use `yarn` for development.

While developing, you can run the [example app](/example/) to test your changes. Any changes you make in your library's JavaScript code will be reflected in the example app without a rebuild. If you change any native code, then you'll need to rebuild the example app.

To start the packager, run in the root directory:

```sh
yarn example start
```

To build and run the example app on Android:

```sh
yarn example android
```

To build and run the example app on iOS:

```sh
yarn example ios
```

To edit the Swift/Objective-C files, open `example/ios/BitmovinPlayerReactNativeExample.xcworkspace` in XCode and find the source files at `Pods > Development Pods > RNBitmovinPlayer`.

To edit the Kotlin files, open `example/android` in Android Studio and find the source files at `bitmovin-player-react-native` under `Android`.

## TypeScript Code Style

- Follow the `eslint` rules (`yarn lint`). They are inforced automatically via a pre-commit git hook.
- Always add return values to functions (even if `void`)
- No unused imports
- Public functions should be documented with a description that explains _what_ it does
- Every code block that does not obviously explain itself should be commented with an explanation of _why_ and _what_ it does

## Linting

### Typescript

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

Our pre-commit hooks verify that the linter and tests pass when committing.
Make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typescript
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

### Kotlin

For Kotlin code [ktlint](https://pinterest.github.io/ktlint/) is used with [ktlint gradle plugin](https://github.com/jlleitschuh/ktlint-gradle).
Run the following inside `android` folder to verify code format:

```sh
./gradlew ktlintCheck
```

To fix formatting errors, run the following inside `android` folder:

```sh
./gradlew ktlintFormat
```

You can add a lint check pre-commit hook by running inside `android` folder:

```sh
./gradlew addKtlintCheckGitPreCommitHook
```

and for automatic pre-commit formatting:

```sh
./gradlew addKtlintFormatGitPreCommitHook
```

## Testing

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

## Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

## Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn bootstrap`: setup project by installing all dependencies and pods.
- `yarn pods`: install pods only.
- `yarn build`: compile TypeScript files into `lib/` with ESBuild.
- `yarn typescript`: type-check files with TypeScript.
- `yarn lint`: lint files with ESLint.
- `yarn test`: run unit tests with Jest.
- `yarn example start`: start the Metro server for the example app.
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.
