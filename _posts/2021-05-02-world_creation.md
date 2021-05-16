---
layout: post
title: "World mesh creation"
tagline: "In the beginning there were triangles. Lots and lots of triangles..."
tags: [yggdrasill, low-level]
excerpt_separator: <!--more-->
---

In the last post we've looked at how we can store our geometry, how we can traverse the resulting mesh and how we'll later store our actual data. But one aspect we haven't looked at yet is how we construct such a mesh data structure in the first place, i.e. how we get from a soup of triangle faces to a quad-edge mesh.

There are two basic operations defined in the original paper to construct and modify meshes:
- MakeEdge: Creates a new edge `e` and its corresponding quad-edge
- Splice: Takes two edges `a` and `b` and either connects them or splits them apart, if they are already connected.

While these two operations are quite powerful and can be used to construct any quad-edge mesh and apply any modification we might want, they are not ideal for our use-case. First they are rather more complex to use, than I would like for everyday use, because they require quite a bit of knowledge about topology and use concepts that are not as easy to visualize as faces in a triangle mesh. And secondly, they allow for structures that we don't actually want to support, like non-triangular faces.

So what we will do instead is to define our own operations, based on how they will be used later. In this post we will first look at just the construction of a new mesh, for which we'll just define two functions:
<!--more-->
```cpp
class Mesh {
  public:
	// Create a new vertex, that is not connected to anything (i.e. their vertex_edge is no_edge)
	Vertex add_vertex();
	
	// Connect the three passed vertices (in counterclockwise order) into a new triangle face
	Face   add_face(Vertex a, Vertex b, Vertex c);
};
```

While these operations are much easier to use, their implementation is also quite a bit more complex. So before we get into the implementation details, we'll first take a look at how they will be used to construct a spherical mesh for our world.

## Creating a Sphere

As already stated in the first post, I want to generate spherical worlds{% note at least for now%}. The first step of this we be generating and simulating a tectonic plates.
Of course, plate tectonics in the real world are much more complex than I can hope to simulate. But I'm not aiming for perfect, but just close enough and I'm mostly interested in the high-level features like mountain ranges and not so much in the complex formation, layering and folding of plates.

