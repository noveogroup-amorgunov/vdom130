export const createVNode = (tagName, props = {}, ...children) => {
  if (typeof tagName === "function") {
    return tagName(props, children);
  }

  return {
    tagName,
    props,
    children: children.flat(),
  };
};

export const createDOMNode = vNode => {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }

  const { tagName, props, children } = vNode;

  const node = document.createElement(tagName);

  patchProps(node, {}, props);

  children.forEach(child => {
    node.appendChild(createDOMNode(child));
  });

  return node;
};

export const mount = (node, target) => {
  target.replaceWith(node);
  return node;
};

export const patchNode = (node, vNode, nextVNode) => {
  if (nextVNode === undefined) {
    node.remove();
    return;
  }

  if (typeof vNode === "string" || typeof nextVNode === "string") {
    if (vNode !== nextVNode) {
      const nextNode = createDOMNode(nextVNode);
      node.replaceWith(nextNode);
      return nextNode;
    }

    return node;
  }

  if (vNode.tagName !== nextVNode.tagName) {
    const nextNode = createDOMNode(nextVNode);
    node.replaceWith(nextNode);
    return nextNode;
  }

  patchProps(node, vNode.props, nextVNode.props);
  patchChildren(node, vNode.children, nextVNode.children);

  return node;
};

const patchProp = (node, key, value, nextValue) => {
  if (key.startsWith("on")) {
    const eventName = key.slice(2);

    node[eventName] = nextValue;

    if (!nextValue) {
      node.removeEventListener(eventName, listener);
    } else if (!value) {
      node.addEventListener(eventName, listener);
    }
    return;
  }

  if (nextValue == null || nextValue === false) {
    node.removeAttribute(key);
    return;
  }

  node.setAttribute(key, nextValue);
};

const patchProps = (node, props, nextProps) => {
  const mergedProps = { ...props, ...nextProps };

  Object.keys(mergedProps).forEach(key => {
    if (props[key] !== nextProps[key]) {
      patchProp(node, key, props[key], nextProps[key]);
    }
  });
};

const patchChildren = (parent, vChildren, nextVChildren) => {
  parent.childNodes.forEach((childNode, i) => {
    patchNode(childNode, vChildren[i], nextVChildren[i]);
  });

  nextVChildren.slice(vChildren.length).forEach(vChild => {
    parent.appendChild(createDOMNode(vChild));
  });
};

export const patch = (nextVNode, node) => {
  const vNode = node.v || recycleNode(node);

  node = patchNode(node, vNode, nextVNode);
  node.v = nextVNode;

  return node;
};

const TEXT_NODE_TYPE = 3;

const recycleNode = node => {
  if (node.nodeType === TEXT_NODE_TYPE) {
    return node.nodeValue;
  }

  const tagName = node.nodeName.toLowerCase();
  const children = [].map.call(node.childNodes, recycleNode);

  return createVNode(tagName, {}, children);
};

function listener(event) {
  return this[event.type](event);
}
