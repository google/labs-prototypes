[@google-labs/graph-runner](README.md) / Exports

# @google-labs/graph-runner

## Table of contents

### Classes

- [MachineResult](classes/MachineResult.md)
- [TraversalMachine](classes/TraversalMachine.md)

### Interfaces

- [Capability](interfaces/Capability.md)
- [TraversalResult](interfaces/TraversalResult.md)

### Type Aliases

- [Edge](modules.md#edge)
- [GraphDescriptor](modules.md#graphdescriptor)
- [GraphMetadata](modules.md#graphmetadata)
- [InputValues](modules.md#inputvalues)
- [KitDescriptor](modules.md#kitdescriptor)
- [NodeConfiguration](modules.md#nodeconfiguration)
- [NodeDescriptor](modules.md#nodedescriptor)
- [NodeHandler](modules.md#nodehandler)
- [NodeHandlers](modules.md#nodehandlers)
- [NodeTypeIdentifier](modules.md#nodetypeidentifier)
- [NodeValue](modules.md#nodevalue)
- [OutputValues](modules.md#outputvalues)

### Functions

- [toMermaid](modules.md#tomermaid)

## Type Aliases

### Edge

Ƭ **Edge**: `Object`

Represents an edge in a graph.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `constant?` | `boolean` | If true, this edge acts as a constant: the data that passes through it remains available even after the node has consumed it. |
| `from` | `NodeIdentifier` | The node that the edge is coming from. |
| `in?` | `InputIdentifier` | The input of the `to` node. If this value is undefined, then the then no data is passed as output of the `from` node. |
| `optional?` | `boolean` | If true, this edge is optional: the data that passes through it is not considered a required input to the node. |
| `out?` | `OutputIdentifier` | The output of the `from` node. If this value is "*", then all outputs of the `from` node are passed to the `to` node. If this value is undefined, then no data is passed to any inputs of the `to` node. |
| `to` | `NodeIdentifier` | The node that the edge is going to. |

#### Defined in

[types.ts:67](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L67)

___

### GraphDescriptor

Ƭ **GraphDescriptor**: [`GraphMetadata`](modules.md#graphmetadata) & { `edges`: [`Edge`](modules.md#edge)[] ; `kits?`: [`KitDescriptor`](modules.md#kitdescriptor)[] ; `nodes`: [`NodeDescriptor`](modules.md#nodedescriptor)[]  }

Represents a graph.

#### Defined in

[types.ts:152](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L152)

___

### GraphMetadata

Ƭ **GraphMetadata**: `Object`

Represents graph metadata.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `description?` | `string` | The description of the graph. |
| `title?` | `string` | The title of the graph. |
| `url?` | `string` | The URL pointing to the location of the graph. This URL is used to resolve relative paths in the graph. If not specified, the paths are assumed to be relative to the current working directory. |
| `version?` | `string` | Version of the graph. [semver](https://semver.org/) format is encouraged. |

#### Defined in

[types.ts:126](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L126)

___

### InputValues

Ƭ **InputValues**: `Record`<`InputIdentifier`, [`NodeValue`](modules.md#nodevalue)\>

Values that are supplied as inputs to the `NodeHandler`.

#### Defined in

[types.ts:215](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L215)

___

### KitDescriptor

Ƭ **KitDescriptor**: `Object`

Represents a "kit": a collection of `NodeHandlers`. The basic permise here
is that people can publish kits with interesting handlers, and then
graphs can specify which ones they use.
The `@google-labs/llm-starter` package is an example of kit.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | The URL pointing to the location of the kit. |
| `using?` | `string`[] | The list of node types in this kit that are used by the graph. If left blank or omitted, all node types are assumed to be used. |

#### Defined in

[types.ts:110](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L110)

___

### NodeConfiguration

Ƭ **NodeConfiguration**: `Record`<`string`, [`NodeValue`](modules.md#nodevalue)\>

Values that are supplied as part of the graph. These values are merged with
the `InputValues` and supplied as inputs to the `NodeHandler`.

#### Defined in

[types.ts:226](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L226)

___

### NodeDescriptor

Ƭ **NodeDescriptor**: `Object`

Represents a node in a graph.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `configuration?` | [`NodeConfiguration`](modules.md#nodeconfiguration) | Configuration of the node. |
| `id` | `NodeIdentifier` | Unique id of the node in graph. |
| `type` | [`NodeTypeIdentifier`](modules.md#nodetypeidentifier) | Type of the node. Used to look up the handler for the node. |

#### Defined in

[types.ts:47](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L47)

___

### NodeHandler

Ƭ **NodeHandler**: (`inputs`: [`InputValues`](modules.md#inputvalues)) => `Promise`<[`OutputValues`](modules.md#outputvalues) \| `void`\>

#### Type declaration

▸ (`inputs`): `Promise`<[`OutputValues`](modules.md#outputvalues) \| `void`\>

A function that represents a type of a node in the graph.

##### Parameters

| Name | Type |
| :------ | :------ |
| `inputs` | [`InputValues`](modules.md#inputvalues) |

##### Returns

`Promise`<[`OutputValues`](modules.md#outputvalues) \| `void`\>

#### Defined in

[types.ts:231](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L231)

___

### NodeHandlers

Ƭ **NodeHandlers**: `Record`<[`NodeTypeIdentifier`](modules.md#nodetypeidentifier), [`NodeHandler`](modules.md#nodehandler)\>

All known node handlers.

#### Defined in

[types.ts:241](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L241)

___

### NodeTypeIdentifier

Ƭ **NodeTypeIdentifier**: `string`

Unique identifier of a node's type.

#### Defined in

[types.ts:42](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L42)

___

### NodeValue

Ƭ **NodeValue**: `string` \| `number` \| `boolean` \| ``null`` \| `undefined` \| [`NodeValue`](modules.md#nodevalue)[] \| [`Capability`](interfaces/Capability.md) \| { `[key: string]`: [`NodeValue`](modules.md#nodevalue);  }

A type representing a valid JSON value.

#### Defined in

[types.ts:14](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L14)

___

### OutputValues

Ƭ **OutputValues**: `Partial`<`Record`<`OutputIdentifier`, [`NodeValue`](modules.md#nodevalue)\>\>

Values that the `NodeHandler` outputs.

#### Defined in

[types.ts:220](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/types.ts#L220)

## Functions

### toMermaid

▸ **toMermaid**(`graph`, `direction?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `graph` | [`GraphDescriptor`](modules.md#graphdescriptor) | `undefined` |
| `direction` | `string` | `"TD"` |

#### Returns

`string`

#### Defined in

[mermaid.ts:127](https://github.com/Chizobaonorh/labs-prototypes/blob/2adb69f/seeds/graph-runner/src/mermaid.ts#L127)