My simplified model will mainly be based on the work of [Cortial et al.](https://hal.archives-ouvertes.fr/hal-02136820/file/2019-Procedural-Tectonic-Planets.pdf), deviating on some details were it suits my specific goals or way the paper didn't specify enough details.

The basic approach is modelling tectonic plates as a set of points on the surface of a sphere, not dissimilar to particle based fluid simulations. So the first step is to evenly distribute a number of sampling points on the surface and then partition them into individual plates. By doing this we simplified a complex 3D phenomenon into a manageable 2D one, which means that we'll lose many of the complex details -- like folding of plates -- but terrain features like mountain ranges and coastlines should hopefully still be retained.

Not entirely coincidentally, this model maps quite well to the triangle mesh we've defined so far. Each of our vertices will be a sampling point -- representing the properties of the voronoi cell around it -- and connected through edges to its nearest neighbors. This will also simplify the simulation, because when we need to calculate the interactions with every neighboring voronoi cell, we just need to iterate over all neighbors of the vertex.

{% include image.html url="/assets/images/03/UV_sphere.png" classes="float_right" description="UV Sphere<sup><a target='_blank' href='https://commons.wikimedia.org/wiki/File:UV_unwrapped_sphere.png'>[source]</a></sup>" %}
{% include image.html url="/assets/images/03/cube_sphere.jpg" classes="float_right" description="Cube Sphere<sup><a target='_blank' href='https://catlikecoding.com/unity/tutorials/cube-sphere/'>[source]</a></sup>" %}
{% include image.html url="/assets/images/03/subdivided_icosahedron.png" classes="float_right" description="Subdivided Icosahedron<sup><a target='_blank' href='https://en.wikipedia.org/wiki/File:Geodesic_icosahedral_polyhedron_example.png'>[source]</a></sup>" %}

So first, we'll need to distribute our vertices (i.e. sampling points) on the spheres surface. To have the ideal starting conditions for the simulation algorithms, the points should be evenly distributed on the surface. That means that the distance between the two closest vertices should be as large as possible. Perhaps surprisingly, evenly distributing points on a sphere is a quite complex problem. And there are also several common ways to define spherical meshes. The most common of which are:
- UV Sphere: Uses rings of square faces to cut up the sphere, similar to the latitude and longitude lines used in cartographie. While it approximates the surface of a sphere pretty well, the distribution of vertices is pretty uneven especially at the poles and equator
- Cube Sphere: Starts with a cube, tessellates its faces and then projects the vertices on the surface of the sphere. The nice property of this mapping is that it allows to easily map the sphere back to a flat surface, because it's derived from a cube. But while it's less unevenly distributed than UV-Spheres, the distribution is still far from uniform.
- Subdivided Icosahedron: This is probably the most common way to define a sphere mesh with evenly distributed vertices. The shape starts as an icosahedron (with 12 vertices) that loosely approximates the sphere. To get a better approximation the next step is to subdivide its triangular faces into smaller triangles and then project each vertex onto the spheres surface. After a couple such subdivisions this approximation gets relatively close to a real sphere and keeps the uniform distance between its vertices, which would make it a nice option for us. But a problem with this approach is that the number of vertices is defined by the number of subdivisions and increases quadratically (12, 42, 162, 642, 2562, ...), which limits our options for the initial resolution.

<br style="clear: both">

{% include video.html url="/assets/images/03/sphere_points.webm" tags="autoplay" classes="float_right" description="Rotating Fibonacci Sphere" %}

The subdivided Icosahedron would probably work for us, but I don't particularly like the restrictive vertex count options forced upon use by the recursive subdivision. So we'll instead use Fibonacci Spheres, which have a similar nice uniform distribution, but are not limited to particular vertex counts.

I won't go into too much detail about how they are computed, as [others](http://extremelearning.com.au/how-to-evenly-distribute-points-on-a-sphere-more-effectively-than-the-canonical-fibonacci-lattice/) have already covered that far better than I probably could. But to put it simply, they utilize the golden spiral (aka the Fibonacci spiral) to uniformly distribute points on a surface. This similar to the way [some plants distribute their leaves or seeds](https://www.youtube.com/watch?v=1Jj-sJ78O6M), by placing each point $$2\pi \cdot (2-\phi)$$ radians {% note = approx. 137.507... degrees%} (where $$\phi$$ is the golden ratio) further along a spiral path from the center. So for $$N$$ points in a 2D spherical coordinate system we would use something like:

$$(\theta, r)_i = (i \cdot 2\pi \cdot (2\phi), \frac{i}{N})$$

Now all that is left to use this on the surface of our sphere is to extend it from 2D spherical coordinates to 3D Cartesian coordinates. This can be done by cutting the sphere into circles along the Y-axis, by deriving the Y coordinate directly from the current index $$i$$. Based on the radius of the sphere, we can then derive the radius of the current circle and calculating X and Z from the angle given by the equation above. So for the unit sphere with radius 1 and $$N$$ points we get:

$$
\begin{align*}
y_i &= 1 - \frac{2i}{N-1}\\

r_i &= \sqrt{1-y_i^2} \\

\theta_i &= i \cdot 2\pi \cdot (2-\phi) \\\\

(x,y,z)_i &= (cos(\theta_i) \cdot r_i, y_i, sin(\theta_i) \cdot r_i)
\end{align*}
$$

Combining all this, the code that generates our vertex positions looks like this:

```cpp
// Define the data layer that contains the vertex positions in 3D Cartesian coordinates
constexpr auto position_info = Layer_info<Vec3, Layer_type::vertex>("position");

// Acquire all necessary resources from the world structure
auto mesh        = world.lock_mesh();
auto [positions] = world.lock_layer(position_info);
auto rand        = world.lock_random();

// Create N vertices
mesh->add_vertices(vertex_count);

// Pre-calculate the golden angle and the step-size for calculating y,
//   so we just need to multiply them with i in the loop
constexpr auto golden_angle = 2.f * std::numbers::pi_v<float> * (2.f - std::numbers::phi_v<float>);
const auto     step_size    = 2.f / (vertices - 1);

for(std::int32_t i = 0; i < vertices; i++) {
	// Calculate the x/y/z position of the current vertex on the unit sphere
	const auto y     = 1.f - step_size * i;
	const auto r     = std::sqrt(1 - y * y);
	const auto theta = golden_angle * i;
	const auto x     = std::cos(theta) * r;
	const auto z     = std::sin(theta) * r;

	// Set the vertex position (multiplying with the radius of our sphere)
	positions[Vertex(i)] = {x * radius, y * radius, z * radius};
}
```

Until now, we only defined our vertices as a cloud of points without any connectivity. So the next step is to compute the delaunay triangulation of these points. There are again a couple ways to achieve this, but the easiest is to utilize the fact that the delaunay triangulation of points on the surface of a sphere is identical to the convex hull of said points. Hence all that's left to do is import [a library that computes the convex hull](https://github.com/akuukka/quickhull). The library already gives us a list of faces, that we just need to pass onto the `add_face()` function of `Mesh`{% note There is one special case we are ignoring here: The faces from quickhull can be in any order, but as we'll see below there are cases that add_face can't handle. To fix this ordering problem, we simply memorize all faces that couldn't be added and retry afterwards, until all the mesh is complete.%}:

