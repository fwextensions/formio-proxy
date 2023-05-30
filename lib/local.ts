import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export default function createLocalPath(
	metaURL: string)
{
	return (path: string) => resolve(dirname(fileURLToPath(metaURL)), path);
}
