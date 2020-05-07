module.exports = {
  extends: [
    "eslint:recommended",
    "bamboo",
  ],
  plugins: ["simple-import-sort"],
  env: {
    es6: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    project: "./tsconfig.eslint.json"
  },
  rules: {
    "@typescript-eslint/restrict-plus-operands": 0,
    "comma-dangle": ["error", "always-multiline"],
    // Keep this at the top for convenience.
    "simple-import-sort/sort": [
      "error",
      {
        groups: [
          // Side effect imports.
          ["^\\u0000"],

          // Node.js builtins.
          [
            `^(${require("module").builtinModules.join("|")})(/|$)`,
          ],

          // Internal packages.
          [`^(@|${Object.keys(require("./package.json")._moduleAliases).join("|")})(/.*|$)`],

          // Namespaced packages.
          ["^@?\\w"],

          // Parent imports. Put `..` last.
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],

          // Other relative imports. Put same-folder imports and `.` last.
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
        ],
      },
    ],
    quotes: ["error", "double", { avoidEscape: true }],
    "max-len": ["error", 120, 2],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/member-ordering": ["error", {
      default: [
        "public-static-field",
        "protected-static-field",
        "private-static-field",
        "static-field",
        "public-static-method",
        "protected-static-method",
        "private-static-method",
        "static-method",
        "public-instance-field",
        "protected-instance-field",
        "private-instance-field",
        "public-field",
        "protected-field",
        "private-field",
        "instance-field",
        "field",
        "constructor",
        "public-instance-method",
        "protected-instance-method",
        "private-instance-method",
        "public-method",
        "protected-method",
        "private-method",
        "instance-method",
        "method",
      ],
    }],
    "padded-blocks": "off",
    "no-mixed-operators": "off",
    "prefer-destructuring": ["error", {
      VariableDeclarator: {
        array: false,
        object: true,
      },
      AssignmentExpression: {
        array: true,
        object: true,
      },
    }, {
        enforceForRenamedProperties: false,
      }
    ],
  },
};
