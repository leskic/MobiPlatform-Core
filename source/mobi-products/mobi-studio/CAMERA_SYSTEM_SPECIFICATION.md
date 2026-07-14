# Camera System Specification

Orbit limita elevação a −89°/89°. Pan, zoom, framing e reset usam somente números finitos; zoom é limitado a 0,1–20. Framing calcula centro e distância por bounds visuais. Operações alteram exclusivamente CameraState derivado e nunca Projeto.mobi.
