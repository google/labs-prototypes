/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Graph, NodeRoles } from "./types.js";
import { SafetyLabel } from "./label.js";

/**
 * Compute labels and hence validate the safety of the graph as whole. Can be
 * run multiple times, but if so won't relax constraints.
 *
 * Compute all labels with an embarrassingly simple and slow fixed-point
 * algorithm. This should be replaced by a more efficient constraint solver, but
 * that's a lot of work and fiddly. This should be good enough for now and
 * should even cover some of the next steps.
 *
 * Picture raising the trust levels where necessary to enable flow until it
 * stops changing. That is, this will propagate labels through the graph until
 * it reaches a fixed point. If it encounters a contradiction with a constraint,
 * it will throw an error, as the graph is not safe.
 *
 * Note: All Breadboard specific semantics has been factored out to the Graph
 * and Validator classes.
 *
 * @throws {Error} if the graph is not safe.
 */
export function computeLabelsForGraph(graph: Graph): void {
  let change: boolean;
  do {
    change = false;
    graph.nodes.forEach((node) => {
      switch (node.role) {
        // Ignore placeholder nodes, as they'll get replaced by graphs that
        // might exhibit more trusted behavior than an untrusted node. Hence
        // when present, we just ignore them. This might mean disconnected
        // graphs until they are replaced.
        case NodeRoles.placeHolder: {
          return;
        }

        // Passthrough nodes are trusted to pass through data without
        // interference between the wires. Hence we can just copy the output's
        // labels to the inputs.
        //
        // TODO: Once we support confidentiality and track the existence of
        // data, required inputs will taint all others by leaking their
        // existence.
        //
        // TODO: Impllement once we support per-wire labels.
        //
        // case NodeRoles.passthrough:

        // Assume untrusted node, and hence that all inputs taint all outputs.
        default: {
          // Compute the meet (lowest label) of all incoming edges. Add the
          // constraint label for this node. This can lower the label, but not
          // raise it.
          const incomingSafetyLabels = node.incoming.map(
            (edge) => edge.from.label
          );
          const incomingSafetyLabel = SafetyLabel.computeMeetOfLabels([
            ...incomingSafetyLabels,
            node.constraint,
          ]);

          // Compute the join (highest label) of all outgoing edges.
          // Add the constraint label for this node. This can raise the label.
          const outgoingSafetyLabels = node.outgoing.map(
            (edge) => edge.to.label
          );
          const outgoingSafetyLabel = SafetyLabel.computeJoinOfLabels([
            ...outgoingSafetyLabels,
            node.constraint,
          ]);

          // Graph is not safe if a constraint has to be violated, i.e. here a
          // node has to be upgraded.
          if (
            node.constraint &&
            !outgoingSafetyLabel.equalsTo(node.constraint)
          ) {
            throw Error(
              `Graph is not safe. E.g. node ${node.node.id} ` +
                `requires to write to ${outgoingSafetyLabel.toString()} ` +
                `but can only be ${node.constraint.toString()}`
            );
          }

          // Compute the new safety label as the join (highest of) of (lowest)
          // incoming and (highest) outgoing edges. Note that if this increases
          // the trust of this node, the next iteration will backpropagate that.
          const newSafetyLabel = SafetyLabel.computeJoinOfLabels([
            incomingSafetyLabel,
            outgoingSafetyLabel,
          ]);

          // If the new safety label is different from the current one, update it.
          if (!node.label || !newSafetyLabel.equalsTo(node.label)) {
            node.label = newSafetyLabel;
            change = true;
          }

          return;
        }
      }
    });
  } while (change);
}