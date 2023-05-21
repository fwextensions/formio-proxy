import { NextRequest, NextResponse } from "next/server";
import cors from "@/lib/cors";

const url = process.env.BASE_URL ?? "";
const token = process.env.TOKEN ?? "";

export const config = {
	runtime: "edge",
};

export default async (request: NextRequest) => {
console.log("url", url, token);

//	const reqText = await request.text();
//console.log("req", reqText.slice(0, 100), "derp");

//	const proxiedRequest = new NextRequest(request, {
//		headers: {
//			"Content-Type": "application/json",
//			"x-token": token,
//		}
//	});
//	request.headers.append("Content-Type", "application/json");
//	request.headers.append("x-token", token);

//	return fetch(url, {
//	const response = await fetch(url + "/form", proxiedRequest);
//	const response = await fetch(url + "/form", {
//		method: "POST",
//		headers: {
//			"Content-Type": "application/json",
//			"x-token": token,
//		},
//		body: request.body
//	});

//	const proxiedRequest = new NextRequest(url + "/form", {
//		method: request.method,
//		headers: {
//			"Content-Type": "application/json",
//			"x-token": token,
//		},
//		body: request.body
//	});

	const response = await fetch(url + "/form", {
		method: request.method,
		headers: Object.assign({},
			request.headers,
			{
				"Content-Type": "application/json",
				"x-token": token,
			}
		),
		body: request.body
	});

	return cors(request, response);
//	return response;

// this just returns an empty JSON object
//	return cors(request, NextResponse.json(response.json()));

//	return response.json();
//	return NextResponse.json(response.json());

//	return NextResponse.json({
//		name: `Hello, from ${request.url} I'm now an Edge Function!`,
//	});
};
