export function validProject(): Record<string, unknown> {
  return {
    id: "123e4567-e89b-42d3-a456-426614174000",
    displayName: "Projeto Oficial Teste",
    code: "PRJ-001",
    schemaVersion: "1.0.0",
    measurementUnit: "mm",
    rotationUnit: "degrees",
    source: "validator-test",
    status: "validated",
    createdAt: "2026-07-12T20:00:00-03:00",
    updatedAt: "2026-07-12T20:00:00-03:00",
    environments: [{
      id: "123e4567-e89b-42d3-a456-426614174001",
      parentId: "123e4567-e89b-42d3-a456-426614174000",
      displayName: "Cozinha",
      code: "AMB-001",
      order: 0,
      status: "validated",
      architectures: [{
        id: "123e4567-e89b-42d3-a456-426614174002",
        parentId: "123e4567-e89b-42d3-a456-426614174001",
        type: "wall",
        hostId: null,
        size: { width: 3200, height: 2700, depth: 150 },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        referencePlane: { x: 0, y: 0, z: 0 },
        finish: "paint-white"
      }],
      infrastructures: [{
        id: "123e4567-e89b-42d3-a456-426614174003",
        parentId: "123e4567-e89b-42d3-a456-426614174001",
        hostId: "123e4567-e89b-42d3-a456-426614174002",
        category: "electrical",
        type: "outlet",
        position: { x: 600, y: 300, z: 0 },
        installationVolume: null
      }],
      modules: [{
        id: "123e4567-e89b-42d3-a456-426614174004",
        parentId: "123e4567-e89b-42d3-a456-426614174001",
        code: "MOD-001",
        displayName: "Balcão",
        type: "base",
        status: "production",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        parts: [{
          id: "123e4567-e89b-42d3-a456-426614174005",
          parentId: "123e4567-e89b-42d3-a456-426614174004",
          category: "structural",
          type: "side_panel",
          size: { width: 720, height: 560, thickness: 15 },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          materialId: "MDF-BRANCO-15",
          edgeBanding: {
            top: { applied: false },
            bottom: { applied: false },
            left: { applied: false },
            right: { applied: false },
            front: { applied: true, materialId: "FITA-BRANCA-1" },
            back: { applied: false }
          },
          grainDirection: "lengthwise"
        }],
        hardwares: [{
          id: "123e4567-e89b-42d3-a456-426614174006",
          parentId: "123e4567-e89b-42d3-a456-426614174004",
          hostId: "123e4567-e89b-42d3-a456-426614174005",
          category: "connector",
          type: "dowel",
          catalogId: "CAVILHA-8X30",
          position: { x: 30, y: 30, z: 7.5 },
          rotation: { x: 0, y: 0, z: 0 }
        }]
      }]
    }]
  };
}
