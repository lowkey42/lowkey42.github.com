---
layout: post
title: "Modifying Meshes"
tagline: "Adding, flipping, splitting and collapsing edges | Now with 15% more edge-cases"
tags: [yggdrasill]
excerpt_separator: <!--more-->
---

TODO: intro: traversal in last post; now construct a valid mesh; modify existing mesh

TODO: diverges in some parts from the original paper, to simplify API (move complexity into library)

<!--more-->

## Construction
Directly adding faces is not part of the original paper, nor any implementations I could find. Nut I really wanted to allow this for ease of use. The problem is, that this is not as trivial as it may seem at first because triangles might be added in (nearly) any order and we need to update the connectivity informations correctly for all possible cases.

{% include image.html url="/assets/images/quad_edge/forbidden_case.png" classes="fill_black float_right half_size" description="Forbidden case: The central vertex is already used by two faces, that are not connected by another face. When we want to add a new face that is not connected to one of the existing faces, we can't decide if it should be inserted at the top (A) or bottom (B)." %}

TODO: restriction
- If multiple unconnected faces share a vertex, a new face can only be added to that vertex, if it shares an edge with one of the faces. This guarentees that the order of the edges around a vertex is always well defined. This ambiguity could{% note and normal is%} also be resolved by comparing the positions of the connected vertices. But with this small restriction we by use the possibility to ignore the vertex positions completly here and look at on the topology only in terms of which vertices/faces are connect without knowing how they will be layed out in space.


In light of all requirements and limitations, there are a total of 21 cases. Most of which (13) are caused by the shared-vertex-problem and can be ignored for now. The rest consist of two simple cases (zero/three new edges) and the to more complex cases for one/two new edges with 3 cases each.

TODO: image

- <b>No new edges:</b> Not an obvious case, but happens if a hole in a mesh is filled in.
What we do: (almost) nothing. All edges are already there and should be connected correctly. So we just need to update the origin face of the outgoing dual edges and are done.

- <b>One new edge:</b> TODO

- <b>Two new edgee:</b> TODO

- <b>Three new edges:</b> The other simple case. We just added a triangle that is not connected to anything else.
What we do: Create the three quad-edges, connect each of the primal edges around the three vertices and connect the dual edges into two loops


## Edge Flip
TODO: required to restore delaunay property after moving vertices (most simple algorithm to construct delaunay triangulations: check for each face if any other vertex also lies in ints circumcircle => flip the edge between the current face and the face that contains the other vertex)

TODO: process: remove the given edge + insert a new edge that splits the resulting quad along the other diagonal

TODO: would normally need to handle multiple cases (e.g. dual/primal edges) but can be simplified => flipping any part of a quad edge is the same as flipping any other, so if we should flip a dual-edge, we flip its rot() instead
```cpp
const auto e = e_in.is_dual() ? e_in.rot() : e_in;
```

TODO: Precondition: no boundary edge => left/right need to be valid faces

TODO: Steps:
1. remove e from old edge-loop and add it into new edge-loop; changing next-pointer and edge-origin; TODO: details/image
2. dito for `e.sym()`
3. move dual-edge (and its `sym()`) to its new edge-loop; TODO: details/image
4. Update `vertex_edges_` and `face_edges_` that might reference the moved edges



## Edge Split
TODO: the way to add new vertices to an existing mesh to refine it; inserts a new vertex between two existing ones connected by the edge and connects it to their neighbors

TODO: Preconditions: valid **primal** edge with at least one face (i.e. any valid mesh)

TODO: Edge-case: boundary-edge => one of the faces might be missing, which changes how the new vertex is wired-in

TODO: image

TODO: steps:

## Edge Collapse
TODO: the way to remove a vertex from an existing mesh to simplify it; inverse of split operation; removes a given edge, merging its `origin()` and `dest()` and removing its `left()` and `right()` faces, as well as some of the connecting edges

TODO: most complex Preconditions:
- valid **primal** edge with at least one face (i.e. any valid mesh)
- must not cause the forbidden case shown at the beginning => multiple unconnected faces sharing a vertex
- must satisfy the link-condition: one-ring(a) intersected with one-ring(b) == one-ring(ab)
    - i.e. any vertex connected to `origin()` and `dest()` must also be part of the `left()` or `right()` face of the edge
    - If not satisfied, collapsing the edge would create multiple edges with the same `origin()` and `dest()` => invalid mesh

TODO: Edge-case: boundary-edge => one of the faces might be missing

TODO: image

TODO: steps:

