# @u1f992/rehype-wrap-text

```js
const vivliostyleConfig = {
  /* ... */
  documentProcessor: (opts, meta) =>
    VFM(opts, meta)
      .use(
        wrapText.bind(null, {
          selector: "pre code",
          pattern: /␣/g,
          tagName: "span",
          props: {
            style: "font-size: 50%; font-weight: bold; color: gray;",
          },
        }),
      )
      .use(
        wrapText.bind(null, {
          selector: "p",
          pattern: /〓.+〓/g,
          tagName: "strong",
          transform: (elem) => {
            elem.textContent = elem.textContent.slice(1, -1);
          },
        }),
      ),
  /* ... */
};
```

````markdown
`␣`によるスペースの〓可視化〓。

```c
int␣main(void)␣{
␣␣␣␣printf("Hello␣World\n");
␣␣␣␣return␣0;
}
```
````

![](image.png)