```cpp
quickhull::QuickHull<float> qh;
auto  hull    = qh.getConvexHull(&positions.begin()->x, positions.size(), false, true);
auto& indices = hull.getIndexBuffer();

for(std::size_t i = 0; i < indices.size(); i += 3) {
	mesh->add_face(indices[i], indices[i+1], indices[i+2]);
}
```

As can be seen in the images below, the vertices are distributed evenly on the surface ... too evenly. In some cases we might want a more natural and less uniform look. This can be achieved quite easily by adding a small offset (`0<=offset<1.0`) to the loop variable `i` before its used int the calculations:
```cpp
const auto offset = perturbation > 0 ? rand->uniform(0.f, perturbation) : 0.f;
auto       ii    = std::min(i + offset, vertices - 1.f);
// then use ii instead of i in the body of the loop
```

<div class="image_list" markdown="1">

{% include video.html url="/assets/images/03/sphere_triangles.webm" description="Wireframe of the generated mesh" %}

{% include video.html url="/assets/images/03/sphere_shaded.webm" description="Shaded rendering of the same sphere" %}

{% include video.html url="/assets/images/03/sphere_noise.webm" description="Sphere with more vertices and a small random perturbation" %}

</div>




## Implementing add_face

As said above implementing this operation is not as straightforward as one might hope. The main problem is triangles might be added in (nearly) any order and we need to update the connectivity information correctly for all possible cases. Which means that we have to update the `origin_next(e)` reference for all modified primal and dual edges, to preserve valid edge-rings.


<div class="image_list" markdown="1">

{% include image.html url="/assets/images/03/mesh_construction/edge_ring_primal.png" classes="fill_black" description="<code class='highlighter-rouge'>origin_next(e)</code> for primal edges must always form an edge-ring that contains all primal edges with the same origin vertex, in counterclockwise order." %}

{% include image.html url="/assets/images/03/mesh_construction/edge_ring_dual.png" classes="fill_black" description="Similarly, <code class='highlighter-rouge'>origin_next(e)</code> for dual edges must form an edge-ring counterclockwise around a face." %}

{% include image.html url="/assets/images/03/mesh_construction/edge_ring_dual_boundary.png" classes="fill_black" description="A special case for dual edges are boundaries of unclosed geometry. At boundaries edge miss their left or right face, which is normally not allowed. To bypass that restriction we treat the outside of our shape as a single imaginary face (the only face that doesn't have to be triangular) with the highest possible ID (all bits are 1). Of course, this face also has an edge-ring, consisting of the <code class='highlighter-rouge'>rot(e)</code> of every boundary edge. While the order of the edges looks clockwise here, but is technically still counterclockwise, when seen from the imaginary boundary face." %}

</div>

{% include image.html url="/assets/images/03/mesh_construction/forbidden_case.png" classes="fill_black float_right half_size" description="Forbidden case: The central vertex is already used by two faces, that are not connected by another face. When we want to add a new face that is not connected to one of the existing faces, we can't decide if it should be inserted at the top (A) or bottom (B)." %}

Because our mesh implementation doesn't know about the position of vertices, we need to enforce one additional restriction on valid topologies: If multiple unconnected faces share a vertex, a new face can only be added to that vertex, if it shares an edge with one of the faces. The problem we solve with this restriction is, that we need to know the order of the faces around a vertex, in order to be able to insert the edges at the correct positions in their new edge-rings. This ambiguity could{% note and normaly is%} also be resolved by comparing the positions of the connected vertices. But with this small restriction we buy use the possibility to ignore the vertex positions completely here and look at on the topology only in terms of which vertices/faces are connected, without knowing how they will be laid out in space.

