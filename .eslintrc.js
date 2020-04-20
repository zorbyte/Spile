/**
 * @license (GPL-2.0)
 * Copyright (C) 2020  GAwesomeBot Authors
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 * 
 * @url https://github.com/GAwesomeBot/bot/blob/development/.eslintrc.js
 * 
 * Modifications are as follows:
 * Rules such as indents and the addition of other configurations, plugins for the linting
 * of TypeScript and the upholding of code style opinions elsewhere in the project, of which is licensed under the LGPL-3.0.
 */

module.exports = {
  extends: [
    "eslint:recommended",
    "alloy",
    "alloy/typescript",
  ],
  plugins: ["promise", "simple-import-sort"],
  env: {
    node: true,
  },
  rules: {
    "constructor-super": "off",
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
          ["^(@|@structs|@lib|@root|@utils)(/.*|$)"],

          // Namespaced packages.
          ["^@?\\w"],

          // Parent imports. Put `..` last.
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],

          // Other relative imports. Put same-folder imports and `.` last.
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
        ],
      },
    ],
    "no-extra-parens": "off",
    "@typescript-eslint/no-extra-parens": ["warn", "all", { nestedBinaryExpressions: false }],
    "accessor-pairs": "warn",
    "array-callback-return": "error",
    "curly": ["error", "multi-line", "consistent"],
    "dot-location": ["error", "property"],
    "dot-notation": "error",
    "eqeqeq": "error",
    "no-console": "error",
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": ["error"],
    "no-floating-decimal": "error",
    "no-implied-eval": "error",
    // "@typescript-eslint/no-invalid-this": "error", (Pretty sure TypeScript handles this).
    "no-lone-blocks": "error",
    "no-multi-spaces": "error",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-new": "error",
    "no-octal-escape": "error",
    "no-return-assign": "error",
    "no-return-await": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-unmodified-loop-condition": "error",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": ["error", { "allowShortCircuit": true }],
    "no-useless-call": "error",
    "no-useless-concat": "error",
    "no-useless-escape": "error",
    "no-void": "error",
    "no-warning-comments": "off",
    "wrap-iife": "error",
    "yoda": "error",
    "no-label-var": "error",
    "no-shadow": "error",
    "no-undef-init": "error",
    "callback-return": "error",
    "handle-callback-err": "error",
    "no-mixed-requires": "error",
    "no-new-require": "error",
    "no-path-concat": "error",
    "array-bracket-spacing": "error",
    "block-spacing": "error",
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "comma-dangle": ["error", "always-multiline"],
    "comma-spacing": "error",
    "comma-style": "error",
    "computed-property-spacing": "error",
    "consistent-this": "error",
    "eol-last": "error",
    "func-names": "error",
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "indent": ["error", 2, { SwitchCase: 1 }],
    "key-spacing": "error",
    "keyword-spacing": "error",
    "no-param-reassign": "off",
    "max-params": "off",
    "max-depth": ["error", 8],
    "max-len": ["error", 140, 2],
    "max-nested-callbacks": ["error", { max: 4 }],
    "max-statements-per-line": ["error", { max: 2 }],
    "new-cap": "off",
    "newline-per-chained-call": ["error", { ignoreChainWithDepth: 3 }],
    "no-array-constructor": "error",
    "no-bitwise": "off",
    "no-inline-comments": "error",
    "no-lonely-if": "error",
    "no-mixed-operators": "off",
    "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1, maxBOF: 0 }],
    "no-new-object": "error",
    "no-trailing-spaces": ["error", { skipBlankLines: true }],
    "no-unneeded-ternary": "error",
    "no-whitespace-before-property": "error",
    "object-curly-newline": ["error", { "multiline": true, "consistent": true }],
    "object-curly-spacing": ["error", "always"],
    "operator-assignment": "error",
    "operator-linebreak": ["error", "after"],
    "padded-blocks": ["error", "never"],
    "quote-props": ["error", "as-needed"],
    "quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
    "semi-spacing": "error",
    "@typescript-eslint/semi": "error",
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    "space-in-parens": "error",
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    "spaced-comment": ["error", "always", { markers: ["/"] }],
    "unicode-bom": "error",
    "arrow-body-style": "error",
    "arrow-spacing": "error",
    "no-void": "off",
    "no-undefined": "error",
    "no-duplicate-imports": "error",
    "no-useless-computed-key": "error",
    "no-useless-constructor": "off",
    "prefer-arrow-callback": "error",
    "prefer-const": ["error", { destructuring: "all" }],
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
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "error",
    "rest-spread-spacing": "error",
    "radix": "off",
    "template-curly-spacing": "error",
    "yield-star-spacing": "error",
    "promise/no-return-wrap": "error",
    "promise/catch-or-return": "off",
    "promise/no-native": "off",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
    "promise/no-callback-in-promise": "warn",
    "promise/no-return-in-finally": "warn",
    "no-var": "error",
    "require-atomic-updates": "off",
    "no-useless-catch": "off",
    "no-prototype-builtins": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }]
  },
};