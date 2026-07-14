# Intent Factory Specification

Fábrica stateless para MOVE, CREATE, DELETE, ROTATE, RESIZE e SELECT. ID determinístico: `intent:{kind}:{entityId}:{sequence}`. Entrada exige EntityID não vazio e sequence inteiro não negativo. Saída sempre `PENDING`, com payload clonado defensivamente.
