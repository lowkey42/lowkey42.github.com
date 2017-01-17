---
layout: page
title: "Im Anfang war die Tat"
tagline: "Was bisher geschah"
category: "Into the Light"
tags: [devblog]
---
{% include JB/setup %}

In der Hoffnung das für irgendjemanden (vermutlich mich) mal von nutzen ist, um bei Selbstgesprächen nicht immer alles zweimal sagen zu müssen und vor allem die Zeit während meiner Online-Medienrecht Vorlesungen totzuschlagen, hab ich mich dazu durchgerungen einen Dev-Blog für mein aktuelles Projekt anzufangen.

[Into the Light](http://lowkey42.github.io/teamproject) ist ein Puzzle-Plattformer bei dem sich der Spieler in einen Lichtstrahl verwandeln kann, d.h. es geht im Wesentlich um die Interaktion von und mit Licht.

Für dieses Projekt programmiere ich u.a. eine auf OpenGL und SDL2 aufsetzende Engine in C++14. Die Grundbausteine (Grafik- und Sound-Subsystem, ECS, etc.) basiert zu einem großen Teil auf einem meiner [früheren Projekte](https://github.com/lowkey42/medienprojekt), werden allerdings soweit sinnvoll erweitert und angepasst. Im Gegensatz dazu wird der Renderer komplett neu geschrieben und ist stark an die UbiArt-Engine (u.a. Rayman Legends) angelehnt. Dabei handelt es sich um einen physically based 3D Renderer mit dem aber (vorläufig) nur 2D Sprites gerendert werden. Die Vorteil von diesem Vorgehen sind für uns u.a.:

- Die Sprites können in der gesamten dreidimensionalen Szene angeordnet werden. Durch die perspektivische Projektion ergibt sich somit automatisch ein Paralax Effekt und eine natürlich wirkende Skalierung der Hintergrundobjekte.
- Die Beleuchtung findet ebenfalls im 3D Raum statt, in Verbindung mit Normalmaps ergibt sich also eine sehr eindrucksvolle Echtzeitbeleuchtung.
- Durch die Angabe der Beleuchtungsparameter lediglich in Form von Roughness, Emmision und Metalicness ist es relativ einfach die konkreten Materialeigenschaften für ein 2D Sprite zu definieren (Reflexionen, etc.).


In diesem Blog möchte ich vor allem einige technisch interessante Punkte des Projekts beleuchten. Angedacht sind dafür aktuell:

 - Aufbau der Engine
 - Aufbau des ECS
 - Funktionsweise des Asset-Managers
 - Implementierung der Pixel-Perfect Softshadows
 - Funktionsweise des JSON Serialisierer ([SF2](https://github.com/lowkey42/sf2))
 - Einzelheiten des Renderers (Sprite-Batching, ...)
 - Smart-Textures (vektorbasiertes 2D Terrain)
 
 
