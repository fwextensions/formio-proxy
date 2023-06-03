type Label = string;
type Path = (string|number)[];

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

interface Panel {
	components: Component[];
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

interface OutputPanel {
	components: OutputComponent[];
}

const NumberPattern = /^\d+\.\s+/;

const targetTypes = [
	"checkbox",
	"file",
	"radio",
	"selectboxes",
	"textfield",
	"textarea",
];

function getByPath(
	obj: Record<string|number, any>,
	path: Path)
{
	let current = obj;
	let next;

	for (const key of path) {
		next = current[key];

		if (typeof next !== "undefined") {
			current = next;
		} else {
			break;
		}
	}

	return next;
}

function pushNumberedLabel(
	list: string[],
	label: string)
{
	list.push(`${list.length + 1}. ${label}`);
}

export function extract(
	panels: Panel[])
{
	return panels.map((panel) => {
		const result: InputComponent[] = [];

		panel.components.forEach((component, ind) => {
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

		return { components: result };
	});
}

export function insert(
	outputPanels: OutputPanel[],
	panels: Panel[])
{

	outputPanels.forEach((outputPanel, panelIndex) => {
		const { components } = panels[panelIndex];

		if (!components.length) {
			return;
		}

		outputPanel.components.forEach((output) => {
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
	});

	return panels;
}

export function extractLabels(
	panels: Panel[]): [Label[], Path[], string[]]
{
	const labels: Label[] = [];
	const paths: Path[] = [];
	const existingKeys: string[] = [];

	panels.forEach((panel, panelIndex) => {
		panel.components.forEach((component, componentIndex) => {
			const { type, label, key, values } = component;

			if (targetTypes.includes(type)) {
				const componentPath = [panelIndex, "components", componentIndex];

				if (label) {
						// prepend a number to the label, as that seems to help the AI keep
						// track of them
					pushNumberedLabel(labels, label);
					paths.push([...componentPath]);
					existingKeys.push(key);
				}

				if (values) {
					values.forEach(({ label, value }, valueIndex) => {
						pushNumberedLabel(labels, label);
						paths.push([...componentPath, "values", valueIndex]);
						existingKeys.push(value);
					});
				}
			}
		});
	});

	return [labels, paths, existingKeys];
}

export function insertKeys(
	panels: Panel[],
	paths: Path[],
	keys: string[],
	existingKeys: string[])
{
	paths.forEach((path, i) => {
		const key = keys[i].replace(NumberPattern, "");
		const target = getByPath(panels, path);

		if (target) {
			if (path.includes("values")) {
				const existingKey = existingKeys[i];
				const parent = getByPath(panels, path.slice(0, -2));

				target.value = key;

					// if the new key is the same as the existing one, we don't need to
					// make any changes to the parent component
				if (parent && key !== existingKey) {
					parent.defaultValue[key] = parent.defaultValue[existingKey];
					delete parent.defaultValue[existingKey];
				}
			} else {
				target.key = key;
			}
		} else {
			throw new Error(`Bad path: ${path}`);
		}
	});

	return panels;
}
