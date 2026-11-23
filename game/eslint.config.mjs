// ESLint enforces the rules in /CLAUDE.md and docs/seed118_coding_rules.md.
// If a rule here and a rule in the docs disagree, fix one of them; never silence the rule inline.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const PACKAGES = ['sim', 'render', 'ui', 'runtime'];

/** Packages each layer may import (architecture contract, §3). */
const ALLOWED_DEPENDENCIES = {
    sim: [],
    render: ['sim'],
    ui: ['sim'],
    runtime: ['sim', 'render', 'ui'],
};

const forbiddenPackagesFor = (pkg) =>
    PACKAGES.filter((other) => other !== pkg && !ALLOWED_DEPENDENCIES[pkg].includes(other)).map(
        (other) => `@seed118/${other}`,
    );

const layerRules = Object.keys(ALLOWED_DEPENDENCIES).map((pkg) => ({
    files: [`packages/${pkg}/src/**/*.ts`],
    rules: {
        'no-restricted-imports': [
            'error',
            {
                patterns: [
                    {
                        group: forbiddenPackagesFor(pkg),
                        message: `Layer "${pkg}" may only import: ${ALLOWED_DEPENDENCIES[pkg].join(', ') || 'nothing'} (architecture §3).`,
                    },
                    {
                        group: ['@seed118/*/*'],
                        message:
                            'Import other packages only through their public index (e.g. "@seed118/sim").',
                    },
                    {
                        group: ['../../*/src/*', '../../../*/src/*'],
                        message: 'Do not reach into another package with relative paths.',
                    },
                ],
            },
        ],
    },
}));

export default tseslint.config(
    { ignores: ['**/node_modules/**', '**/dist/**', 'coverage/**'] },

    { linterOptions: { noInlineConfig: true } },

    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        rules: {
            // Clarity
            'no-var': 'error',
            'prefer-const': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'no-console': 'error',
            'no-else-return': 'error',
            'no-nested-ternary': 'error',

            // Size limits: split code before it becomes a mess
            'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
            'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
            'max-depth': ['error', 3],
            'max-params': ['error', 4],
            complexity: ['error', 12],

            // Types
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'default', format: ['camelCase'], leadingUnderscore: 'forbid' },
                { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
                { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
                { selector: 'typeLike', format: ['PascalCase'] },
                { selector: 'enumMember', format: ['PascalCase'] },
                { selector: 'import', format: null },
                { selector: 'objectLiteralProperty', format: null },
                { selector: 'typeProperty', format: null },
            ],
        },
    },

    // Simulation: deterministic, headless, no platform access (architecture §2, §12)
    {
        files: ['packages/sim/src/**/*.ts'],
        rules: {
            'no-restricted-globals': [
                'error',
                ...[
                    'window',
                    'document',
                    'performance',
                    'localStorage',
                    'fetch',
                    'setTimeout',
                    'setInterval',
                    'requestAnimationFrame',
                ].map((name) => ({ name, message: 'The simulation must not touch platform APIs.' })),
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'Math',
                    property: 'random',
                    message: 'Use the seeded hash functions (core/hash2d).',
                },
                { object: 'Date', property: 'now', message: 'Use the tick index, never wall-clock time.' },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector: "NewExpression[callee.name='Date']",
                    message: 'Use the tick index, never wall-clock time.',
                },
            ],
        },
    },

    ...layerRules,

    // Tests may be longer and use non-null assertions on known fixtures
    {
        files: ['packages/*/test/**/*.ts'],
        rules: {
            'max-lines-per-function': 'off',
            'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/unbound-method': 'off',
        },
    },

    // Config files are plain JS and not part of the TS project
    { files: ['**/*.mjs', '**/*.js'], ...tseslint.configs.disableTypeChecked },
    {
        files: ['**/*.mjs', '**/*.js'],
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/naming-convention': 'off',
        },
    },

    prettier,
);
