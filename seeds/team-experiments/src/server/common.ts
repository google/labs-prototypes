import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const MODULE_PATH = dirname(fileURLToPath(import.meta.url));
const ROOT_PATH = resolve(MODULE_PATH, "../../");

export const root = () => {
  return ROOT_PATH;
};
