import { Request, Response } from 'express';
import { EvolutionService } from '../services/evolution.service';

/**
 * Função auxiliar para formatar números de WhatsApp (Brasil)
 */
function formatWhatsAppNumber(remoteJid: string | undefined): string {
  if (!remoteJid) return 'Desconhecido';

  let number = remoteJid.split('@')[0];
  number = number.split(':')[0].split('-')[0];
  number = number.replace(/\D/g, '');

  if (number.length > 15) {
    return number;
  }

  if (number.startsWith('55') || (number.length >= 10 && number.length <= 11)) {
    let rawNumber = number.startsWith('55') ? number.substring(2) : number;
    
    if (rawNumber.length === 10) {
      rawNumber = rawNumber.substring(0, 2) + '9' + rawNumber.substring(2);
    }
    
    if (rawNumber.length === 11) {
      const ddd = rawNumber.substring(0, 2);
      const prefix = rawNumber.substring(2, 7);
      const suffix = rawNumber.substring(7);
      return `(${ddd}) ${prefix}-${suffix}`;
    }
  }

  return number || 'Desconhecido';
}

export const evolutionWebhook = async (req: Request, res: Response) => {
  const data = req.body;
  const event = data.event;
  
  // Normalização do evento
  const rawEvent = (event || req.params.event || '').toString().toLowerCase();
  const isMessageUpsert = rawEvent.includes('messages') && (rawEvent.includes('upsert'));
  
  if (isMessageUpsert) {
    const messageData = data.data?.message ? data.data : (Array.isArray(data.data) ? data.data[0] : data.data);
    
    if (!messageData) return res.status(200).json({ status: 'no_data' });

    const remoteJid = messageData?.key?.remoteJid;
    const isGroup = remoteJid?.endsWith('@g.us');
    
    // FILTRO: Só queremos mensagens de GRUPO
    if (!isGroup) {
      return res.status(200).json({ status: 'ignored_private' });
    }

    // Filtros de Mensagens de Teste
    const messageId = messageData?.key?.id || '';
    const messageText = messageData?.message?.conversation || 
                        messageData?.message?.extendedTextMessage?.text || 
                        messageData?.message?.imageMessage?.caption ||
                        messageData?.message?.videoMessage?.caption ||
                        messageData?.message?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
                        '';

    const isTestMessage = 
      messageId.startsWith('ABC') || 
      messageId.startsWith('TEST') ||
      messageText.includes('Esta mensagem de GRUPO') ||
      messageText.includes('Teste de conexao');

    if (isTestMessage) {
      return res.status(200).json({ status: 'ignored_test' });
    }

    let senderNumber = messageData?.key?.participant || remoteJid;
    const pushName = messageData?.pushName || '';

    if (senderNumber.includes('@lid')) {
      if (pushName.match(/^\d+$/)) {
        senderNumber = pushName;
      } else if (remoteJid.includes('-')) {
        const creatorNumber = remoteJid.split('-')[0];
        if (creatorNumber.length >= 10 && creatorNumber.length <= 13) {
           senderNumber = creatorNumber;
        }
      }
    }

    const formattedNumber = formatWhatsAppNumber(senderNumber);

    let groupName = 
      data.data?.source?.groupName || 
      messageData?.message?.groupMetadata?.subject || 
      messageData?.message?.groupName || 
      data.data?.groupName;

    const instance = data.instance || 'vox';
    
    if (!groupName || groupName === 'Grupo') {
      try {
        const groupInfo = await EvolutionService.getGroupInfo(instance, remoteJid);
        if (groupInfo && groupInfo.subject) {
          groupName = groupInfo.subject;
        }
      } catch (err: any) {}
    }

    groupName = groupName || 'Grupo Desconhecido';

    const finalMessageText = messageText || '[Mídia ou Outro Tipo]';
    
    const timestamp = messageData?.messageTimestamp ? new Date(messageData.messageTimestamp * 1000) : new Date();
    const formattedDate = timestamp.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // EXIBIÇÃO LIMPA NO TERMINAL CONFORME SOLICITADO
    console.log(`Grupo: ${groupName}`);
    console.log(`De: ${formattedNumber}`);
    console.log(`Data: ${formattedDate}`);
    console.log(`Mensagem: ${finalMessageText}`);
    console.log('--------------------------------\n');
    
  }
  
  res.status(200).json({ status: 'received' });
};

export const createInstance = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da instância é obrigatório' });
    
    const instance = await EvolutionService.createInstance(name);
    res.status(201).json(instance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listInstances = async (_req: Request, res: Response) => {
  try {
    const instances = await EvolutionService.listInstances();
    res.status(200).json(instances);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQrCode = async (_req: Request, res: Response) => {
  try {
    const instance = 'vox';
    const data = await EvolutionService.getQrCode(instance);
    
    if (data.base64) {
      res.send(`
        <html lang="">
          <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f0f2f5;">
            <div style="background:white;padding:40px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1);text-align:center;">
              <h2 style="color:#128c7e;">Conectar WhatsApp</h2>
              <p style="color:#667781;">Escaneie o código abaixo para ativar o VoxBairro</p>
              <img src="${data.base64}" style="border:1px solid #e9edef;margin:20px 0;"  alt=""/>
              <p style="font-size:12px;color:#8696a0;">A página atualiza sozinha a cada 30 segundos.</p>
            </div>
            <script>setTimeout(() => location.reload(), 30000);</script>
          </body>
        </html>
      `);
    } else {
      res.status(404).send('QR Code não disponível. Verifique se a instância vox existe.');
    }
  } catch (error: any) {
    res.status(500).send('Erro ao buscar QR Code: ' + error.message);
  }
};
