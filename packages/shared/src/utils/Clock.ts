export class Clock {
  now = () => {
    return Date.now();
  };
}

const clock = new Clock();

export default clock;
