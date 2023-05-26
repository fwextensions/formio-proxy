import { Configuration, OpenAIApi } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { Component, extract, insert } from "@/lib/labels";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//Modify the following JSON array to add a unique "id" value for each item that has a "label" key. The "id" must be less than 33 characters long and should summarize the "label" as a camelCased string. The "id" must be unique across the list. If an item has an "options" array, add a similar "id" value to summarize each item's "optionLabel" key.

const PromptText = `Modify the following JSON array to add a unique "id" value for each item that has a "label" key. The "id" MUST be less than 33 characters long and MUST SUCCINCTLY summarize the "label" as a camelCased string. The "id" must be unique across the list. Ensure that each option within the "options" arrays also has a similar "id" value.
`;

function generatePrompt(
	components: object[])
{
	console.log(PromptText);
//	console.log(PromptText + JSON.stringify(components));
	return PromptText + JSON.stringify(components);
}

export default async function(
	req: NextApiRequest,
	res: NextApiResponse)
{
	if (!configuration.apiKey) {
		res.status(500).json({
			error: {
				message: "OpenAI API key not configured.",
			}
		});

		return;
	}

//	const { components = [] } = req.body;
//
//	if (components.length === 0) {
//		res.status(400).json({
//			error: {
//				message: "components list is empty.",
//			}
//		});
//
//		return;
//	}

	const components = Test;
	const input = extract(components);

	try {
		console.time("chat-request");

		const completion = await openai.createChatCompletion({
			model: "gpt-3.5-turbo-0301",
			messages: [
				{
					role: "system",
					content: "You are a helpful San Francisco city employee."
				},
				{
					role: "user",
					content: generatePrompt(input)
				}
			],
//			max_tokens: 1000,
//			temperature: 0.6,
			temperature: 0,
		});

		console.timeEnd("chat-request");
		console.log(completion.data.usage);

		const output = JSON.parse(completion.data.choices[0].message?.content ?? "[]");
		const result = insert(output, components);

		res.status(200).json({
			prompt: PromptText,
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
}

const Test: Component[] = [
	{
		"type": "htmlelement",
		"key": "goodNeighborPolicy",
		"label": "html",
		"tag": "div",
		"content": "<div style=\"white-space: pre-wrap;\">Good Neighbor Policy</div>",
		"className": "mb-40",
		"tableView": false,
		"input": false,
		"attrs": [
			{
				"attr": "",
				"value": ""
			}
		]
	},
	{
		"type": "htmlelement",
		"key": "referToTheRegulationsForDetails",
		"label": "Informational alert",
		"tag": "div",
		"content": "<span class=\"mr-2 \" data-icon=\"alert\"></span>\n<span>\nRefer to the regulations for details about the Good Neighbor Policy requirements.\n</span>\n",
		"className": "flex flex-items-start p-40 my-40 bg-blue-1",
		"tableView": false,
		"input": false,
		"lockKey": true,
		"source": "61b7cba855627e36d98108ca",
		"isNew": true,
		"attrs": [
			{
				"attr": "role",
				"value": "alert"
			}
		]
	},
	{
		"type": "htmlelement",
		"key": "aGoodNeighborPolicyDefinesHow",
		"label": "html",
		"tag": "div",
		"content": "<div style=\"white-space: pre-wrap;\">A Good Neighbor Policy defines how your physical business interacts with the neighborhood. \n\nFirst, meet with your neighbors and get feedback on your Good Neighbor Policy and upload proof of your outreach on the previous page. See the regulations for community outreach.</div>",
		"className": "mb-40",
		"tableView": false,
		"input": false,
		"attrs": [
			{
				"attr": "",
				"value": ""
			}
		]
	},
	{
		"type": "htmlelement",
		"key": "basedOnYourPreviouslySubmitted",
		"label": "Informational alert",
		"tag": "div",
		"content": "<span class=\"mr-2 \" data-icon=\"alert\"></span>\n<span>\nBased on your previously submitted forms, you are applying for the following permit types:\nStorefront retail\nConsumption\nDistributor\nIf this information is incorrect, please contact OOC to request a change.\n</span>\n",
		"className": "flex flex-items-start p-40 my-40 bg-blue-1",
		"tableView": false,
		"input": false,
		"lockKey": true,
		"source": "61b7cba855627e36d98108ca",
		"isNew": true,
		"attrs": [
			{
				"attr": "role",
				"value": "alert"
			}
		]
	},
	{
		"type": "selectboxes",
		"key": "selectTheTypesOfActivitiesYouAre",
		"tableView": false,
		"inputType": "checkbox",
		"optionsLabelPosition": "right",
		"label": "Select the types of activities you are choosing",
		"values": [
			{
				"label": "Cultivator or grower (indoor)",
				"value": "cultivatorOrGrowerIndoor",
				"shortcut": ""
			},
			{
				"label": "Nursery",
				"value": "nursery",
				"shortcut": ""
			},
			{
				"label": "Distributor",
				"value": "distributor",
				"shortcut": ""
			},
			{
				"label": "Manufacturer (nonvolatile",
				"value": "manufacturerNonvolatile",
				"shortcut": ""
			},
			{
				"label": "Manufacturer (volatile) ",
				"value": "manufacturerVolatile",
				"shortcut": ""
			},
			{
				"label": "Medical retailer (medical only)",
				"value": "medicalRetailerMedicalOnly",
				"shortcut": ""
			},
			{
				"label": "Retailer (medical and adult use)",
				"value": "retailerMedicalAndAdultUse",
				"shortcut": ""
			},
			{
				"label": "Delivery only retail (medical and adult use)",
				"value": "deliveryOnlyRetailMedicalAnd",
				"shortcut": ""
			},
			{
				"label": "Testing laboratory",
				"value": "testingLaboratory",
				"shortcut": ""
			}
		],
		"defaultValue": {
			"cultivatorOrGrowerIndoor": false,
			"nursery": false,
			"distributor": false,
			"manufacturerNonvolatile": false,
			"manufacturerVolatile": false,
			"medicalRetailerMedicalOnly": false,
			"retailerMedicalAndAdultUse": false,
			"deliveryOnlyRetailMedicalAnd": false,
			"testingLaboratory": false
		}
	},
	{
		"type": "htmlelement",
		"key": "allCannabisBusinessesMustProvide",
		"label": "html",
		"tag": "div",
		"content": "<div style=\"white-space: pre-wrap;\">All cannabis businesses must:\nProvide strong outside lighting to illuminate sidewalks and streets\nProvide enough ventilation that cannabis cannot be smelled from outside\nClean the area around yor business</div>",
		"className": "mb-40",
		"tableView": false,
		"input": false,
		"attrs": [
			{
				"attr": "",
				"value": ""
			}
		]
	},
	{
		"type": "checkbox",
		"key": "iCommitToTheAboveGoodNeighbor",
		"tableView": false,
		"input": true,
		"defaultValue": false,
		"label": "I commit to the above Good Neighbor requirements for my cannabis business permit."
	},
	{
		"type": "htmlelement",
		"key": "forStorefrontRetailYouMustBan",
		"label": "html",
		"tag": "div",
		"content": "<div style=\"white-space: pre-wrap;\">For storefront retail you must:\nBan littering and loitering in and around your business\nPut up signs to remind customers to keep the neighborhood peaceful\nPut up signs to ban littering and loitering\nPut up signs to keep driveways clear\nPut up signs banning cannabis smoking in public places. This includes sidewalks and business entrances\nEnsure all signs are prominent and well-lit at public entrances and exits\nBan double parking outside of your business\nSecure the premises within 50 feet of public entrances and exits</div>",
		"className": "mb-40",
		"tableView": false,
		"input": false,
		"attrs": [
			{
				"attr": "",
				"value": ""
			}
		],
		"conditional": {
			"json": {
				"or": [
					{
						"var": "data.selectTheTypesOfActivitiesYouAre.medicalRetailerMedicalOnly"
					},
					{
						"var": "data.selectTheTypesOfActivitiesYouAre.retailerMedicalAndAdultUse"
					}
				]
			}
		}
	},
	{
		"type": "checkbox",
		"key": "iCommitToTheAboveGoodNeighbor1",
		"tableView": false,
		"input": true,
		"defaultValue": false,
		"label": "I commit to the above Good Neighbor requirements for my cannabis business permit.",
		"conditional": {
			"json": {
				"or": [
					{
						"var": "data.selectTheTypesOfActivitiesYouAre.medicalRetailerMedicalOnly"
					},
					{
						"var": "data.selectTheTypesOfActivitiesYouAre.retailerMedicalAndAdultUse"
					}
				]
			}
		}
	},
	{
		"type": "htmlelement",
		"key": "toAllowConsumptionOfCannabis",
		"label": "html",
		"tag": "div",
		"content": "<div style=\"white-space: pre-wrap;\">To allow consumption of cannabis onsite you must:\nPlace “no smoking” signs where smoking is banned\nPlace “No consuming cannabis” signs where cannabis cannot be consumed\nAsk customers who are smoking or consuming cannabis in a prohibited area to stop\nEnsure all signs are prominent and well-lit at public entrances and exits</div>",
		"className": "mb-40",
		"tableView": false,
		"input": false,
		"attrs": [
			{
				"attr": "",
				"value": ""
			}
		],
		"conditional": {
			"json": {
				"or": [
					{
						"var": "data.selectTheTypesOfActivitiesYouAre.medicalRetailerMedicalOnly"
					},
					{
						"var": "data.selectTheTypesOfActivitiesYouAre.retailerMedicalAndAdultUse"
					}
				]
			}
		}
	},
	{
		"type": "checkbox",
		"key": "iCommitToTheAboveGoodNeighbor2",
		"tableView": false,
		"input": true,
		"defaultValue": false,
		"label": "I commit to the above Good Neighbor requirements for my cannabis business permit.",
		"conditional": {
			"json": {
				"or": [
					{
						"var": "data.selectTheTypesOfActivitiesYouAre.medicalRetailerMedicalOnly"
					},
					{
						"var": "data.selectTheTypesOfActivitiesYouAre.retailerMedicalAndAdultUse"
					}
				]
			}
		}
	},
	{
		"type": "radio",
		"key": "haveYouMadeMoreCommitmentsWith",
		"tableView": false,
		"input": true,
		"optionsLabelPosition": "right",
		"label": "Have you made more commitments with your neighbors?",
		"validate": {
			"required": true
		},
		"values": [
			{
				"label": "Yes, I have made more commitments with my neighbors",
				"value": "yesIHaveMadeMoreCommitmentsWith",
				"shortcut": ""
			},
			{
				"label": "No, I have not made other commitments with my neighbors other than the ones already mentioned",
				"value": "noIHaveNotMadeOtherCommitments",
				"shortcut": ""
			}
		],
		"defaultValue": {
			"yesIHaveMadeMoreCommitmentsWith": false,
			"noIHaveNotMadeOtherCommitments": false
		}
	},
	{
		"type": "textarea",
		"key": "describeTheOtherCommitmentsYou",
		"autoExpand": false,
		"tableView": true,
		"input": true,
		"label": "Describe the other commitments you made to your neighbors",
		"validate": {
			"required": true
		},
		"conditional": {
			"show": true,
			"when": "haveYouMadeMoreCommitmentsWith",
			"eq": "yesIHaveMadeMoreCommitmentsWith"
		}
	},
	{
		"type": "checkbox",
		"key": "iCommitToTheAboveAdditionalGood",
		"tableView": false,
		"input": true,
		"defaultValue": false,
		"label": "I commit to the above additional Good Neighbor commitments.",
		"conditional": {
			"show": true,
			"when": "haveYouMadeMoreCommitmentsWith",
			"eq": "yesIHaveMadeMoreCommitmentsWith"
		}
	}
];
