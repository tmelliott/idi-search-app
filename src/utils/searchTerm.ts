const splitSearchTerm = (searchTerm: string) => {
  return searchTerm
    .split(" ")
    .map((x) => (x.length ? "+" + x + "*" : x))
    .join(" ");
};

export { splitSearchTerm };
