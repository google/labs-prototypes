import { signal, useSignalEffect } from '@preact/signals';
import { useRef } from 'preact/hooks';
import graph from './graphs/simplest.graph';
import './app.css'

import { Header } from './components/header.tsx';

import { Board } from "@google-labs/breadboard";
import mermaid from "mermaid";

export function MermaidApp() {
  const graphUrl = signal(graph);

  const run = async (e) => {
    const { files } = e.target;
    graphUrl.value = URL.createObjectURL(files[0]);
  };

  useSignalEffect(async () => {
    const url = graphUrl.value;
    const board = await Board.load(url);
    const { svg } = await mermaid.render('mermaid', board.mermaid());
    mermaidRef.current.innerHTML = svg;
  });

  const mermaidRef = useRef();
  mermaid.initialize({ startOnLoad: false });

  return (
    <>
      <Header></Header>
      <h1>Breadboard viewer</h1>

      <div class="card output">
        <label>Mermaid</label>
        <pre class="mermaid" ref={mermaidRef}>
        </pre>
      </div>

      <input type="file" onChange={(e) => { run(e) }} value="Go" />
    </>
  )
}
