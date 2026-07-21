import { configPresets, defineFlatConfig } from "html-validate";
import html5 from "html-validate/elements/html5";

export default defineFlatConfig([
  { elements: [html5] },
  configPresets["html-validate:recommended"],
]);
