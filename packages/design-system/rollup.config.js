import scss from "rollup-plugin-scss";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

export default {
  input: ["index.js"],
  output: [
    {
      preserveModules: true,
      dir: "dist",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    copy({
      targets: [
        {
          src: "assets/*",
          dest: "dist/assets",
        },
      ],
    }),
    terser(),
    scss({
      fileName: "style.css",
      failOnError: true,
    }),
  ],
};
