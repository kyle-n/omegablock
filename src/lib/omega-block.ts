import {AtpAgent} from '@atproto/api';

export default async function omegaBlock(agent: AtpAgent, targetHandle: string): Promise<boolean> {
  const targetProfileResp = await agent.getProfile({actor: targetHandle});
  const targetDid = targetProfileResp.data.did;
  const targetFollowers = await agent.app.bsky.graph.getFollowers({actor: targetDid})
  const targetFollowerDids = targetFollowers.data.followers.map(follower => follower.did)
  const targetDids = [targetDid, ...targetFollowerDids]
  for await (const did of targetDids) {
    const blockResult = await blockUser(agent, did)
    if (!blockResult) return false
  }
  return true
}

async function blockUser(agent: AtpAgent, targetHandle: string): Promise<boolean> {
  const targetProfile = await agent.getProfile({actor: targetHandle})
  const blockResp = await agent.app.bsky.graph.block.create(
    {repo: agent.session?.did},
    {subject: targetProfile.data.did, createdAt: new Date().toISOString()}
  ) as {uri: string, cid: string, validationStatus: string}
  return blockResp['validationStatus'] === 'valid'
}