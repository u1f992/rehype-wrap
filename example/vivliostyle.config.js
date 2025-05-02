// @ts-check

import { VFM } from "@vivliostyle/vfm";

import { wrap } from "../index.js";

/** @type {import('@vivliostyle/cli').VivliostyleConfigSchema} */
const vivliostyleConfig = {
  title: "rehype-wrap",
  author: "u1f992",
  language: "ja",
  theme: "./css",
  image: "ghcr.io/vivliostyle/cli:8.20.0",
  entry: ["manuscript.md"],
  output: ["./output.pdf"],
  workspaceDir: ".vivliostyle",
  documentProcessor: (opts, meta) =>
    VFM(opts, meta)
      .use(
        wrap.bind(null, {
          selector: "pre code",
          pattern: /␣/g,
          tagName: "span",
          props: {
            style: "font-size: 50%; font-weight: bold; color: gray;",
          },
        }),
      )
      .use(
        wrap.bind(null, {
          selector: "p",
          pattern: /〓.+〓/g,
          tagName: "strong",
          transform: (elem) => {
            elem.textContent = elem.textContent.slice(1, -1);
          },
        }),
      ),
};

export default vivliostyleConfig;
