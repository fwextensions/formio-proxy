import fs from "node:fs";
import Cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { extract, insert } from "@/lib/labels";
import createLocalPath from "@/lib/local";

const local = createLocalPath(import.meta.url);

	// Initializing the cors middleware
	// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
	methods: ["POST", "GET", "HEAD"],
});

	// Helper method to wait for a middleware to execute before continuing
	// And to throw an error when an error happens in a middleware
function runMiddleware(
	req: NextApiRequest,
	res: NextApiResponse,
	fn: Function)
{
	return new Promise((resolve, reject) => {
		fn(req, res, (result: any) => {
			if (result instanceof Error) {
				return reject(result);
			}

			return resolve(result);
		});
	});
}

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const PromptText = `Modify the items in each of the following "components" arrays to add a unique "id" value for each item that has a "label" key. The "id" MUST be less than 33 characters long and MUST SUCCINCTLY summarize the "label" as a camelCased string. The "id" must be unique across the list. Ensure that each option within the "options" arrays also has a similar "id" value.
`;

function generatePrompt(
	components: object[])
{
	return PromptText + JSON.stringify(components);
}

export default async function(
	req: NextApiRequest,
	res: NextApiResponse)
{
	await runMiddleware(req, res, cors);

	if (!configuration.apiKey) {
		res.status(500).json({
			error: {
				message: "OpenAI API key not configured.",
			}
		});

		return;
	}

	const components = req.body;

	if (components.length === 0) {
		res.status(400).json({
			error: {
				message: "components list is empty.",
			}
		});

		return;
	}

		// the GPT 3.5 model's limit of 4K tokens isn't enough to handle an entire
		// form's worth of labels, so run it just on panel #2
	const targetPanelIndex = 2;
	const targetPanel = [components[targetPanelIndex]];
	const input = extract(targetPanel);

	try {
		console.time("chat-request");

		const completion = await openai.createChatCompletion({
			model: "gpt-3.5-turbo-0301",
			messages: [
				{
					role: "system",
					content: "You are a helpful employee of the City and County of San Francisco."
				},
				{
					role: "user",
					content: generatePrompt(input)
				}
			],
			temperature: .2,
		});

		console.timeEnd("chat-request");
		console.log(completion.data.usage);
//console.log("---- result", completion.data);

		fs.writeFileSync(local("result.txt"), JSON.stringify(completion.data.choices ?? "[]"));

		const output = JSON.parse(completion.data.choices[0].message?.content ?? "[]");
//console.log("--- output", output.length, JSON.stringify(output[0], null, 2));

			// add the generated IDs to the target panel, which is at 0th index in the
			// output array, and then insert that back into the components that were posted
		components[targetPanelIndex] = insert(output, targetPanel)[0];

		res.status(200).json({
			result: components
		});

		fs.writeFileSync(local("result.json"), JSON.stringify(components, null, 2));
	} catch (error) {
		if (error.response) {
			console.error(error.response.status, error.response.data);
			res.status(error.response.status).json(error.response.data);
		} else {
			console.error(`Error with OpenAI API request: ${error.message}.`, error);
			res.status(500).json({
				error: {
					message: error.message || "An error occurred during your request.",
				}
			});
		}
	}
}
