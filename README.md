# 📡 VoxBairro AI
> **Inteligência de Sinais: Monitoramento, Sentimento e Geolocalização em Tempo Real**

O **VoxBairro AI** é uma plataforma de inteligência social projetada para capturar e estruturar o fluxo de informações em grupos de WhatsApp. O sistema utiliza a **Evolution API** para gerenciar as instâncias, processa áudios e textos através de modelos de IA locais e organiza as informações por sentimentos (**Apoio/Objeção**) e bairros.

---

## 🏗️ 1. Arquitetura do Sistema (Multi-Container)

O projeto utiliza uma arquitetura de microsserviços para garantir fluidez. O processamento pesado de IA é isolado do recebimento de mensagens para que o sistema não apresente lentidão.

### Componentes:
* **Evolution API:** Microserviço especializado em gerenciar instâncias de WhatsApp (Baseado em Baileys).
* **Vox-Backend (Node.js):** O "cérebro" que recebe Webhooks da Evolution, aplica filtros de keywords e gere o contexto.
* **Redis + BullMQ:** Gerenciamento de filas para tarefas assíncronas (IA) e cache de mensagens recentes.
* **MongoDB (Docker Lite):** Banco NoSQL otimizado para armazenamento em coleções dinâmicas.
* **AI Workers (Python):** Scripts independentes para transcrição (Whisper) e análise de sentimento (NLP).

---

## 🛠️ 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Integração WhatsApp** | Evolution API | Estabilidade e gestão profissional de instâncias via API. |
| **Backend Principal** | Node.js (TypeScript) | Alta performance em I/O e processamento de Webhooks. |
| **Banco de Dados** | MongoDB (Docker Lite) | Flexibilidade total para criar coleções por Keyword. |
| **Filas / Cache** | Redis | Buffer para áudios e memória de contexto para bairros. |
| **Transcrição (STT)** | OpenAI Whisper | Modelo local gratuito para alta precisão sonora. |
| **Sentimento (NLP)** | BERTimbau / spaCy | IA treinada para Português-BR e extração de endereços. |

---

## 📂 3. Estrutura de Pastas

```text
voxbairro-project/
├── vox-backend/             # Código Node.js (Regras de Negócio)
│   ├── src/
│   │   ├── config/          # Evolution API, Mongo & Redis Config
│   │   ├── controllers/     # Handlers de Webhooks (Recebimento de dados)
│   │   ├── database/models/ # Schemas dinâmicos do Mongoose
│   │   ├── queues/          # Produtores de fila para IA (BullMQ)
│   │   ├── routes/          # Endpoints para Frontend e Webhooks
│   │   ├── services/        # Filtro, Contexto e Lógica de Negócio
│   │   └── server.ts        # Ponto de entrada Express
├── ai-workers/              # Processamento de IA (Python)
│   ├── audio-worker/        # Whisper (Transcrição de voz)
│   └── sentiment-worker/    # BERT/NLP (Análise de Sentimento)
├── evolution-api/           # Persistência da API de WhatsApp
├── docker-compose.yml       # Orquestração Lite (RAM otimizada)
└── README.md                # Documentação do projeto