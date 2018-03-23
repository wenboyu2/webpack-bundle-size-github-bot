# webpack-bundle-size-github-bot

Compares the webpack bundles sizes of each open Pull Request against the previously merged Pull Request. Posts the bundles sizes impacts as a comment in a Pull Request.

## Example Comment

https://github.com/wenboyu2/test-webpack/pull/2#issuecomment-374479447

## Getting Started

### Prerequisites

Bot Env

* node v8.9

Target Project

* webpack v4

CI

* Travis
* Jenkins (WIP)

### Installing

1.  Clone the repo
2.  `yarn install`

### Setup

1.  Create a `.env` file in the project root

```conf
CI=xxx                # jenkins or travis
CI_TOKEN=xxx          # CI token
CI_USERNAME=xxx       # required if using jenkins
CRON=*/10 * * * * *   # [optional] cron expression
GITHUB_OWNER=xxx      # github owner of the repo to run the bot on
GITHUB_REPO=xxx       # github repo to run the bot on
GITHUB_TOKEN=xxx      # github token
GITHUB_USERNAME=xxx   # github username
GITHUB_BASE_URL=xxx   # github base url
```

2.  Create a `bot.config.js` file in the project root, each object in the `bundles` array specifies a bundle name and bundle file name regex pattern

```js
module.exports = {
  bundles: [
    {
      name: "app",
      pattern: "app\\.js"
    },
    {
      name: "base",
      pattern: "base\\.js"
    }
  ]
};
```

## Usage

Run the bot once

```
yarn run start --once
```

Keep the bot running with the cron schedule

```
yarn run start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
