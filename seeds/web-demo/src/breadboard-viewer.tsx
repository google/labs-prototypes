import { signal, useSignalEffect } from '@preact/signals';
import { useRef } from 'preact/hooks';
import graph from './graphs/simplest.graph';

import { Board } from "@google-labs/breadboard";
import mermaid from "mermaid";

export function BreadboardViewerApp() {
  const graphUrl = signal(graph);
  const error = signal("");

  const run = async (e) => {
    const { files } = e.target;
    graphUrl.value = URL.createObjectURL(files[0]);
  };

  useSignalEffect(async () => {
    const url = graphUrl.value;
    try {
      const board = await Board.load(url);
      const { svg } = await mermaid.render('mermaid', board.mermaid());
      mermaidRef.current.innerHTML = svg;
    } catch (e) {
      error.value = e.message;
    }
  });

  const mermaidRef = useRef();
  mermaid.initialize({ startOnLoad: false });

  return (
    <>
      <h1>Breadboard viewer</h1>
      <p>This tool let's you view a breadboard graph file. Currently if your graph file contains a Kit that can't be resolved via a HTTP request, it will fail.</p>

      <div class="card output">
        <label>Mermaid</label>
        <pre class="mermaid" ref={mermaidRef}>
        </pre>
      </div>

      <input type="file" onChange={(e) => { run(e) }} value="Go" />
      <div>{error}</div>
    </>
  )
}
