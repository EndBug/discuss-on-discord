import {ThreadChannel} from 'discord.js';
import {Inputs} from './io';

export const DISCORD_CHANNEL_PREFIX = 'https://discord.com/channels/';

/**
 * Creates a GitHub issue comment link
 * @param issue The issue input
 * @param commentID The ID of the comment
 */
export function getIssueCommentLink(issue: Inputs['issue'], commentID: number) {
  return `https://github.com/${issue.repo.owner}/${issue.repo.name}/issues/${issue.number}#issuecomment-${commentID}`;
}

/**
 * Creates a Discord thread link
 * @param thread The Discord.js ThreadChannel instance of the thread
 */
export function getThreadLink(thread: ThreadChannel) {
  return `https://discord.com/channels/${thread.guildId}/${thread.id}`;
}

/** Checks if a string is a Discord link */
export function isDiscordLink(str: string) {
  const ids = str.slice(DISCORD_CHANNEL_PREFIX.length).split('/');

  return (
    str.startsWith(DISCORD_CHANNEL_PREFIX) &&
    ids.length >= 1 &&
    ids.length <= 3 &&
    ids.every(id => id && id.match(/^\d+$/))
  );
}

/** Parses a Discord link into guild, channel, and message */
export function parseDiscordLink(str: string): {
  guild: string;
  channel: string | undefined;
  message: string | undefined;
} {
  const [guild, channel, message] = str
    .slice(DISCORD_CHANNEL_PREFIX.length)
    .split('/')
    .slice(0, 3);

  return {
    guild,
    channel,
    message,
  };
}

/**
 * Replaces `$THREAD_LINK$` with the given link
 * @param str The string to replace the link in
 * @param link The link to replace with
 */
export function replaceThreadLink(str: string, link: string) {
  return str.replace(/(\$THREAD_LINK\$)/g, link);
}
