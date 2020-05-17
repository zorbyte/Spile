module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:security/recommended",
    "bamboo",
  ],
  plugins: [
    "simple-import-sort",
    "security",
    "perf-standard"
  ],
  env: {
    es6: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    project: "./etc/tsconfig.eslint.json"
  },
  rules: {
    "object-curly-newline": ["error", {
      ImportDeclaration: {
        multiline: true,
        minProperties: 4,
        consistent: true,
      },
      ExportDeclaration: "never",
    }],
    "@typescript-eslint/space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    "@typescript-eslint/no-extra-parens": ["error"],
    /*"padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "block-like", next: "*" },
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
      { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var", "for", "return", "if"] },
      { blankLine: "always", prev: "import", next: "*" },
      { blankLine: "any", prev: "import", next: "import" },
    ],*/
    // TODO: Set this up on files which handle inbound data.
    "security/detect-object-injection": "off",
    "space-before-function-paren": "off",
    "perf-standard/no-instanceof-guard": "error",
    "perf-standard/no-self-in-constructor": "error",
    "perf-standard/check-function-inline": "off",
    "operator-linebreak": ["error", "before"],
    "sort-imports": "off",
    "import/order": "off",
    "no-console": "error",
    "no-implicit-coercion": "off",
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
    "multiline-ternary": "off",
    "max-len": ["error", 140, 2],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-process-exit": ["error"],
    "@typescript-eslint/indent": ["error", 2, {
      // flatTernaryExpressions: true,
      SwitchCase: 1,
    }],
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
  overrides: [
    {
      // Using the func module has its costs, but it is worth it.
      files: ["./src/cli/commands/**/*.ts", "./src/cli/options/**/*.ts"],
      rules: {
        "@typescript-eslint/no-extraneous-class": "off",
        "no-console": "off",
      },
    },
    {
      // Using the func module has its costs, but it is worth it.
      files: ["./src/index.ts"],
      rules: {
        "no-console": ["error", { allow: ["error"] }],
      },
    },
  ],
};
