export const getMockSteps = () => {
  return new Promise((resolve) => {
    // Set a timeout to simulate an asynchronous API call with a delay of 1000 milliseconds (1 second)
    setTimeout(() => {
      // Generate a random number of steps between 1000 and 5000
      const steps = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
      // Resolve the promise with the generated steps value
      resolve(steps);
    }, 1000); // 1000 milliseconds delay
  });
};
