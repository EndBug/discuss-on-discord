import * as core from '@actions/core';
import * as github from '@actions/github';
import {isDiscordLink, parseDiscordLink} from './utils';

interface RawInputs {
  destination: string;
  discord_bot_token: string;
  existing_discord_thread: string;
  github_token: string;
  issue_comment: string;
  issue_comment_tag: boolean;
  issue_number: string;
  issue_repo: string;
  discord_message: string;
}

export interface Inputs {
  destination: {
    guild: string;
    channel: string;
    message: string | undefined;
  };
  discord_bot_token: string;
  discord_message: string;
  existing_discord_thread: string | undefined;
  github_token: string;
  issue: {
    number: number;
    title: string;
    repo: {
      owner: string;
      name: string;
    };
  };
  issue_comment: string | undefined;
  issue_comment_tag: boolean;
}

export interface Outputs {
  comment_id: number;
  comment_link: string;
  thread_id: string;
  thread_link: string;
}

/**
 * Gets inputs from GitHub Actions and performs all preliminary input checks
 * @returns The input object
 */
export async function getInputs(): Promise<Inputs> {
  const raw: RawInputs = {
    destination: core.getInput('destination', {required: true}),
    discord_bot_token: core.getInput('discord_bot_token', {required: true}),
    existing_discord_thread: core.getInput('existing_discord_thread'),
    github_token: core.getInput('github_token', {required: true}),
    issue_comment: core.getInput('issue_comment', {required: true}),
    issue_comment_tag: core.getBooleanInput('issue_comment_tag', {
      required: true,
    }),
    issue_number: core.getInput('issue_number', {required: true}),
    issue_repo: core.getInput('issue_repo', {required: true}),
    discord_message: core.getInput('discord_message', {required: true}),
  };

  const octokit = github.getOctokit(raw.github_token);

  const inputs = {} as Inputs;

  // #region discord_bot_token
  if (raw.discord_bot_token.length === 0)
    throw new Error('discord_bot_token is empty');
  inputs.discord_bot_token = raw.discord_bot_token;
  // #endregion

  // #region destination
  if (!isDiscordLink(raw.destination))
    throw new Error('destination is not a valid Discord link');

  const dest = parseDiscordLink(raw.destination);
  if (!dest.channel)
    throw new Error('destination is not a valid channel/message link');

  inputs.destination = {
    guild: dest.guild,
    channel: dest.channel,
    message: dest.message || undefined,
  };
  // #endregion

  // #region discord_message
  if (!raw.discord_message && !inputs.destination.message)
    throw new Error(
      'discord_message is empty, but no existing message was provided'
    );
  inputs.discord_message = raw.discord_message;
  // #endregion

  // #region existing_discord_thread
  if (raw.existing_discord_thread) {
    if (!isDiscordLink(raw.existing_discord_thread))
      throw new Error('existing_discord_thread is not a valid channel link');

    const {guild, channel} = parseDiscordLink(raw.existing_discord_thread);
    if (!channel)
      throw new Error('existing_discord_thread is not a valid channel link');

    if (guild !== inputs.destination.guild)
      throw new Error(
        'existing_discord_thread is not in the same guild as destination'
      );
  }
  inputs.existing_discord_thread = raw.existing_discord_thread || undefined;

  // #region github_token
  if (!raw.github_token) throw new Error('github_token is empty');
  inputs.github_token = raw.github_token;
  // #endregion

  // #region issue_comment
  inputs.issue_comment = raw.issue_comment || undefined;
  // #endregion

  // #region issue_comment_tag
  inputs.issue_comment_tag = raw.issue_comment_tag;
  // #endregion

  // #region issue_number, issue_repo
  if (!raw.issue_number) throw new Error('issue_number is empty');
  if (!raw.issue_repo) throw new Error('issue_repo is empty');

  const [owner, repo_name] = raw.issue_repo.split('/');
  if (!owner || !repo_name)
    throw new Error('issue_repo is not in the owner/name');

  const issue_number = parseInt(raw.issue_number);
  if (isNaN(issue_number)) throw new Error('issue_number is not a number');

  const issue_title = (
    await octokit.rest.issues.get({
      owner,
      repo: repo_name,
      issue_number,
    })
  ).data.title;
  if (!issue_title) throw new Error('Could not get issue title');

  inputs.issue = {
    number: issue_number,
    repo: {
      owner,
      name: repo_name,
    },
    title: issue_title,
  };
  // #endregion

  return inputs as Inputs;
}

const outputs = {} as Outputs;

/** Lets you set an output that will also be logged */
export function setOutput<T extends keyof Outputs>(key: T, value: Outputs[T]) {
  core.setOutput(key, value);
  outputs[key] = value;
}

/**
 * Logs all cached outputs
 */
export function logOutputs() {
  core.startGroup('Outputs:');
  for (const key in outputs) {
    core.info(`${key}: ${outputs[key as keyof Outputs]}`);
  }
  core.endGroup();
}