Thanks to our restrictions we only have to handle 8 different cases in total. One for each of the three quad-edges of the new face, that could either be missing or already exist. Luckily most of these are rotationally symmetrical and we only need to look at 4 distinct cases, that we can identify by counting the number of already existing edges.

### Case 0: No Preexisting Edges

The simplest case -- and also the first one we need when we construct a new mesh -- is the situation where we don't have any faces or edges. All we need to do in this case is create one face and three quad-edges and connect them as shown below{% note Technically it's also possible to create multiple unconnected faces, that are later connected by additional faces. As long as we don't violate the restriction above and all faces are connected before any traversal operation is used, that accesses the boundary edge. Because in that case we would have multiple edge-rings for the same face (the boundary face), which violates the precondition of the traversal operations.%}:

<div class="image_list" markdown="1">

{% include image.html url="/assets/images/03/mesh_construction/insert_0_primal.png" classes="fill_black" description="Primal: One edge-ring around each of the three vertices." %}

{% include image.html url="/assets/images/03/mesh_construction/insert_0_dual.png" classes="fill_black" description="Dual: One edge-ring around the new face and one around the boundary edge." %}

</div>

### Case 1: One Preexisting Edge (two new Edges)

{% include image.html url="/assets/images/03/mesh_construction/insert_1_blank.png" classes="fill_black float_right" description="" %}

The next case is a bit more complex: One of our edges already exists. What that means is that we add our face onto another face, which with we share a single edge.

The complexity here comes from the fact that we need to insert our new edges into existing edge-rings. To be exact the complex part is finding the correct edge-ring and insert position, i.e. the edge that should be directly in front of us in the ring. In contrast, the insertion itself is relatively easy{% note The code below expects primal edges, but the code for dual edges would function identical. %}:

<br style="clear:both">

```cpp
void insert_after(Edge predecessor, Edge new_edge) {
	// Find the edge that currently comes after the predecessor,
	auto& predecessor_next = primal_edge_next_[predecessor.index()];
	
	// ... set that as our next edge and
	primal_edge_next_[new_edge.index()] = predecessor_next;
	
	// ... change the predecessor, so that it points to us
	predecessor_next = new_edge;
}
```

It's a relatively common case, that we know our successor but not our predecessor. If that is the case, we can just use `origin_prev(e)` to get its predecessor and insert ourselves between them. One thing we need to keep in mind though, is that the traversal operations won't work as expected if we already modified part of the topology. So the usual procedure is that we load and remember all information about the current topology that we will need and only modify it afterwards, whereby we achieve a consistent view of the topology.

```cpp
void insert_before(Edge successor, Edge new_edge) {
	insert_after(successor.origin_prev(*this), new_edge);
}
```

<div class="image_list" markdown="1">

{% include image.html url="/assets/images/03/mesh_construction/insert_1_primal.png" classes="fill_black" description="Primal: The right vertex is identical to the simple case, but the other two edges need to be inserted into the existing edge-ring by calling <code class='highlighter-rouge'>insert_before()</code> with <code class='highlighter-rouge'>e1,e2</code> and <code class='highlighter-rouge'>e3,e4</code>." %}

{% include image.html url="/assets/images/03/mesh_construction/insert_1_dual.png" classes="fill_black" description="Dual: The edge-ring around the new face is identical to the simple case but the boundary edge-ring is more complicated here. Before we inserted our new face, the shared edge was a boundary edge and <code class='highlighter-rouge'>e1</code> was part of the boundary edge-ring. After the insertion that is no longer the case and <code class='highlighter-rouge'>e2</code> and <code class='highlighter-rouge'>e3</code> should be part of this edge-ring instead. So we have to retrieve the predecessor of <code class='highlighter-rouge'>e1</code>, let it point to <code class='highlighter-rouge'>e2</code>, which points to <code class='highlighter-rouge'>e3</code>, which finally points to the original successor of <code class='highlighter-rouge'>e1</code>." %}

</div>

### Case 2: Two Preexisting Edges (one new Edge)

{% include image.html url="/assets/images/03/mesh_construction/insert_2_blank.png" classes="fill_black float_right" description="" %}

