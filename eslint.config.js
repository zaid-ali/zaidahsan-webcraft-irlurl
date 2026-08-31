const js = require("@eslint/js");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "public/**",
      "vendor/**",
      "src/service-worker.js",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        Buffer: "readonly",
        CustomEvent: "readonly",
        EventTarget: "readonly",
        HTMLButtonElement: "readonly",
        HTMLImageElement: "readonly",
        HTMLElement: "readonly",
        MutationObserver: "readonly",
        SVGElement: "readonly",
        URL: "readonly",
        WebSocket: "readonly",
        __dirname: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        document: "readonly",
        fetch: "readonly",
        module: "readonly",
        navigator: "readonly",
        performance: "readonly",
        process: "readonly",
        requestAnimationFrame: "readonly",
        require: "readonly",
        self: "readonly",
        setTimeout: "readonly",
        window: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
