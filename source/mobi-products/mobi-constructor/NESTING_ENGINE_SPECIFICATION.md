# Nesting Engine Specification

O motor usa ordenação total por material, espessura, altura, largura e ID, seguida de shelf packing determinístico. Chapa, margem e kerf são entradas explícitas e validadas. Peças nunca são rotacionadas implicitamente; materiais/espessuras diferentes nunca compartilham chapa. O layout registra placements, área utilizada, aproveitamento e fingerprint reproduzível.
