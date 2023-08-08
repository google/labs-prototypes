import { signal } from '@preact/signals';
import { useRef } from 'preact/hooks';

import './app.css'

import { Header } from './components/header.tsx';

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";


const promptOutput = signal("");

export function CompletionApp() {
  const run = async (apiKey: string, text: string) => {
    const board = new Board();

    const input = board.input();
    const output = board.output();
    const kit = board.addKit(Starter);
    const completion = kit.generateText();

    const secrets: { [x: string]: string } = { "PALM_KEY": apiKey }

    const extras = { callback: (key: string): [string, string | undefined] => [key, secrets[key]] }

    kit.secrets(["PALM_KEY"], extras).wire("PALM_KEY", completion);

    input.wire("ask->text", completion);
    completion.wire("completion->receive", output);

    const result = await board.runOnce({
      ask: text,
    });

    console.log("result", result);

    promptOutput.value = result.receive;
  };

  const promptRef = useRef();
  const apikeyRef = useRef();

  return (
    <>
      <Header></Header>
      <h1>Completion demo</h1>

      <div class="card">
        <label for="apikey" >API key</label>
        <input id="apikey" type="text" ref={apikeyRef} placeholder="API key" />
      </div>

      <div class="card">
        <label for="prompt">Prompt</label>
        <textarea id="prompt" ref={promptRef} placeholder="Enter text here"></textarea>
      </div>

      <div class="card output">
        <label>Prompt Output</label>
        <div id="output">{promptOutput}</div>
      </div>

      <button onClick={() => { run(apikeyRef.current.value, promptRef.current.value) }}>Go</button>
    </>
  )
}
