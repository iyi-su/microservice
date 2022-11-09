import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(join(dirname(__filename), "../../"));