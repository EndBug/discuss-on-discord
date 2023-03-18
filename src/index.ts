import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  ChannelType,
  Client,
  Message,
  ThreadAutoArchiveDuration,
  ThreadChannel,
} from 'discord.js';

import {getInputs, Inputs, setOutput} from './io';
import {getIssueCommentLink, getThreadLink, replaceThreadLink} from './utils';

(async () => {
  core.startGroup('Checking inputs...');
  const inputs = await getInputs();
  core.endGroup();

  return initClient(inputs);
})().catch(e => {
  core.endGroup();
  core.setFailed(e);
});

/**
 * Creates the Discord.js client
 * @param inputs The action inputs
 */
async function initClient(inputs: Inputs) {
  core.startGroup('Initializing Discord client...');

  const client = new Client({
    intents: ['Guilds'],
  });

  client.on('error', core.setFailed);
  client.on('warn', core.warning);

  client.on('ready', async client => {
    try {
      const thread = await createThread(client, inputs);

      if (!thread || !thread.isThread())
        throw new Error('Could not create a valid thread link: ' + thread);

      const threadLink = getThreadLink(thread);
      setOutput('thread_id', thread.id);
      setOutput('thread_link', threadLink);

      const commentID = await commentOnIssue(inputs, threadLink);

      if (typeof commentID === 'number') {
        const commentLink = getIssueCommentLink(inputs.issue, commentID);

        setOutput('comment_id', commentID);
        setOutput('comment_link', commentLink);
      } else if (commentID !== null)
        throw new Error('Could not get a valid comment ID: ' + commentID);
    } catch (e) {
      core.endGroup();
      core.setFailed(e instanceof Error ? e : '' + e);
      client.destroy();
      // eslint-disable-next-line no-process-exit
      process.exit();
    }
  });

  client.login(inputs.discord_bot_token);

  core.endGroup();
}

/**
 * Creates a Discord thread in the specified channel
 * @param client The Discord.js Client
 * @param inputs The actions inputs
 * @returns The ThreadChannel instance of the created thread
 */
async function createThread(
  client: Client,
  inputs: Inputs
): Promise<ThreadChannel> {
  core.startGroup('Creating thread...');
  core.info(`Logged in as ${client.user?.tag}`);

  const channel = await client.channels.fetch(inputs.destination.channel);
  if (!channel || channel.type !== ChannelType.GuildText)
    throw new Error(`${channel?.id} is not a text channel`);

  let message: Message;
  if (inputs.destination.message) {
    message = await channel.messages.fetch(inputs.destination.message);
    if (!message)
      throw new Error(`Message ${inputs.destination.message} not found`);
  } else {
    message = await channel.send(inputs.discord_message);
  }

  const thread = await message.startThread({
    name: `#${inputs.issue.number} - ${inputs.issue.title}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
  });

  core.info(`Created thread ${thread.id}`);
  core.endGroup();

  return thread;
}

/**
 * Comments on the original issue with the thread link
 * @param inputs The action inputs
 * @param threadLink The link to the thread
 * @returns The ID of the comment if posted, `null` if disabled in inputs
 */
async function commentOnIssue(
  inputs: Inputs,
  threadLink: string
): Promise<number | null> {
  if (!inputs.issue_comment) {
    core.info('Not going to comment on issue.');
    return null;
  }

  core.startGroup('Commenting on issue...');
  const octokit = github.getOctokit(inputs.github_token);

  const res = await octokit.rest.issues.createComment({
    owner: inputs.issue.repo.owner,
    repo: inputs.issue.repo.name,
    issue_number: inputs.issue.number,
    body: replaceThreadLink(inputs.issue_comment, threadLink),
  });

  const commentID = res.data.id;

  core.info(`Commented on issue with comment ${commentID}`);
  core.endGroup();

  return commentID;
}
