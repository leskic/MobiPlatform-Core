# Render Pipeline Specification

GraphicsContext desacopla o backend. CanvasEngine valida viewport, inicializa contexto, gerencia resize e descarte. RenderScheduler executa frames somente enquanto ativo e contabiliza ticks determinísticos. A entrada de render é sempre snapshot de SceneNodes e CameraState.
