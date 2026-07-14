# Dry Run Validation v1

O dry run é uma verificação em memória, sem máquina, I/O ou efeitos externos.

Ele exige ao menos uma operação, profundidade finita e positiva e presença de um comando associado a cada ID de operação no arquivo produzido. Antes dele, o SyntaxValidator exige conteúdo, cinco metadados de cabeçalho, números válidos e ausência de caracteres nulos.

O dry run não simula cinemática, colisão física, ferramenta, fixação, spindle, feeds, speeds ou limites reais. Aprovação nesta fase significa apenas consistência estrutural do arquivo e não segurança para execução em CNC.
