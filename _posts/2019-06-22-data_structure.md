---
layout: post
title: "The data structure"
tagline: "Graph-Traversal, Triangulation and other fun things to do in non-euclidean space"
tags: [yggdrasill]
excerpt_separator: <!--more-->
---

# first question: how to represent worlds and other informations required during generation

# goal: should restrict possible worlds as little as possible.

# structured grids (like pixel images) often cause artifacts in procedural generation; large worlds & minimum resolution in important places => unstructured grid aka meshes, to simplify triangle meshes

# many alorithms use Voronoi cells and their neighborhoods; same as Delauny Triangulation of vertices and their dual graph
[![delauny/voronoi example][delauny_voronoi]][delauny_voronoi]

# interesting/elegant datastructure, and the one I'm using, Quad-Edge structure invented by Guibas and Stolfi => stores the mesh and its dual and allows eleborat constant-time traversal
# Original limitations: 2-Manifolds
# My limitations (to simplify usage):
# - require consistent winding-order => no non-orientable surfaces; means we don't have to keep track about on which side of the surface we are; simplifies lots of algorithms and (later) the rendering
# - max. 2 faces may share a vertex, if they are not connected through edges originating from that vertex; required for the implementation, to differntiate the order of edges around an origin
#   e.g. Image of forbidden case with explanation 
[![Example of forbidden constellation: vertex shared by three unconnected faces][mesh_forbidden_case]][mesh_forbidden_case]

<!--more-->

# basic idea: core = edges between vertices and faces, vertices/faces consist only of an id and a reference to an outgoing/circling edge
# edges are directed (origin and destination vertex/face)
# edges come in a "package" of for edges each, that form a quad-edge; their opposite (origin and destination swapped), rotated 90° left and roated 90° right
# each edge knows: its origin, the other edges in its quad-edge and the next edge around its origin in counter-clockwise order

# navigation is based on the sym/rot/inv_rot and the next-edge of an edge
#   Image
# two types of functions: next = counter-clockwise and prev = clock-wise
# - origin: rotation around the origin of the edge
# - destination: rotation around the destination
# - left: rotation around the face on the left side
# - right: rotation around the right side

# + accessors to get orgin/dest vertex/face and the left/right face

## Implementation
# Can be implemented relativly compact and efficient. First we split edges into primal (between vertices) and dual (between faces) and store their origin and next-edge in separat dynamic arrays. We also need an array with one edge per vertex and an array with one edge per face

```cpp
typedef struct YGDL_Mesh {
	uint32_t vertex_count;
	uint32_t face_count;
	uint32_t edge_count;
	
	const YGDL_Edge* vertex_edge;
	const YGDL_Edge* face_edge;
	
	const YGDL_Vertex* primal_edge_origin;
	const YGDL_Edge*   primal_edge_next;
	
	const YGDL_Face*   dual_edge_origin;
	const YGDL_Edge*   dual_edge_next;
} YGDL_Mesh;
```

`YGDL_Vertex` and `YGDL_Face` are just a struct around an integer id (type-safety). The `YGDL_Edge` also contains just an integer but its value is a bit more complex since each edge needs to known which other edges are part of its quad-edge. Because the edges are stored continously and we always create two primal and two dual edges, finding the opposite (sym) of an edge is as simple as flipping its least-significant bit. But we also need to store if the edge is part of the primal or the dual array. For that we steal the most-significant bit (1=dual).

So we don't have to store any addition indices to implement the three basic traversal functions sym/rot/inv_rot but just need some simple bit operations.

## Construction
Directly adding faces is not part of the original paper, nor any implementations I could find but I really wanted to allow this for ease of use. The problem is, that this is not as trivial as it may seem at first because triangles might be added in (nearly) any order and we need to update the connectivity informations correctly for all possible cases.

In light of all requirements and limitations, there are a total of 21 cases. Most of which (13) are caused by the shared-vertex-problem and can be ignored for now. The rest consist of two simple cases (zero/three new edges) and the to more complex cases for one/two new edges with 3 cases each.

TODO: image

- <b>No new edges:</b> Not an obvious case, but happens if a hole in a mesh is filled in.
What we do: (almost) nothing. All edges are already there and should be connected correctly. So we just need to update the origin face of the outgoing dual edges and are done.

- <b>One new edge:</b> TODO

- <b>Two new edgee:</b> TODO

- <b>Three new edges:</b> The other simple case. We just added a triangle that is not connected to anything else.
What we do: Create the three quad-edges, connect each of the primal edges around the three vertices and connect the dual edges into two loops


## Modification
# rotate/split/collapse

## Data-Layers
# Mesh contains just the topological infomations and no actual data like positions => those are all stored in data-layers linked to different parts of the mesh
- vertices
- faces
- dual/primal edges (directed/un-directed)
- unstructured (just a unique String-ID)


# TODO: Mesh
* Datastructure: direct-edge structure of unstructured triangle mesh => + dual-mesh with data on each vertex
    * allows for different scales if required without wasting space
    * fast access to neighbors
* TODO: traversal/modification algorithms
* TODO: generation => Domains

# Domains
- generator should be able to handle multiple types of maps (flat, looping, spheres)
- Algorithms mostly work on abstract areas and their neighbors => can be generalized into a graph
- allows for many interesting map shapes: all maps that can be flattened into a 2D coordinate space => the surface of any 3D shape + portals and other unusual layouts

Spherical-Coordinates are sub-optimal for generation/movement/... => use 3D-Coordinates and let the Domain normalize those:
- move(Point[], Direction[])
- normalize(Point[])

Requires storing the actual distance (Great Cricle on Sphere) for each edge (16bit floats?).

# World
- mesh (vertices + edges)
- layers (created/updated by modules)
	- static Description (String-ID, Type?, Value-Range?, ...)
	- Per-Vertex Data (e.g. heightmap, water-volume, temperatures) => variant<int[], float[], vec2[], vec3[], ...>
	- Per-Edge Data (e.g. water-flow, distance) => wie vertex data
	- Unstructured Data (e.g. Settlements, POIs, People?)
		- unique String-ID
		- vertex-ID als Referenzpunkt (optional)
		- position/offset (optional)
		- radius (optional)
		- JSON-like structured data (any-wrapper um beliebiges struct oder tatsächlich JSON?)

Future: Applied to generation and simulation of tectonic plates


[delauny_voronoi]: /assets/images/delauny_voronoi.png
[mesh_forbidden_case]: /assets/images/mesh_forbidden_case.png

