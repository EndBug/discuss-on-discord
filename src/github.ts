import * as core from '@actions/core';
import * as github from '@actions/github';
import {Inputs} from './io';
import {replaceThreadLink} from './utils';

/**
 * Comments on the original issue with the thread link
 * @param inputs The action inputs
 * @param threadLink The link to the thread
 * @returns The ID of the comment if posted, `null` if disabled in inputs
 */
export async function commentOnIssue(
  inputs: Inputs,
  threadLink: string
): Promise<number | null> {
  if (!inputs.issue_comment) {
    core.info('Not going to comment on issue.');
    return null;
  }

  core.startGroup('Commenting on issue...');
  const octokit = github.getOctokit(inputs.github_token);

  const comment_tag = inputs.issue_comment_tag
    ? '\n\n<sup>🤖 This comment was automatically posted by <a href="https://github.com/EndBug/discuss-on-discord">Discuss on Discord</a></sup>'
    : '';

  const res = await octokit.rest.issues.createComment({
    owner: inputs.issue.repo.owner,
    repo: inputs.issue.repo.name,
    issue_number: inputs.issue.number,
    body: replaceThreadLink(inputs.issue_comment, threadLink) + comment_tag,
  });

  const commentID = res.data.id;

  core.info(`Commented on issue with comment ${commentID}`);
  core.endGroup();

  return commentID;
}
