import { NextRequest } from "next/server";
import cors from "@/lib/cors";

const url = process.env.BASE_URL ?? "";
const token = process.env.TOKEN ?? "";

export const config = {
	runtime: "edge",
};

export default async (request: NextRequest) => {
	const { method, body } = request;
	const headers = Object.assign(
		{},
		request.headers,
		{
			"Content-Type": "application/json",
			"x-token": token,
		}
	);
	const response = await fetch(url + "/form", {
		method,
		headers,
		body
	});

	return cors(
		request,
			// we can't just use response.clone() here, as the headers still seem to
			// be immutable after cloning, but cors() needs to change them.  clone()
			// seems to work in localhost but throws an error on the server.
		new Response(response.body, {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		})
	);
};
