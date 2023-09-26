[@google-labs/node-nursery](README.md) / Exports

# @google-labs/node-nursery

## Table of contents

### References

- [default](modules.md#default)

### Classes

- [Nursery](classes/Nursery.md)

### Functions

- [lambda](modules.md#lambda)

## References

### default

Renames and re-exports [Nursery](classes/Nursery.md)

## Functions

### lambda

▸ **lambda**<`In`, `Out`\>(`fun`, `config?`): `Promise`<`LambdaResult`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `In` | `InputValues` |
| `Out` | `Partial`<`Record`<`string`, `NodeValue`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fun` | `LamdbdaFunction`<`In`, `Out`\> |
| `config` | `OptionalIdConfiguration` |

#### Returns

`Promise`<`LambdaResult`\>

#### Defined in

[nodes/map.ts:61](https://github.com/Chizobaonorh/labs-prototypes/blob/66eed2a/seeds/node-nursery/src/nodes/map.ts#L61)
