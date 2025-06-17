import { useState } from 'preact/hooks';

export function Admin() {
  const [value, setValue] = useState(0);

  return (
    <>
      <div class="">Counter: {value}</div>
      <button onClick={() => setValue(value + 1)}>Increment</button>
      <button onClick={() => setValue(value - 1)}>Decrement</button>
    </>
  )
}
