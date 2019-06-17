export const makeUniqueName = (prefix, hash) => {
  let i = 0;
  let name = `${prefix}_${i}`;

  while (hash[name]) {
    i += 1;
    name = `${prefix}_${i}`;
  }

  return name;
};
