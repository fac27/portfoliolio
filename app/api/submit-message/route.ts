import OpenAI from 'openai'

export const POST = async (req: Request): Promise<Response> => {
	if (req.method !== 'POST') {
		const responseData = JSON.stringify({ error: 'Method not allowed' })
		return new Response(responseData, {
			status: 405,
			headers: {
				'Content-Type': 'application/json',
			},
		})
	}

	const body = await req.json()

	try {
		const { assistantId, threadId, message } = body

		const openai = new OpenAI()

		if (!process.env.OPENAI_API_KEY) {
			throw new Error('Missing env var from OpenAI')
		}

		await openai.beta.threads.messages.create(threadId, message)

		const run = await openai.beta.threads.runs.create(threadId, {
			assistant_id: assistantId,
		})

		let runStatus = null

		do {
			runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
			// Sleep for a short time before checking again
			await new Promise((resolve) => setTimeout(resolve, 1000))
		} while (runStatus.status !== 'completed')

		const messages = await openai.beta.threads.messages.list(threadId)

		const formattedMessages = messages.data.map((msg) => ({
			role: msg.role,
			content: msg.content[0].text.value,
		}))

		const responseData = JSON.stringify({ messages: formattedMessages })

		return new Response(responseData, {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		})
	} catch (error) {
		const responseData = JSON.stringify({ error: 'Server error' })

		return new Response(responseData, {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		})
	}
}
