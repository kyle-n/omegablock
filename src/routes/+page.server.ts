  import { AtpAgent } from '@atproto/api'
  import { MY_PW } from '$env/static/private';

export async function load() {
  const agent = new AtpAgent({service: 'https://bsky.social'})
  await agent.login({identifier: 'kylenazario.com', password: MY_PW})
  const targetProfile = await agent.getProfile({actor: 'kn-tester-1.bsky.social'})
  const targetFollowers = await agent.app.bsky.graph.getFollowers({actor: targetProfile.data.did})
  const targetFollowerDids = targetFollowers.data.followers.map(follower => follower.did)
  const targetDids = [targetProfile.data.did, ...targetFollowerDids]
  const blockResults: boolean[] = []
  for await (const did of targetDids) {
    const blockResult = await blockUser(agent, did)
  }
  return {}
}

async function blockUser(agent: AtpAgent, targetHandle: string): Promise<boolean> {
  const targetProfile = await agent.getProfile({actor: targetHandle})
  const blockResp = await agent.app.bsky.graph.block.create(
    {repo: agent.session?.did},
    {subject: targetProfile.data.did, createdAt: new Date().toISOString()}
  ) as {uri: string, cid: string, validationStatus: string}
  return blockResp['validationStatus'] === 'valid'
}
