/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Edge,
  GraphDescriptor,
  InputValues,
  KitDescriptor,
  NodeConfiguration,
  NodeDescriptor,
  NodeHandlers,
  NodeTypeIdentifier,
  OutputValues,
  TraversalResult,
} from "@google-labs/graph-runner";

export interface Kit extends KitDescriptor {
  get handlers(): NodeHandlers;
}

export type BreadboardSlotSpec = Record<string, GraphDescriptor>;

export type RunResultType = "input" | "output" | "beforehandler";

export interface BreadboardRunResult {
  /**
   * Type of the run result. This property indicates where the board
   * currently is in the `run` process.
   */
  type: RunResultType;
  /**
   * The current node that is being visited. This property can be used to get
   * information about the current node, such as its id, type, and
   * configuration.
   */
  node: NodeDescriptor;
  /**
   * Any arguments that were passed to the `input` node that triggered this
   * stage.
   * Usually contains `message` property, which is a friendly message
   * to the user about what input is expected.
   * This property is only available when `ResultRunType` is `input`.
   */
  get inputArguments(): InputValues;
  /**
   * The input values the board is waiting for.
   * Set this property to provide input values.
   * This property is only available when `ResultRunType` is `input`.
   */
  set inputs(input: InputValues);
  /**
   * the output values the board is providing.
   * This property is only available when `ResultRunType` is `output`.
   */
  get outputs(): OutputValues;
  /**
   * Current state of the underlying graph traversal.
   * This property is useful for saving and restoring the state of
   * graph traversal.
   */
  get state(): TraversalResult;
}

export interface NodeFactory {
  create<Inputs, Outputs>(
    type: NodeTypeIdentifier,
    configuration?: NodeConfiguration,
    id?: string
  ): BreadboardNode<Inputs, Outputs>;
}

export interface KitConstructor<T extends Kit> {
  new (nodeFactory: NodeFactory): T;
}

/**
 * Validator metadata for a node.
 * Used e.g. in ProbeDetails.
 */
export interface BreadboardValidatorMetadata {
  description: string;
}

/**
 * A validator for a breadboard.
 * For example to check integrity using information flow control.
 */
export interface BreadboardValidator {
  /**
   * Add a graph and validate it.
   *
   * @param graph The graph to validate.
   * @throws Error if the graph is invalid.
   */
  addGraph(graph: GraphDescriptor): void;

  /**
   * Gets the validation metadata for a node.
   *
   * @param node Node to get metadata for.
   */
  getValidatorMetadata(node: NodeDescriptor): BreadboardValidatorMetadata;

  /**
   * Generate a validator for a subgraph, replacing a given node. Call
   * .addGraph() on the returned validator to add and validate the subgraph.
   *
   * @param node The node to replace.
   * @param actualInputs Actual inputs to the node (as opposed to assuming all
   * inputs with * or that optional ones are present)
   * @returns A validator for the subgraph.
   */
  getSubgraphValidator(
    node: NodeDescriptor,
    actualInputs?: string[]
  ): BreadboardValidator;
}

/**
 * Details of the `ProbeEvent` event.
 */
export interface ProbeDetails {
  /**
   * Internal representation of the node that is placed on the board.
   */
  descriptor: NodeDescriptor;
  /**
   * The input values the node was passed.
   */
  inputs: InputValues;
  /**
   * Any missing inputs that the node was expecting.
   * This property is only populated for `skip` event.
   */
  missingInputs?: string[];
  /**
   * The output values the node provided.
   */
  outputs?: OutputValues;
  /**
   * The nesting level of the node.
   * When a board contains included or slotted boards, this level will
   * increment for each level of nesting.
   */
  nesting?: number;
  sources?: string[];
  validatorMetadata?: BreadboardValidatorMetadata[];
}

/**
 * A probe event that is distpached during board run.
 *
 * See [Chapter 7: Probes](https://github.com/google/labs-prototypes/tree/main/seeds/breadboard/docs/tutorial#chapter-7-probes) for more information.
 */
export type ProbeEvent = CustomEvent<ProbeDetails>;

export interface Breadboard extends GraphDescriptor {
  addEdge(edge: Edge): void;
  addNode(node: NodeDescriptor): void;
  addKit<T extends Kit>(ctr: KitConstructor<T>): T;
}

type Common<To, From> = {
  [P in keyof (From | To) as From[P] extends To[P] ? P : never]?:
    | To[P]
    | undefined;
};

type LongOutSpec<From, To> =
  | `${string & keyof From}->${string & keyof To}`
  | `${string & keyof From}->${string & keyof To}.`
  | `${string & keyof From}->${string & keyof To}?`;

type LongInSpec<From, To> =
  | `${string & keyof From}<-${string & keyof To}`
  | `${string & keyof From}<-${string & keyof To}.`
  | `${string & keyof From}<-${string & keyof To}?`;

type ShortOutSpec<From, To> =
  | `${string & keyof Common<From, To>}`
  | `${string & keyof Common<From, To>}->`
  | `${string & keyof Common<From, To>}->.`
  | `${string & keyof Common<From, To>}->?`;

type ShortInSpec<From, To> =
  | `<-${string & keyof Common<From, To>}`
  | `<-${string & keyof Common<From, To>}.`
  | `<-${string & keyof Common<From, To>}?`;

export type WireOutSpec<From, To> =
  | LongOutSpec<From, To>
  | ShortOutSpec<From, To>;

export type WireInSpec<From, To> = LongInSpec<From, To> | ShortInSpec<From, To>;

export type WireSpec<FromIn, FromOut, ToIn, ToOut> =
  | WireOutSpec<FromOut, ToIn>
  | WireInSpec<ToOut, FromIn>;

export interface BreadboardNode<Inputs, Outputs> {
  /**
   * Wires the current node to another node.
   *
   * Use this method to wire nodes together.
   *
   * @param spec - the wiring spec. See the [wiring spec](https://github.com/google/labs-prototypes/blob/main/seeds/breadboard/docs/wires.md) for more details.
   * @param to - the node to wire this node with.
   * @returns - the current node, to enable chaining.
   */
  wire<ToInputs, ToOutputs>(
    // spec: WireSpec<Inputs, Outputs, ToInputs, ToOutputs>,
    spec: string,
    to: BreadboardNode<ToInputs, ToOutputs>
  ): BreadboardNode<Inputs, Outputs>;
}

/**
 * A node configuration that can optionally have an `$id` property.
 *
 * The `$id` property is used to identify the node in the board and is not
 * passed to the node itself.
 */
export type OptionalIdConfiguration = { $id?: string } & NodeConfiguration;

export type ReflectNodeOutputs = OutputValues & {
  graph: GraphDescriptor;
};

export type IncludeNodeInputs = InputValues & {
  path?: string;
  $ref?: string;
  graph?: GraphDescriptor;
  slotted?: BreadboardSlotSpec;
  parent: NodeDescriptor;
  args: InputValues;
};

export type SlotNodeInputs = {
  slot: string;
  parent: NodeDescriptor;
};
