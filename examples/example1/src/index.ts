import { DummyClass } from 'placeholder-lib-name';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Vite + TypeScript</h1>
    <p class="read-the-docs">
      <div id="hello">${new DummyClass().sayHi()}</div>
    </p>
  </div>
`;
