module.exports = sortGeneList = (list) => {
  const responsePriorityMap = {
    Pathogenic: 1,
    "Pathogenic/Likely pathogenic": 2,
    "Likely pathogenic": 3,
    "Uncertain significance": 4,
    VUS: 5,
  };

  return list
    .filter((item) => responsePriorityMap[item.DrugResponse])
    .map((item) => ({
      ...item,
      priority: responsePriorityMap[item.DrugResponse],
    }))
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.Gene.localeCompare(b.Gene);
    });
};
