// @ts-check

/*
 * Copyright (C) 2025  Koutaro Mukai
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { JSDOM } from "jsdom";
import rehype from "rehype";

export function wrap(
  /** @type {{selector: string; pattern: RegExp; tagName: string; props?: Record<string,string>; transform?: (elem: HTMLElement) => void;}|undefined} */ opts,
) {
  if (!opts) {
    throw new Error("Options must not be omitted.");
  }
  const { selector, pattern, tagName, props, transform } = opts;
  const globalPattern = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g",
  );
  return (
    /** @type {import("unist").Node} */ tree,
    /** @type {import("vfile").VFile} */ file,
  ) => {
    const jsdom = new JSDOM(rehype().stringify(tree));
    const document = jsdom.window.document;

    document
      .querySelectorAll(selector)
      .forEach(function _(/** @type {ChildNode} */ node) {
        if (node.nodeType === 3 /* Node.TEXT_NODE */) {
          const parent = node.parentNode;
          const textContent = node.textContent;
          if (parent === null || textContent === null) {
            return;
          }

          let lastIndex = 0;

          // Find all pattern matches within the text
          for (const match of [...textContent.matchAll(globalPattern)]) {
            const index = match.index ?? 0;
            // Insert the text before the match
            if (index > lastIndex) {
              parent.insertBefore(
                document.createTextNode(textContent.slice(lastIndex, index)),
                node,
              );
            }
            // Insert the matched text wrapped in a <span>
            const span = document.createElement(tagName);
            if (props) {
              for (const [key, value] of Object.entries(props)) {
                span.setAttribute(key, value);
              }
            }
            span.textContent = match[0];
            if (transform) {
              transform(span);
            }
            parent.insertBefore(span, node);

            lastIndex = index + match[0].length;
          }
          // Insert any remaining text after the last match
          if (lastIndex < textContent.length) {
            parent.insertBefore(
              document.createTextNode(textContent.slice(lastIndex)),
              node,
            );
          }

          parent.removeChild(node);
        } else if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
          Array.from(node.childNodes).forEach(_);
        }
      });

    return rehype().parse(jsdom.serialize());
  };
}
