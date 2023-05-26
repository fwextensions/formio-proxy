interface ValueItem {
	label: string;
	value: string;
	shortcut: string;
}

type DefaultsMap = Record<string, boolean>;

export interface Component {
	type: string;
	label?: string;
	values?: ValueItem[];
	defaultValue?: DefaultsMap|boolean,
	[key: string]: any;
}

interface InputComponent {
	type: string;
	label?: string;
	options?: { label: string }[];
	ind: number;
}

interface OutputComponent {
	type: string;
	label?: string;
	id: string,
	options?: { label: string, id: string }[];
	ind: number;
}

const targetTypes = [
	"checkbox",
	"file",
	"radio",
	"selectboxes",
	"textfield",
	"textarea",
];

export function extract(
	components: Component[])
{
	const result: InputComponent[] = [];

	components.forEach((component, ind) => {
		const { type, label, values } = component;

		if (targetTypes.includes(type)) {
			result.push({ type, label: label || "", ind });

			if (values) {
				result.push({
					type: "choices",
					options: values.map(({ label }) => ({ label })),
					ind
				});
			}
		}
	});

	return result;
}

export function insert(
	outputComponents: OutputComponent[],
	components: Component[])
{
	outputComponents.forEach((output) => {
		const { type, id, ind, options } = output;
		const target = components[ind];
		const { values, defaultValue } = target;

		if (target && (target.type === type
				|| (options && values && options.length === values.length))) {
			if (options && values && defaultValue) {
				const newDefaultValue: DefaultsMap = {};

					// update the value key of each item in the values array with the new
					// id returned by OpenAI.  also build up a map of the default values
					// using the new id's.
				options.forEach(({ id }, i) => {
					const item = values[i];

					newDefaultValue[id] = defaultValue[item.value];
					item.value = id;
				});

				target.defaultValue = newDefaultValue;
			} else {
				target.key = id;
			}
		} else {
			throw new Error(`Missing "${type}" at ${ind}.`);
		}
	});

	return components;
}
