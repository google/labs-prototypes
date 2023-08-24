import { signal, useSignalEffect } from '@preact/signals';
import { useRef } from 'preact/hooks';
import simpleGraph from './graphs/simplest.graph';

import { Board } from "@google-labs/breadboard";
import { OutputValues, InputValues } from "@google-labs/graph-runner";

import mermaid from "mermaid";

const ask = async (inputs: InputValues): Promise<OutputValues> => {
  const defaultValue = "<Exit>";
  const message = ((inputs && inputs.message) as string) || "Enter some text";
  const input = prompt(message, defaultValue);
  if (input === defaultValue) return { exit: true };
  return { text: input };
};

export function REPLApp() {
  const mermaidRef = useRef();
  const graphRef = useRef();
  const resultsRef = useRef();
  const runButtonRef = useRef();

  const graphUrl = signal(simpleGraph);
  const graphJson = signal();
  const board = signal<Board | undefined>(undefined);

  const loadGraph = async (e) => {
    const { files } = e.target;
    graphUrl.value = URL.createObjectURL(files[0]);
  };

  const loadGraphJSON = async (e) => {
    const textArea = e.target;
    const jsonText = textArea.value;

    graphJson.value = jsonText;

    if (graphUrl.value) {
      URL.revokeObjectURL(graphUrl.value);
    }

    const blob = new Blob([jsonText], {type: "application/json"})

    // Kick off the rendering
    graphUrl.value = URL.createObjectURL(blob);
  };

  const runGraph = async () => {
    const url = graphUrl.value;
    const outputs = [];
    resultsRef.current.innerText = "";

    try {
      const currentBoard = await Board.load(url);
      board.value = currentBoard;

      for await (const result of currentBoard.run()) {
        if (result.seeksInputs) {
          result.inputs = await ask(result.inputArguments);
        }
        else {
          outputs.push(result.outputs);
        }
      }

      for (const output of outputs) {
        resultsRef.current.innerText += `${output.text}\n`

      }
    } catch (e) {
      resultsRef.current.innerText = e.message;
    }
  };

  useSignalEffect(async () => {
    const url = graphUrl.value;
    try {
      const board = await Board.load(url);
      graphJson.value = JSON.stringify(board, null, 2);

      const { svg } = await mermaid.render('mermaid', board.mermaid());
      mermaidRef.current.innerHTML = svg;
      runButtonRef.current.disabled = false;
    } catch (e) {
      runButtonRef.current.disabled = true;
      resultsRef.value = e.message;
    }
  });

  mermaid.initialize({ startOnLoad: false });

  return (
    <>
      <h1>Breadboard REPL</h1>
      <p>This tool let's you create, edit and run breadboards all in one place</p>

      <section class="repl">
        <div class="card graph">
          <fieldset>
            <legend>Graph</legend>
            <div class="fields">
              <textarea ref={graphRef} onInput={(e) => loadGraphJSON(e)}>{graphJson}</textarea>
              <input type="file" onChange={(e) => loadGraph(e)} value="Go" />
              <button class="primary" onClick={(e) => runGraph()} ref={runButtonRef} disabled>Run</button>
              <pre class="output" ref={resultsRef}>
              </pre>
            </div>
          </fieldset>
        </div>

        <div class="card mermaid">

          <fieldset>
            <legend>Mermaid</legend>
            <div ref={mermaidRef}>
            </div>
          </fieldset>
        </div>
      </section>
    </>
  )
}
