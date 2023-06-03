import fs from "node:fs";
import { Configuration, OpenAIApi } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { extractLabels, insertKeys } from "@/lib/labels";
import createLocal from "@/lib/local";

const local = createLocal(import.meta.url);

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
	fn: Function
)
{
	return new Promise((
		resolve,
		reject) => {
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

const promptText = (count: number) => `Each line in the following list is the label of an HTML form element. The labels may be as short as "Yes" or "No". Replace each label with a camelCased identifier that best summarizes the label. Each label must be less than 33 characters long, must start with a lowercase letter and must be unique across the list. There are ${count} labels, so there must be ${count} identifiers in the response.

`;
//const PromptText = `Modify the following JSON array to add a unique "id" value for each item that has a "label" key. The "id" MUST be less than 33 characters long and MUST SUCCINCTLY summarize the "label" as a camelCased string. The "id" must be unique across the list. Ensure that each option within the "options" arrays also has a similar "id" value.
//`;

function generatePrompt(
	labels: string[])
{
console.log(promptText(labels.length));
	return promptText(labels.length) + labels.join("\n");
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

	const form = fs.readFileSync(local("form-sample.json"), "utf8");
	const panels = JSON.parse(form);

	if (panels.length === 0) {
		res.status(400).json({
			error: {
				message: "components list is empty.",
			}
		});

		return;
	}

	const [labels, paths, existingKeys] = extractLabels(panels);

//console.log("--- input", labels.join("\n").length, labels.join("\n"));
console.log("--- calling GPT");

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
					content: generatePrompt(labels)
				}
			],
			temperature: 0,
		});

		console.timeEnd("chat-request");
		console.log(completion.data.usage);

//		const [output] = JSON.parse(completion.data.choices[0].message?.content ?? "[]");
		const output = (completion.data.choices[0].message?.content || "").split("\n");

console.log("--- output", output?.length);
console.log(labels.map((label, i) => [label, output[i]]));
console.log("--- about to call insert");

//		const result = insert(output, components);
//
//		fs.writeFileSync(local("result.json"), JSON.stringify(result, null, 2));
		fs.writeFileSync(local("result.json"), JSON.stringify([panels, paths, output, existingKeys], null, 2));
//console.log(existingKeys.join("\n"));

		const result = insertKeys(panels, paths, output, existingKeys);

		res.status(200).json({
			result
		});
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
//	const input = extract(components);
//console.log("--- input", input.length, input[1]);
//console.log("--- calling GPT");
//
//	try {
//		console.time("chat-request");
//
//		const completion = await openai.createChatCompletion({
//			model: "gpt-3.5-turbo-0301",
//			messages: [
//				{
//					role: "system",
//					content: "You are a helpful employee of the City and County of San Francisco."
//				},
//				{
//					role: "user",
//					content: generatePrompt(input)
//				}
//			],
//			temperature: 0,
//		});
//
//		console.timeEnd("chat-request");
//		console.log(completion.data.usage);
//
////		const [output] = JSON.parse(completion.data.choices[0].message?.content ?? "[]");
//		const output = JSON.parse(completion.data.choices[0].message?.content ?? "[]");
//
//console.log("--- output", output?.length);
//
//console.log("--- about to call insert");
//
//		const result = insert(output, components);
//
//		fs.writeFileSync(local("result.json"), JSON.stringify(result, null, 2));
//
//		res.status(200).json({
//			result
//		});
//	} catch (error) {
//		if (error.response) {
//			console.error(error.response.status, error.response.data);
//			res.status(error.response.status).json(error.response.data);
//		} else {
//			console.error(`Error with OpenAI API request: ${error.message}.`, error);
//			res.status(500).json({
//				error: {
//					message: error.message || "An error occurred during your request.",
//				}
//			});
//		}
//	}
}
