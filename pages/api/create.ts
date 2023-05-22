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

	return cors(request, response);
};
