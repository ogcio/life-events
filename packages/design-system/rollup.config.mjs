import scss from "rollup-plugin-scss";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import packageJson from "./package.json" assert { type: "json" };
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import image from "@rollup/plugin-image";

export default [
  {
    input: ["index.ts"],
    output: [
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    ],
    plugins: [
      external(),
      resolve(),
      copy({
        targets: [
          {
            src: "assets/*",
            dest: "dist/assets",
          },
        ],
      }),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
      commonjs(),
      nodeResolve({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      }),
      postcss({
        extract: true,
        inject: true,
        plugins: [],
      }),
      image(),
    ],
    external: ["react", "react-dom"],
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    external: [/\.(sass|scss|css)$/, "react", "react-dom"],
    plugins: [dts()],
  },
  {
    input: "styles.js",
    output: [
      {
        file: "dist/style.css",
      },
    ],
    plugins: [
      scss({
        fileName: "style.css",
        failOnError: true,
      }),
    ],
  },
];
