import * as core from '@actions/core';
import * as github from '@actions/github';

import {createThread, initClient, updateThreadName} from './discord';
import {commentOnIssue} from './github';
import {getInputs, setOutput} from './io';
import {getIssueCommentLink, getThreadLink, parseDiscordLink} from './utils';
import {Client} from 'discord.js';

(async () => {
  core.startGroup('Checking inputs...');
  const inputs = await getInputs();
  core.endGroup();

  const exit = (client?: Client) => {
    core.info('Done! Exiting...');
    client?.destroy();
    // eslint-disable-next-line no-process-exit
    process.exit();
  };

  const commentAndExit = async (threadLink: string, client?: Client) => {
    const commentID = await commentOnIssue(inputs, threadLink);

    if (typeof commentID === 'number') {
      const commentLink = getIssueCommentLink(inputs.issue, commentID);

      setOutput('comment_id', commentID);
      setOutput('comment_link', commentLink);
    } else if (commentID !== null)
      throw new Error('Could not get a valid comment ID: ' + commentID);

    exit(client);
  };

  const handleDiscordError = (e: unknown, client: Client) => {
    core.endGroup();
    core.setFailed(e instanceof Error ? e : '' + e);
    client.destroy();
    // eslint-disable-next-line no-process-exit
    return process.exit();
  };

  let threadLink = inputs.existing_discord_thread;
  if (threadLink) {
    core.info('Using existing thread...');
    setOutput('thread_id', threadLink.split('/').pop()!);
    setOutput('thread_link', threadLink);

    if (github.context.payload.action === 'edited') {
      core.info('Issue has been edited, updating thread title...');
      return initClient(inputs, async client => {
        try {
          const {channel} = parseDiscordLink(threadLink!);
          if (!channel)
            throw new Error('Could not parse channel ID from thread link.');

          await updateThreadName(channel, client, inputs);
          exit(client);
        } catch (e) {
          return handleDiscordError(e, client);
        }
        return;
      });
    } else return commentAndExit(threadLink);
  } else
    return initClient(inputs, async client => {
      try {
        core.info('Creating a new thread...');
        const thread = await createThread(client, inputs);

        if (!thread || !thread.isThread())
          throw new Error('Could not create a valid thread link: ' + thread);

        threadLink = getThreadLink(thread);
        setOutput('thread_id', thread.id);
        setOutput('thread_link', threadLink);

        return commentAndExit(threadLink, client);
      } catch (e) {
        return handleDiscordError(e, client);
      }
    });
})().catch(e => {
  core.endGroup();
  core.setFailed(e);
});
