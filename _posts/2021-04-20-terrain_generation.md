---
layout: post
title: "Terrain Generation"
tagline: "TODO"
tags: [yggdrasill, simulation]
excerpt_separator: <!--more-->
---

TODO: intro/requirements/goals

Basis:
{% include image.html url="/assets/images/Procedural Tectonic Planets.gif" classes="fill_white" description="<a href='https://hal.archives-ouvertes.fr/hal-02136820/file/2019-Procedural-Tectonic-Planets.pdf'>Procedural Tectonic Planets by Cortial et al.</a> is a paper from 2019 that TODO TODO TODO" %}

<!--more-->

# Model

TODO: delaunay triangulation; vertices = sub-plates; each vertex with its own elevation, type and velocity, but belonging to a meta-plate, identified by an id; through triangulation each vertex is connected to its closest neighbors
- Triangle appoximation = main difference to paper / has been underspecified in paper)

TODO: Steps:
- Generate initial plate arrangement
- Simulate plates in a loop: move based on velocity + modify velocity based on neighbors

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

# Simulation

TODO: general idea

Steps:
1. Refinement
2. identify type of boundaries between sub-plates => remember in edge-layer
3. spawn new plates on ridge-boundaries
4. Calculate forces acting on plates
5. Simulate plate movement: Update plate velocity and move them (re-normalize to plate surface)
6. Update elevation at subduction and collision boundaries
7. Check if there accoured collisions between plates during movement and resolve them
8. Restore Delaunay condition
9. Fix triangles that are extremly thin or have an extremly small height (=> vertices are nearly colliding)
10. Restore Delaunay condition (again)
11. Apply simple erosion
12. Split/Combine meta-plates


## 1. Refinement
TODO

## 2. Identify boundary-types
TODO

## 3. Spawn new plates
TODO

## 4. Calculate forces
TODO

## 5. Simulate plate movement
TODO

## 6. Update elevation
TODO

## 7. Solve Collisions
TODO

## 8. and 10. Restore Delaunay condition
TODO

## 9. Fix degenerated triangles
TODO

## 11. Simulate Erosion
TODO

## 12. Split/combine plates
TODO


# Conclusion
TODO: results

TODO: future developments
- Detail generation (based on paper)
- Hot-Spots (e.g. Hawaii)
- Climate and hydrology simulation => rivers + better erosion

