import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import sveltePreprocess from "svelte-preprocess";
import path from "path";
import fs from "fs";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";

const production = !process.env.ROLLUP_WATCH;

function inlineSvelte(templatePath) {
  return {
    name: "Svelte Inliner",
    generateBundle(opts, bundle) {
      const file = path.parse(opts.file).base;
      const jsCode = bundle[file].code;
      //Rely on Svelte... const cssCode = bundle["bundle.css"].source;
      const template = fs.readFileSync(templatePath, "utf-8");
      bundle[file].code = template.replace("%%script%%", jsCode);
      //.replace("%%style%%", cssCode);
    },
  };
}

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default {
  input: "src/main.ts",
  output: {
    //sourcemap: true,
    //format: "iife",
    name: "app",
    file: "dist/index.html",
  },
  plugins: [
    svelte({
      emitCss: false,
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    css({ output: "bundle.css" }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
    !production && serve(),
    !production && livereload("dist"),
    //production && terser(),
    inlineSvelte("src/template.html"),
  ],
  watch: {
    clearScreen: false,
  },
};
