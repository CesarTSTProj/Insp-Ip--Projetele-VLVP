/*
=================================================
INSP - SINCRONIZAÇÃO
=================================================

Responsabilidades:

- Preparar dados para envio
- Converter foto para Base64
- Comunicar com Google Apps Script
- Sincronizar inspeções pendentes
- Sincronização manual
- Validar resposta do servidor

=================================================
*/

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxulJAYuJ_CzJMU6BAsiQPkzcSuUJVJ3fr4UupFjPeNjGytzI7sqwW2ZhlbvGqoLLr-/exec';
let idComprovanteAtual = null;
