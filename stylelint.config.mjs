export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "declaration-no-important": true,
    "selector-max-id": 0,
    "max-nesting-depth": 2,
    "custom-property-empty-line-before": null,
    "import-notation": "string",
    "selector-class-pattern": [
      "^[a-z]+(?:-[a-z]+)*(?:(?:__|--)[a-z]+(?:-[a-z]+)*)?$",
      {
        message:
          "Class names use kebab-case blocks with optional __element or --modifier",
      },
    ],
  },
};
