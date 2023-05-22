import { Configuration, OpenAIApi } from "openai";
import { NextApiRequest, NextApiResponse } from "next";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const PromptText = `Modify the following JSON array to add a unique "id" value for each item that has a "label" key. The "id" should summarize the "label" as a camelCased string. The "id" must be less than 32 characters long and unique across the list. Ensure that each option within the "options" arrays also has a similar "id" value.
`;
//const PromptText = `Modify the following JSON array to add a unique "id" value for each item that has a "label" key. The "id" should summarize the "label" as a camelCased string that is less than 32 characters long and is unique across the list. Ensure that each option within the "options" arrays also has a similar "id" value.
//`;
//const PromptText = `Modify the following JSON array to add a unique "id" value for each item that has a "label" key. The "id" should summarize the "label" as a camelCased string that is less than 32 characters long and is unique across the list. Ensure that each option within the "options" arrays also has a similar "id" value. Do not include the "label" values in the result.
//`;

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

	try {
		const completion = await openai.createChatCompletion({
//		const completion = await openai.createCompletion({
			model: "gpt-3.5-turbo-0301",
			messages: [
				{
					role: "system",
					content: "You are a helpful San Francisco city employee."
				},
				{
					role: "user",
					content: generatePrompt(Test)
				}
			],
//			prompt: generatePrompt(components),
//			max_tokens: 1000,
//			temperature: 0.6,
			temperature: 0.2,
		});
console.log(completion.data.usage);

		res.status(200).json({
			prompt: PromptText,
			result: JSON.parse(completion.data.choices[0].message?.content ?? "[]")
		});
//		res.status(200).json({ result: completion.data.choices[0].text });
	} catch (error) {
		if (error.response) {
			console.error(error.response.status, error.response.data);
			res.status(error.response.status).json(error.response.data);
		} else {
			console.error(`Error with OpenAI API request: ${error.message}`);
			res.status(500).json({
				error: {
					message: "An error occurred during your request.",
				}
			});
		}
	}

//	try {
//		const completion = await openai.createCompletion({
//			model: "text-davinci-003",
//			prompt: generatePrompt(Test),
////			prompt: generatePrompt(components),
//			max_tokens: 1000,
////			temperature: 0.6,
//			temperature: 0.2,
//		});
//console.log(completion.data.usage);
////console.log(completion.data.choices[0].text.slice(0, 50));
//
//		res.status(200).json({
//			prompt: PromptText,
//			result: JSON.parse(completion.data.choices[0].text ?? "[]")
//		});
////		res.status(200).json({ result: completion.data.choices[0].text });
//	} catch (error) {
//		if (error.response) {
//			console.error(error.response.status, error.response.data);
//			res.status(error.response.status).json(error.response.data);
//		} else {
//			console.error(`Error with OpenAI API request: ${error.message}`);
//			res.status(500).json({
//				error: {
//					message: "An error occurred during your request.",
//				}
//			});
//		}
//	}
}

const Test = [
  {
    "type": "radio",
    "label": "Are you an existing medical cannabis dispensary?",
    "options": [
      {
        "label": "Yes"
      },
      {
        "label": "No"
      }
    ]
  },
  {
    "type": "selectboxes",
    "label": "What will you provide for equity businesses?",
    "options": [
      {
        "label": "Rent-free space"
      },
      {
        "label": "Technical help, such as advice or mentoring"
      },
      {
        "label": "Other"
      }
    ]
  },
  {
    "type": "textfield",
    "label": "Other"
  },
  {
    "type": "selectboxes",
    "label": "How will you provide opportunities to people unfairly impacted by the War on Drugs?",
    "options": [
      {
        "label": "Hire staff who meet San Francsico’s equity criteria"
      },
      {
        "label": "Provide job training for staff who meet equity criteria"
      },
      {
        "label": "Buy inventory from equity businesses"
      },
      {
        "label": "Donate to operations that support equity hiring practices"
      },
      {
        "label": "Other"
      }
    ]
  },
  {
    "type": "textfield",
    "label": "Other"
  },
  {
    "type": "selectboxes",
    "label": "How will your business help support San Francisco’s broader equity goals? ",
    "options": [
      {
        "label": "Donate cash or in-kind goods"
      },
      {
        "label": "Donate services or technical help"
      },
      {
        "label": "Provide paid employee time to help community organizations"
      },
      {
        "label": "Other"
      }
    ]
  },
  {
    "type": "textfield",
    "label": "Other"
  }
];
