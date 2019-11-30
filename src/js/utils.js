const getNodeEndIndex = (list, nodeIndex) => {
  const node = list[nodeIndex];
  const map = {[node.id]: true};
  let end = nodeIndex + 1;

  for (; end < list.length; end++) {
    const n = list[end];
    if (!map[n.parent]) break;
    map[n.id] = true;
  }

  return end;
};

const getNeighborNodeIndex = (list, nodeId, direction) => {
  const nodeIndex = list.findIndex((n) => n.id === nodeId);
  const node = list[nodeIndex];
  const parentIndex = list.findIndex((n) => n.id === node.parent);

  for (let i = nodeIndex + direction; i > parentIndex && i < list.length; i += direction) {
    if (list[i].parent === node.parent) {
      return i;
    }
  }

  return -1;
};

const moveNode = (list, nodeId, direction) => {
  const startIndexA = list.findIndex((node) => node.id === nodeId);
  const startIndexB = getNeighborNodeIndex(list, nodeId, direction);

  if (startIndexB === -1) return;

  const endIndexA = getNodeEndIndex(list, startIndexA);
  const endIndexB = getNodeEndIndex(list, startIndexB);

  const itemsA = list.slice(startIndexA, endIndexA);
  const itemsB = list.slice(startIndexB, endIndexB);

  if (direction > 0) {
    return [...list.slice(0, startIndexA), ...itemsB, ...itemsA, ...list.slice(endIndexB)];
  }

  return [...list.slice(0, startIndexB), ...itemsA, ...itemsB, ...list.slice(endIndexA)];
};

module.exports = {moveNode, getNodeEndIndex};
