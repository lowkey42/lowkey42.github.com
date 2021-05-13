---
layout: post
title: "Modifying Meshes"
tagline: "Adding, flipping, splitting and collapsing edges | Now with 15% more edge-cases"
tags: [yggdrasill]
excerpt_separator: <!--more-->
---

TODO: reword intro

In the last post we've looked at how we can store our geometry, how we can traverse the resulting mesh and how we'll later store our actual data. But one aspect we haven't looked at yet is how we construct such a mesh data structure in the first place, i.e. how we get from a soup of triangle faces to a quad-edge mesh, and how we can modify the topology later.

There are two basic operations defined in the original paper for both modification and construction:
- MakeEdge: Creates a new edge `e` and its corresponding quad-edge
- Splice: Takes two edges `a` and `b` and either connects them or splits them apart, if they are already connected.

While these two operations are quite powerfull and can be used to construct any quad-edge mesh and apply any modification we might want, they are not ideal for our use-case. First they are rather more complex to use, than I would like for everyday use, because they require quite a bit of knowledge about topology and use concepts that are not not as easy to visualize as faces in a triangle mesh. And secondly, they allow for strutures that we don't actually want to support, like non-triangular faces.

So what we will do instead is define our own operations, based on how they will be used later, which gives us the following:
<!--more-->
```cpp
class Mesh {
  public:
	// ...
	
	void   flip    (Edge e);
	Edge   split   (Edge e, float split_point);
	Vertex collapse(Edge e, float join_point);
};
```



## Edge Flip

