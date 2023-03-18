# Discuss on Discord

[![All Contributors](https://img.shields.io/github/all-contributors/EndBug/discuss-on-discord)](#contributors-)

You can use this GitHub action to automatically create a thread on Discord when a new issue is opened on GitHub.

## Table of contents

- [Inputs](#inputs)
- [Outputs](#outputs)
- [Examples](#examples)
- [Contributors](#contributors-)

## Inputs

Here's the complete list of inputs for this action, also available in the [action.yml](action.yml) file.  
For a minimal/typical usage, check out the [examples](#examples) section.

```yaml
- uses: EndBug/discuss-on-discord@v1
  with:
    # ⬇️ Required inputs ⬇️

    # The token to use to communicate with the Discord API
    # The bot should have permission to send messages and create threads in the channel
    discord_bot_token: ${{ secrets.DISCORD_BOT_TOKEN }}

    # The link to the message or channel to post messages and create threads in.
    # If a channel link is used, the thread will be created on a new message in
    # that channel. Otherwise, the thread will be created on the linked message.
    # Remember that each message can only have one thread, so if you use a message
    # link, make sure that the message doesn't already have one.
    destination: https://discord.com/channels/123456789012345678/123456789012345678

    # ⬇️ Optional inputs ⬇️

    # The body of the message to send in the Discord channel (if any)
    # Default: see action.yml
    discord_message: New issue!

    # The body of the comment to post on the issue; set it to an empty string to disable issue comments.
    # Any match of `$THREAD_LINK$` will be replaced with the link to the Discord thread.
    # Default: see action.yml
    issue_comment: 'Thread here: $THREAD_LINK$'

    # The issue number to create a thread for
    # Default: ${{ github.event.issue.number }}
    issue_number: 123

    # The repository that the issue is in
    # Default: ${{ github.repository }}
    issue_repo: octocat/Hello-World

    # The token to use to communicate with the GitHub API
    # Default: ${{ github.token }}
    github_token: ${{ secrets.PAT }}
```

## Outputs

The action provides these outputs:

- `comment_id`: The ID of the comment that was posted on the issue
- `comment_link`: The link to the comment that was posted on the issue
- `thread_id`: The ID of the thread that was created
- `thread_link`: The link to the thread that was created

## Examples

### Minimal usage

```yaml
on:
  issues:
    types: [opened]

permissions:
  issues: write

jobs:
  discord:
    runs-on: ubuntu-latest
    steps:
      - uses: EndBug/discuss-on-discord@v1
        with:
          discord_bot_token: ${{ secrets.DISCORD_BOT_TOKEN }}
          destination: https://discord.com/channels/123456789012345678/123456789012345678
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/EndBug"><img src="https://avatars.githubusercontent.com/u/26386270?v=4?s=100" width="100px;" alt="Federico Grandi"/><br /><sub><b>Federico Grandi</b></sub></a><br /><a href="https://github.com/EndBug/discuss-on-discord/commits?author=EndBug" title="Code">💻</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

### Additional credits

<table>
  <tr>
    <td align="center" width="14.28%" >
      <img width=100 src="https://avatars.githubusercontent.com/u/21289761?&v=4">
    </td>
    <td align="center" width="42.84%">
      This project has started thanks to the input of the <a href="https://githubcampus.expert" style="white-space: nowrap;">GitHub Campus Experts Program 🚩</a>
    </td>
  </tr>
</table>

## License

This action is distributed under the MIT license, check the [license](LICENSE) for more info.
