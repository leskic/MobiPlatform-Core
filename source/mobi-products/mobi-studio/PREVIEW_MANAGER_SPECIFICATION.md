# Preview Manager Specification

Preview é overlay temporário composto por before/after derivados do Scene Graph. A cena permanente nunca é modificada. Cada novo preview descarta o anterior; update exige o mesmo IntentID; rollback e descarte restauram imediatamente o snapshot permanente no renderer. Nenhum preview é persistido.
