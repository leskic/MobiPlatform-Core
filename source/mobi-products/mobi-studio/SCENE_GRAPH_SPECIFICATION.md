# Scene Graph Specification

Cada nó contém EntityID, ParentID, tipo visual, MeshID, MaterialKey, posição e bounding size derivados. A cena é reconstruível integralmente a partir do ProjectReader. TransactionEvents fornecem EntityIDs afetados; somente esses nós são substituídos ou removidos. MeshManager e MaterialManager produzem recursos derivados sem armazenar semântica.
