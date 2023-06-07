import Cors from "cors";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

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

export default async function(
	req: NextApiRequest,
	res: NextApiResponse)
{
	await runMiddleware(req, res, cors);

	console.log("==== test ffssssssssssss");

	try {
		res.status(200).json({
			result: "ffs"
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error with OpenAI API request: ${error.message}.`, error);
			res.status(500).json({
				error: {
					message: error.message || "An error occurred during your request.",
				}
			});
		} else if (axios.isAxiosError(error) && error.response) {
			console.error(error.response.status, error.response.data);
			res.status(error.response.status).json(error.response.data);
		}
	}
}