Now that we actually have a constructed a mesh, we can look at the operations to modify them. The first of which is the edge flip, that will mostly be used to restore the delaunay condition of our mesh after vertices have been moved{% note we will look at that in more detail later, but the basic algorithm we'll be using is: Calculate the circumcircle of each face, check if there is another vertex (of a neighboring face) that lies inside this circle and if there is one flip the edge we share with its face.%}.

The flip operation is relativly simple: We take an edge and rotate it counterclockwise, as seen below:

<div class="image_list" markdown="1">

{% include image.html url="/assets/images/04/flip/initial.png" classes="fill_black" description="Initial mesh before flip" %}

{% include image.html url="/assets/images/04/flip/final.png" classes="fill_black" description="Mesh after the <code class='highlighter-rouge'>flip(e)</code>" %}

</div>

What we have ultimatly done here is we removed the passed edge, to transform the two neighboring faces into a quad and then created a new edge between the previously unconnected vertices to split it into two triangles again. From this we also see, that we can't flip edges at the boundary of our mesh, that only have a single face.

Our implementation is further simplified by the fact that we don't need to handle multiple cases, like we had for `add_face()`. The reason is that there are only two possible ways to split a quad, which means the result is always unambiguous, regardless of which part of a quad-edge we pass as the argument. That means `flip(e)`, `flip(e.rot())`, `flip(e.sym())` and `flip(e.inv_rot())` are all equivalent and we can just normalize the input and ignore all other cases, like flipping dual edges.
```cpp
e = e.is_dual() ? e.rot() : e;
```

As always there are two parts to this operation: Updating the primal mesh and its dual counterpart:

### Primal mesh

The update of the primal mesh is pretty streight forward. We just need to remove `e` and `e.sym()` from their old and add them to their new edge-rings{% note How exactly we determine the next/previous edges in the new edge-rings might not be obvious at first. But it should be visualizable by manually applying the traversal operations we've seen in the last post, to step through the topology by hand.%}:
```cpp
// remove e and e.sym() from their current edge-rings
new_origin_next[e.origin_prev(mesh)]       = e.origin_next(mesh);
new_origin_next[e.sym().origin_prev(mesh)] = e.sym().origin_next(mesh);

// add e to its new edge-ring
new_origin_next[e.dest_next(mesh)] = e;
new_origin_next[e]                 = e.origin_prev(mesh).sym();

// add e.sym() to its new edge-ring
new_origin_next[e.origin_next(mesh).sym()] = e.sym();
new_origin_next[e.sym()]                   = e.dest_prev(mesh);

// ...

// check if the original origin/dest vertices referenced the flipped edge
//   and set them to one of the remaining edges, if required
if(vertex_edges_[e.origin(mesh)] == e)
	vertex_edges_[e.origin(mesh)] = e.origin_next(mesh);
if(vertex_edges_[e.dest(mesh)] == e.sym())
	vertex_edges_[e.dest(mesh)] = e.sym().origin_next(mesh);

// update the origin
primal_edge_origin_[e.index()] = e.origin_prev(mesh).dest(mesh);
primal_edge_origin_[e.sym().index()] = e.origin_next(mesh).dest(mesh);

// apply the changes
new_origin_next.apply(primal_edge_next_);
```

Because we need to traverse the mesh during our modification, we need to be carefull that we only override the data _after_ we've read all required information. Therefor we need to load and cache all values before we can write the new values to the `Mesh` member variables. So to make our lifes easier and the code more readable, we use `new_origin_next` to memorize the new values and only apply them at the end using a class like this:
```cpp
template <typename Value, std::size_t N>
class Edge_changes {
  public:
	Value& operator[](Edge e) {
		assert(next_idx_ < int(new_values_.size()));
		auto& e = new_values_[next_idx_++];
		e.first = e.index();
		return e.second;
	}

	void apply(std::vector<Value>& out) {
		for(int i = 0; i < next_idx_; i++) {
			auto&& [index, val] = new_values_[i];
			out[index]          = val;
		}
	}

  private:
	std::array<std::pair<uint32_t, Value>, N> new_values_;
	int                                       next_idx_ = 0;
};

// later instanciated with
auto new_origin_next = Edge_changes<Edge, 6>{};
```

### Dual mesh

Updating the dual mesh might look more complex at first, because the flip also changes which faces are neighboring each other, but its actually simpler, because the edge-rings around faces are much more restricted. Since every face has excatly three outgoing edges and all flips are identical, we can just look at our diagram and see that we only need to swap two dual edges from the rings around `e.left()` and `e.right()`.

<div class="image_list" markdown="1">

{% include image.html url="/assets/images/04/flip/initial_dual.png" classes="fill_black" description="Initial mesh before flip, with the two edges of the dual mesh that need to be moved highlighted." %}

{% include image.html url="/assets/images/04/flip/final_dual.png" classes="fill_black" description="Mesh after the <code class='highlighter-rouge'>flip(e)</code>. The dual edge <code class='highlighter-rouge'>de1</code> has been moved to the left and <code class='highlighter-rouge'>de2</code> to the right face, after <code class='highlighter-rouge'>e.rot()</code> and <code class='highlighter-rouge'>e.inv_rot()</code> respectively." %}

</div>

```cpp
// move edge from left face to right face
const auto edge_from_left      = e.inv_rot().origin_next(mesh);
const auto edge_from_left_prev = e.rot().origin_prev(mesh);
new_dual_origin_next[edge_from_left]      = e.rot();
new_dual_origin_next[e.rot()]             = edge_from_left_prev;
new_dual_origin_next[edge_from_left_prev] = edge_from_left;

// move edge from right face to left face
const auto edge_from_right      = e.rot().origin_next(mesh);
const auto edge_from_right_prev = e.inv_rot().origin_prev(mesh);
new_dual_origin_next[edge_from_right]      = e.inv_rot();
new_dual_origin_next[e.inv_rot())          = edge_from_right_prev;
new_dual_origin_next[edge_from_right_prev) = edge_from_right;

// ... update primal mesh, as seen above ...

// set the edges for the modified faces to one of the edges
face_edges_[e.left(mesh)] = e;
face_edges_[e.right(mesh)] = e.sym();

// update the origin
dual_edge_origin_[edge_from_left.index()]  = e.right(mesh);
dual_edge_origin_[edge_from_right.index()] = e.left(mesh);

// apply the changes
new_dual_origin_next.apply(primal_edge_next_);
```


## Edge split and collapse

One of the key-features of our representation is that we can locally refine our mesh if we need a higher resolution, because the local terrain contains higher-frequency features and/or more information.

The operation we define to implement this is `Edge split(Edge e, float split_point)`. The arguments are an existing edge and a position on that edge, represented as a floating point number to interpolate between the origin (0.0) and destination (1.0) vertex. The operation splits that edge at the defined position, inserting a new vertex, two faces and three quad-edges. The returned value is the new halve of the split edge, from the new vertex to the original destination.

TODO: the way to remove a vertex from an existing mesh to simplify it; inverse of split operation; removes a given edge, merging its `origin()` and `dest()` and removing its `left()` and `right()` faces, as well as some of the connecting edges

<figure class="captioned_image" style="width: 40em">
	<a class="open_img" href="/assets/images/04/split_collapse/overview.png" target="_blank" rel="noopener noreferrer" onclick="show_image_overlay(event, this)" style="width:38em">
		<img style="float:none" src="/assets/images/04/split_collapse/overview.png" alt="example of splitting and collapsing an edge">
	</a>
<figcaption markdown="1">

Executing <code class='highlighter-rouge'>split(e, 0.25f)</code> transforms the left mesh into the right one, inserting a new vertex -- 25% along the way between the origin and destination of <code class='highlighter-rouge'>e</code> -- , two faces -- F<sub>L</sub> and F<sub>R</sub> -- and three quad-edges.

Executing <code class='highlighter-rouge'>collapse(e', 1.f)</code> reverses this operation. The edge <code class='highlighter-rouge'>e'</code> is removed and its origin and destionation, as well as its left and right face, are collapsed into a single vertex, that keeps the position of the destination (100% along the way from origin to destination.

</figcaption>
</figure>

TODO: same principle as the previous operations => create/remove vertex/edge/face and connect the primal and dual edges into edge-rings => but more intricate, so I won't go into too much detail here

TODO: Precondition for split: valid **primal** edge with at least one face (i.e. any valid mesh) => May be a boundary-edge

TODO: most complex Precondition for collapse:
- valid **primal** edge with at least one face (i.e. any valid mesh)
- must not cause the forbidden case shown at the beginning => multiple unconnected faces sharing a vertex
- must satisfy the link-condition: one-ring(a) intersected with one-ring(b) == one-ring(ab)
    - i.e. any vertex connected to `origin()` and `dest()` must also be part of the `left()` or `right()` face of the edge
    - If not satisfied, collapsing the edge would create multiple edges with the same `origin()` and `dest()` => invalid mesh
    - TODO: image example

TODO: Edge-case for both: boundary-edge => one of the faces might be missing, which changes how the new vertex is wired-in

TODO: handling vertices/edges/face deleted by collapse => record their ID in a vector and set their properties to `no_edge`/`no_vertex`/`no_face`
	=> every time we want to create a new element we first check this free-list and reuse them, before we allocate new ones
	=> since deleted elements are, by definition, not connected to any part of the mesh they won't turn up when iterating around edge-rings (faces/vertices)
	=> but when we iterate over all vertices/edges/faces we need to check if they are valid or marked as deleted
	=> Keeps our IDs stable and is realy efficient (if only relativly few elements are deleted at any time, which should be the case for us)


## Handling topological changes in data layers

TODO: how flip/split/collapse effect the data layers




