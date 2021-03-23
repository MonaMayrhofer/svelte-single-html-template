import App from "./App.svelte";

window.addEventListener("load", function () {
  new App({
    target: document.body,
    props: {
      name: "world",
    },
  });
});

//export default app;
