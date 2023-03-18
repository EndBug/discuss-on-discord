import {ThreadChannel} from 'discord.js';
import {Inputs} from './io';

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

/**
 * Replaces `$THREAD_LINK$` with the given link
 * @param str The string to replace the link in
 * @param link The link to replace with
 */
export function replaceThreadLink(str: string, link: string) {
  return str.replace(/(\$THREAD_LINK\$)/g, link);
}
