---
layout: post
title: "Yggdrasill"
tagline: "Building worlds from bits and dust"
tags: [yggdrasill]
excerpt_separator: <!--more-->
---

# TODO: What?
# TODO: Why?
* generation of fantasy worlds
* inspired by heredragonsabound.blogspot.com and http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/
* generation at world-scale
* deep but sparse generation:
    * large number of different data: height, tectonic plates, temperature, humidity, wind, ...
    * low resolution (100th of km)
    * interpolation / generation of more detailed data based on low-res data
* main factor for subjective quality => information density (entropie)
    * entropie too high: seems random, no (artistic) intent
    * entropie too low: boring
    * idearly slightly lower than in reality, cause-and-effect should be obvious
* random generation doesn't contribute meaningfull information
* source of information:
    1. direct artistic input 
    2. using simulations to generate new information based on existing (water flow, erosion, ...)
* simulation heavy with few *meaningfull* inputs (=> elefant trunk) and optional artistic input after every major step

<!--more-->

# TODO: How?
* Datastructure: direct-edge structure of unstructured triangle mesh => + dual-mesh with data on each vertex
    * allows for different scales if required without wasting space
    * fast access to neighbors

# TODO: Future Posts?