This case is quite similar to the previous one, but slightly simpler because we only have one newly created quad-edge that we need to connect. Thereby the primal edge ring around one of the vertices is already correct and the other two only need to insert the new edge. Wiring up the dual edges is the only part with a bit of complexity, but that case is also quite similar to case 1.

<br style="clear:both">

<div class="image_list" markdown="1">

{% include image.html url="/assets/images/03/mesh_construction/insert_2_primal.png" classes="fill_black" description="Primal: The edge-ring around the bottom right vertex is already complete and doesn't need to be modified. The only thing we need to do here is insert our new edges into the ring around the remaining two vertices. Which can be done in the same way as in the previous case." %}

{% include image.html url="/assets/images/03/mesh_construction/insert_2_dual.png" classes="fill_black" description="Dual: Like in the last case we have to remove the out-going edges of the new face from the boundary-ring and replace it with the new edge. The difference is that we now remove two edges (<code class='highlighter-rouge'>e1</code> and <code class='highlighter-rouge'>e2</code>) and replace them with a single new edge (<code class='highlighter-rouge'>e3</code>)." %}

</div>


### Case 3: Three Preexisting Edges

The opposite of Case 1 is also not too complex: All three vertices of our face are already connected by edges and we currently have a hole where we want to create the face. Because all connections are already established in this case, we don't have to connect any edge, but just create a new face and set the origin of the dual edges leaving the face accordingly{% note and possibly remove them from the boundary edge-ring, if they don't already form a distinct ring %}.



### The Edge-Case{% note It's never so simple... %}

We owe the simplicity of the previous cases primarily to one assumption: If a vertex already has a face we also share an edge with this face.

{% include image.html url="/assets/images/03/mesh_construction/special_case_blank.png" classes="fill_black float_right" description="Special-Case: New face between two previously unconnected faces" %}

But that assumption doesn't hold in all cases. While our restriction from the beginning does forbid all cases where a vertex is shared by more than two unconnected faces, it leaves one case open that we still need to handle: A vertex that is shared by exactly two faces. We could've excluded that case too, of course. But in contrast to the others it is actually decidable and by not allowing it we would restrict the construction of meshes more than I'd like. Because without this case all new faces after the first one, would have to share an edge with an existing face.

The reason that we've ignored this cases until now is that we can actually separate these concerns by splitting our function in two steps:
1. Add the face like above, ignoring this special case
2. Iterate over each affected vertex and fix the errors introduced by ignoring the edge case 1.

The specific errors that are introduced by 1. are unconnected edge-rings{% note multiple disjunct sets of edges, that each form an independent edge-ring%}, which would cause massive problems during traversal, because we would only see one of them when we iterate with `origin_next(e)`. Luckily we can solve this problem relatively easily by merging the two edge-rings:

```cpp
void merge_edge_ring(Edge last_edge_of_a, Edge last_edge_of_b) {
	auto& a_next = primal_edge_next_[last_edge_of_a.index()];
	auto& b_next = primal_edge_next_[last_edge_of_b.index()];
	
	std::swap(a_next, b_next);
	// Now last_edge_of_a points to the first edge in b
	//  and last_edge_of_b points to the first edge in a
}
```

<br style="clear:both">

<div class="image_list" markdown="1">

{% include image.html url="/assets/images/03/mesh_construction/special_case_primal.png" classes="fill_black" description="Primal: Next-Pointers after first step in orange and changes in red. To merge the two rings we need to find the last edge of the new (<code class='highlighter-rouge'>e1</code>) and old edge-ring (<code class='highlighter-rouge'>e2</code>). To do that here, we can just iterate over all edges of the respective ring, looking for the first edge that has not left face." %}

{% include image.html url="/assets/images/03/mesh_construction/special_case_dual.png" classes="fill_black" description="Dual: Next-Pointers after first step in cyan and changes in red. The two edges we need for the merge operation can be determined by iterating the edge-rings, looking for one were the connecting vertex is on the left side. Or we can find them by traversing the mesh after we've found the two edges for the primal merge-operation." %}

</div>


## Conclusion

Now that we have our first world mesh, we can nearly start with the generation algorithms, like simulating plate tectonics. We're just missing one last puzzle piece, we'll look at next, that is the modification of our mesh during the simulation.

