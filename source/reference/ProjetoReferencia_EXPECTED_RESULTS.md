# ProjetoReferencia Expected Results

## Expected Project Identity

- Project id: `8f5d3e5c-7c1a-4a2f-9a11-02d3b75f1000`
- Project name: `Projeto Referência`
- Environment: `Cozinha Referência`
- Status: `validated`
- Schema version: `1.0.0`

## Expected Chain Result

The reference project must complete:

`Schema -> Studio -> FlowRunner -> Constructor -> Industrial Validation -> MobiView`

Expected final status:

```text
PASS
```

## Expected Automated Assertions

- Schema validation succeeds.
- Mobi Studio Host loader accepts the file.
- `FlowRunner` returns `success: true`.
- `FlowRunner` returns `status: APPROVED`.
- Constructor produces an industrial snapshot.
- ProductionManifest is present and references the project id.
- BOM contains rows for parts and hardware.
- CAM contains paths and operations.
- Industrial validation returns `certified: true`.
- MobiView returns a view snapshot for the project id.
- `RealProjectRunner` returns `approved: true`.

## Expected Human Result

Charles should be able to:

1. Open Mobi Studio Host.
2. Select `ProjetoReferencia.mobi`.
3. Click `Executar Fluxo`.
4. See the result in MobiView.
5. Approve the reference execution.

