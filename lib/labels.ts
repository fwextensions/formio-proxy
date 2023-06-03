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
