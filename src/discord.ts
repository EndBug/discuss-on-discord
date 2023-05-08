import * as core from '@actions/core';
import {
  Awaitable,
  ChannelType,
  Client,
  Message,
  ThreadAutoArchiveDuration,
  ThreadChannel,
} from 'discord.js';
import {Inputs} from './io';

/**
 * Creates the Discord.js client
 * @param inputs The action inputs
 */
export async function initClient(
  inputs: Inputs,
  callback: (client: Client<true>) => Awaitable<void>
) {
  core.startGroup('Initializing Discord client...');

  const client = new Client({
    intents: ['Guilds'],
  });

  client.on('error', core.setFailed);
  client.on('warn', core.warning);

  client.on('ready', callback);

  client.login(inputs.discord_bot_token);

  core.endGroup();
}

/**
 * Creates a Discord thread in the specified channel
 * @param client The Discord.js Client
 * @param inputs The actions inputs
 * @returns The ThreadChannel instance of the created thread
 */
export async function createThread(
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
    name: getThreadName(inputs),
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
  });

  core.info(`Created thread ${thread.id}`);
  core.endGroup();

  return thread;
}

/** Generates the thread name from the given inputs */
export function getThreadName(inputs: Inputs) {
  return `#${inputs.issue.number} - ${inputs.issue.title}`;
}

/**
 * Updates a thread's name
 * @param threadID The ID of the thread to update
 * @param client The Discord.js client
 * @param inputs The action inputs
 */
export async function updateThreadName(
  threadID: string,
  client: Client,
  inputs: Inputs
) {
  const thread = await client.channels.fetch(threadID);
  if (!thread?.isThread()) throw new Error('Could not fetch thread.');

  return thread.setName(getThreadName(inputs));
}
