import * as core from '@actions/core';

import {createThread, initClient} from './discord';
import {commentOnIssue} from './github';
import {getInputs, setOutput} from './io';
import {getIssueCommentLink, getThreadLink} from './utils';

(async () => {
  core.startGroup('Checking inputs...');
  const inputs = await getInputs();
  core.endGroup();

  return initClient(inputs, async client => {
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

      core.info('Done! Exiting...');
      client.destroy();
      // eslint-disable-next-line no-process-exit
      process.exit();
    } catch (e) {
      core.endGroup();
      core.setFailed(e instanceof Error ? e : '' + e);
      client.destroy();
      // eslint-disable-next-line no-process-exit
      process.exit();
    }
  });
})().catch(e => {
  core.endGroup();
  core.setFailed(e);
});
