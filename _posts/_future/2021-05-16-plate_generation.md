---
layout: post
title: "Plate Generation"
tagline: "TODO"
tags: [yggdrasill, simulation]
excerpt_separator: <!--more-->
---

TODO: intro/requirements/goals

Basis:
{% include image.html url="/assets/images/Procedural Tectonic Planets.gif" classes="fill_white" description="<a href='https://hal.archives-ouvertes.fr/hal-02136820/file/2019-Procedural-Tectonic-Planets.pdf'>Procedural Tectonic Planets by Cortial et al.</a> is a paper from 2019 that TODO TODO TODO" %}

TODO: this post: differences to paper, used model and construction of initial state; next post = simulation


<!--more-->

TODO: main differences:
- How plates are modeled: polygons vs. sets of interconnected points
- How collision boundaries are handled: instantanious vs. simulated over time
- Simulation of movement: no information in paper => infinitly small points with constant mass for sub-plates + verlet integration


# Model

TODO: delaunay triangulation; vertices = sub-plates; each vertex with its own elevation, type and velocity, but belonging to a meta-plate, identified by an id; through triangulation each vertex is connected to its closest neighbors

TODO: Simulation: similar to spring-damper-modell
- each vertex is an infinitly small point-mass
- edges between vertices apply forces to their origin and destination; types of forces depend on id, type and velocity of the two affected vertices
    - e.g. two vertices belonging to the same plate have a damped spring that determines the applied force between them, to keep the distance close to the initial one
    - can be visualized as interconnected springs stretched over a sphere
- collisions are handled through:
    - detection of invalid triangles, e.g. inverted triangles => removal
	- calculation of separating velocity => subduction, rifting or collision boundary => modify elevation
- since vertices are constantly in motion
    - delaunay condition needs to be restored after every update
    - new vertices are inserted at oceanic ridges
    - edges are split collapsed to keep the mesh within therten parameters (max vertex density)


# Initial State

TODO: `generate_sphere` + `generate_plates`
- Fibonacci sphere + small random offsets (1/2 step-size to avoid collisions) => even distribution, without obvious poles, no obvious patterns in vertices or triangulation 
- QuickHull (might later be replaced, but currently fast enough) => delaunay triangulation
- Pick N random starting points (retry if position is already taken)
    - Type: First M are ocean, rest are continental plates
    - Id: incrementing counter starting from 1 (0=no plate)
    - Velocity: Random Angle and Speed => Generate 3D-Vector, tangential to surface normal (normalized position of vertex)
    - Elevation/Creation-Time: Random in given range based on type
- Flood Fill
    1. For each vertex that we just assigned to a plate: Add neighbors to the same plate
        - Id/Type are copied
        - Velocity is modified to be tangential to surface normal
```cpp

auto p           = (*positions)[n];
auto np          = normalized(p + velocity * 100.f) * length(p);
velocities[n]    = (np - p) / 100.f;
```
        - Increase/decrease creation time slightly based on type: `type == pt_oceanic ? created_time * 0.9f : created_time * 1.1f;`
        - Copy elevation, but disturb it slightly for continental plates
    2. Randomly shuffle the list of vertices that were modified in this iteration and goto step 1, until no vertices have been modified

{% include video.html url="/assets/images/sphere_plates.webm" description="TODO" %}

{% include video.html url="/assets/images/sphere_plate_directions.webm" description="TODO" %}

# Conclusion
Next => simulation

