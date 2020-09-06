import { patch, createVNode } from "./vdom.js";

/*
const createVButton = props => {
  const { text, onclick } = props;

  return createVNode("button", { onclick }, [text]);
};

const createVApp = store => {
  const { count } = store.state;
  return createVNode("div", { class: "container", "data-count": count }, [
    createVNode("h1", {}, ["Hello, Virtual DOM"]),
    createVNode("div", {}, [`Count: ${count}`]),
    "Text node without tags",
    createVNode("img", { src: "https://i.ibb.co/M6LdN5m/2.png", width: 200 }),
    createVNode("div", {}, [
      createVButton({
        text: "-1",
        onclick: () => store.setState({ count: store.state.count - 1 })
      }),
      " ",
      createVButton({
        text: "+1",
        onclick: () => store.setState({ count: store.state.count + 1 })
      })
    ])
  ]);
};
*/

const createVApp = store => {
  const { count } = store.state;
  const decrement = () => store.setState({ count: store.state.count - 1 });
  const increment = () => store.setState({ count: store.state.count + 1 });

  return (
    <div {...{ class: "container", "data-count": String(count) }}>
      <h1>Hello, Virtual DOM</h1>
      <div>Count: {String(count)}</div>
      Text node without tags
      <img src="https://i.ibb.co/M6LdN5m/2.png" width="200" />
      <button onclick={decrement}>-1</button>
      <button onclick={increment}>+1</button>
    </div>
  );
};

const store = {
  state: { count: 0 },
  onStateChanged: () => {},
  setState(nextState) {
    this.state = nextState;
    this.onStateChanged();
  }
};

let app = patch(createVApp(store), document.getElementById("app"));

store.onStateChanged = () => {
  app = patch(createVApp(store), app);
};
