import test from "ava";
import { KitBuilder } from "../src/kits/builder.js";
import { Board } from "../src/board.js";

test("KitBuilder can wrap a function", async (t) => {

  // A normal function that will be wrapped.
  const echo = (input: string) => input;
  const test = (input: string) => input;

  const MyKit = KitBuilder.wrap({ url: "test" }, { echo, test });

  const board = new Board({
    title: "Test Echo",
    description: "Test Breadboard Kit",
    version: "0.0.1",
  });

  const myKit = board.addKit(MyKit);

  t.true(myKit.echo instanceof Function);
  t.true(myKit.test instanceof Function);
});


test("KitBuilder can call a function that returns a string", async (t) => {

  // A normal function that will be wrapped.
  const echo = (echo_this: string) => echo_this;

  const MyKit = KitBuilder.wrap({ url: "test" }, { echo });

  const board = new Board({
    title: "Test Echo",
    description: "Test Breadboard Kit",
    version: "0.0.1",
  });

  const myKit = board.addKit(MyKit);

  const input = board.input();
  const echoNode = myKit.echo();

  input.wire("an_input->echo_this", echoNode);
  // result because it's just a string from a dynamic function
  echoNode.wire("result->an_output", board.output());

  const output = await board.runOnce({
    "an_input": "hello world"
  });

  t.is((<string>output["an_output"]), "hello world");

});

test("KitBuilder can call a function that returns an object", async (t) => {

  // A normal function that will be wrapped.
  const echo = (echo_this: string) => { 
    return { "out": echo_this, "other": "stuff" } 
  };

  const MyKit = KitBuilder.wrap({ url: "test" }, { echo });

  const board = new Board({
    title: "Test Echo",
    description: "Test Breadboard Kit",
    version: "0.0.1",
  });

  const myKit = board.addKit(MyKit);

  const input = board.input();
  const echoNode = myKit.echo();

  input.wire("an_input->echo_this", echoNode);
  // result because it's just a string from a dynamic function
  echoNode.wire("out->an_output", board.output());

  const output = await board.runOnce({
    "an_input": "hello world"
  });

  t.is((<string>output["an_output"]), "hello world");

});

test("KitBuilder can call a function that has more than one input", async (t) => {

  // A normal function that will be wrapped.
  const add = (a: number, b: number) => { 
    return a + b; 
  };

  const MyKit = KitBuilder.wrap({ url: "test" }, { add });

  const board = new Board({
    title: "Test Echo",
    description: "Test Breadboard Kit",
    version: "0.0.1",
  });

  const myKit = board.addKit(MyKit);

  const inputA = board.input();
  const inputB = board.input();
  const addNode = myKit.add();

  inputA.wire("a->a", addNode);
  inputB.wire("b->b", addNode);
  // result because it's just a string from a dynamic function
  addNode.wire("result->", board.output());

  const output = await board.runOnce({
    "a": 1,
    "b": 2
  });

  t.is((<number>output["result"]), 3);
});