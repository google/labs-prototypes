import { render } from 'preact'
import Router from 'preact-router';
import { App } from './app.js'
import { PalmLiteApp } from './palm-lite.js'
import { CompletionApp } from './completion.js'
import { MermaidApp } from './mermaid.js'
import './index.css'

const route = location.hash || `#path=index`;

const Main = () => (
  <Router>
    <App path="/" />
    <CompletionApp path="/completion" />
    <MermaidApp path="/breadboard" />
    <PalmLiteApp path="/palm-lite" />
  </Router>
);

render(<Main />, document.getElementById('app'));