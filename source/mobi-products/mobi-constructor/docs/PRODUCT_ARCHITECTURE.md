# Product Architecture

O fluxo é estritamente `ProjectReader → Validator → TranslationEngine → OutputFramework`. Dependências da plataforma entram somente por contratos públicos registrados no bootstrap. Outputs industriais são descritores, não geradores.
