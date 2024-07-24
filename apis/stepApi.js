// apis/stepApi.js
export const getMockSteps = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const steps = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
        resolve(steps);
      }, 1000);
    });
  };
  //模拟api
  