---
layout: post
title: "The project layout"
tagline: "TODO"
tags: [yggdrasill]
excerpt_separator: <!--more-->
---

# Requirement

<!--more-->

# Packaging

- Core library (C-API, C++ implementation) + C++ API (Header-Only wrapper for core library)
- Modules (dynamic libraries/plugins)
- Tools (editor/demo applications)

All as separate git projects; using CMake FetchContent to load dependencies (modules=>core; tools=>modules+core)

For programming: main directory, containing each git project + simple cmake-file that includes all sub-projects

# Hourglass-Pattern
C-API with C++-IMPL + C++ Header-only wrapper
Types: not opaque handles but contain all required attributes and are sub-classed in impl
	=> allows for better cache-locality / less pointer chasing (e.g. for string)
	=> "allows" pointers to C-API structs to be cast to pointers to C++-Wrappers (pointer to first member; grey-area; static_asserts)


