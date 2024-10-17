const journeyDefaultFlow = [
  {
    type: "title",
    required: true,
    stepNumber: 1,
  },
  {
    type: "form",
    required: false,
    stepNumber: 2,
  },
  {
    type: "payment",
    required: false,
    stepNumber: 3,
  },
  {
    type: "messaging",
    required: false,
    stepNumber: 4,
  },
];

export default journeyDefaultFlow;
