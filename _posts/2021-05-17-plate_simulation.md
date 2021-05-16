---
layout: post
title: "Plate Simulation"
tagline: "TODO"
tags: [yggdrasill, simulation]
excerpt_separator: <!--more-->
---

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
- Better Tooling/Editor

