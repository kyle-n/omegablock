import { type AtpAgent } from '@atproto/api'

export default async function* omegaBlock(agent: AtpAgent, targetHandle: string) {
	const targetProfileResp = await agent.getProfile({ actor: targetHandle })
	const targetFollowersResp = await agent.app.bsky.graph.getFollowers({
		actor: targetProfileResp.data.did
	})
	const targetProfiles = [targetProfileResp.data, ...targetFollowersResp.data.followers]
	let allBlocked = true
	for await (const targetProfile of targetProfiles) {
		const blockResult = await blockUser(agent, targetProfile.did)
		yield { handle: targetProfile.handle, blocked: blockResult }
		allBlocked = allBlocked && blockResult
	}
	return { allBlocked, blockCount: targetProfiles.length }
}

type BlockResponse = {
	uri: string
	cid: string
	validationStatus: string
}

async function blockUser(agent: AtpAgent, targetHandle: string): Promise<boolean> {
	const targetProfile = await agent.getProfile({ actor: targetHandle })
	const blockResp = (await agent.app.bsky.graph.block.create(
		{ repo: agent.session?.did },
		{ subject: targetProfile.data.did, createdAt: new Date().toISOString() }
	)) as BlockResponse
	return blockResp.validationStatus === 'Valid'
}
