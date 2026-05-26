# 🥖 Padaria do Zé — Sistema Base
## Disciplina: Arquitetura de Software | 3º Período ADS

---

## 📦 Como Rodar o Projeto (Passo a Passo)

### Pré-requisitos
- Docker Desktop instalado: https://www.docker.com/products/docker-desktop
- Git instalado

### 1. Subir todos os contêineres
```bash
# Na pasta raiz do projeto:
docker-compose up --build
```

Aguarde todos os serviços subirem. Na primeira vez pode demorar alguns minutos.

### 2. Acessar o Sistema

| Serviço             | URL                          |
|---------------------|------------------------------|
| Frontend (React)    | http://localhost:3000        |
| Backend Produtos    | http://localhost:3001/health |
| Backend Pedidos     | http://localhost:3002/health |
| pgAdmin (banco)     | http://localhost:5050        |

### 3. Login no pgAdmin
- **Email:** admin@padaria.com
- **Senha:** admin123

### 4. Conectar ao banco no pgAdmin
1. Clique em "Add New Server"
2. Na aba **General**: Name = `Padaria`
3. Na aba **Connection**:
   - Host: `postgres`
   - Port: `5432`
   - Database: `padaria_db`
   - Username: `padaria_user`
   - Password: `padaria123`
4. Clique em Save

---

## 🏗️ O Que são Microsserviços?

Microsserviços é um estilo de arquitetura onde **uma aplicação é dividida em serviços pequenos e independentes**, cada um responsável por uma função específica.

### Arquitetura Monolítica (tradicional)
```
┌────────────────────────────────────┐
│         SISTEMA MONOLÍTICO         │
│  Produtos + Pedidos + Clientes     │
│  + Auth + Relatórios + Tudo...     │
└────────────────────────────────────┘
            │
         Banco de Dados Único
```

**Problemas:** Se um módulo cai, tudo cai. Difícil de escalar individualmente.

### Arquitetura de Microsserviços (deste projeto)
```
┌─────────────────┐    ┌─────────────────┐
│   MS PRODUTOS   │    │   MS PEDIDOS    │
│   porta: 3001   │    │   porta: 3002   │
│  /api/produtos  │    │  /api/pedidos   │
│  /api/categorias│    │  /api/clientes  │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
            ┌───────┴────────┐
            │   PostgreSQL   │
            │  padaria_db    │
            └────────────────┘
                    ▲
            ┌───────┴────────┐
            │   pgAdmin      │
            │  porta: 5050   │
            └────────────────┘
```

**Vantagens dos Microsserviços:**
- ✅ Cada serviço pode ser escalado independentemente
- ✅ Falha em um serviço não derruba os outros
- ✅ Equipes diferentes podem trabalhar em paralelo
- ✅ Podem usar tecnologias diferentes por serviço
- ✅ Mais fácil de manter e testar

**Desvantagens (para discutir em sala):**
- ❌ Complexidade de comunicação entre serviços
- ❌ Mais difícil de debugar (distribuído)
- ❌ Overhead de rede entre serviços
- ❌ Consistência de dados mais difícil (transações distribuídas)

---

## 📊 Estrutura do Banco de Dados

```
categorias
├── id (PK)
├── nome
├── descricao
└── criado_em

produtos
├── id (PK)
├── nome
├── descricao
├── preco
├── estoque
├── categoria_id (FK → categorias)
├── imagem_url
├── ativo
├── criado_em
└── atualizado_em

clientes
├── id (PK)
├── nome
├── email (UNIQUE)
├── telefone
├── endereco
└── criado_em

pedidos
├── id (PK)
├── cliente_id (FK → clientes)
├── status
├── total
├── observacao
├── criado_em
└── atualizado_em

itens_pedido
├── id (PK)
├── pedido_id (FK → pedidos)
├── produto_id (FK → produtos)
├── quantidade
├── preco_unitario
└── subtotal (gerado automaticamente)
```

---

## 🗄️ Consultando Dados no pgAdmin

### Exemplos de queries para praticar:

```sql
-- Ver todos os produtos com categoria
SELECT p.nome, p.preco, c.nome AS categoria
FROM produtos p
JOIN categorias c ON p.categoria_id = c.id
ORDER BY p.preco;

-- Ver pedidos com o nome do cliente
SELECT pe.id, cl.nome, pe.status, pe.total
FROM pedidos pe
JOIN clientes cl ON pe.cliente_id = cl.id;

-- Ver itens de um pedido específico
SELECT ip.quantidade, pr.nome, ip.preco_unitario, ip.subtotal
FROM itens_pedido ip
JOIN produtos pr ON ip.produto_id = pr.id
WHERE ip.pedido_id = 1;

-- Contar pedidos por status
SELECT status, COUNT(*) as quantidade
FROM pedidos
GROUP BY status;

-- Produtos com estoque baixo
SELECT nome, estoque FROM produtos WHERE estoque < 20;
```

---

## 📁 Estrutura do Projeto

```
padaria/
├── docker-compose.yml          ← Orquestra todos os contêineres
├── docker/
│   └── init.sql                ← Cria tabelas e insere dados iniciais
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js           ← Ponto de entrada (detecta qual microsserviço)
│       ├── config/
│       │   └── database.js     ← Conexão com PostgreSQL
│       ├── controllers/        ← Lógica de negócio
│       │   ├── produtos.controller.js
│       │   ├── categorias.controller.js
│       │   ├── pedidos.controller.js
│       │   └── clientes.controller.js
│       └── routes/             ← Definição das rotas HTTP
│           ├── produtos.routes.js
│           ├── categorias.routes.js
│           ├── pedidos.routes.js
│           └── clientes.routes.js
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.js              ← Roteamento principal
        ├── index.css           ← Estilos globais
        ├── services/
        │   └── api.js          ← Comunicação com os microsserviços
        └── pages/
            ├── Dashboard.js
            ├── Produtos.js
            ├── Categorias.js
            ├── Clientes.js
            └── Pedidos.js
```

---

## 🛠️ Comandos Docker Úteis

```bash
# Subir os contêineres
docker-compose up

# Subir em background (modo detached)
docker-compose up -d

# Ver logs de um serviço específico
docker-compose logs backend-produtos
docker-compose logs backend-pedidos

# Parar tudo
docker-compose down

# Parar e apagar o banco de dados (CUIDADO!)
docker-compose down -v

# Entrar dentro de um contêiner
docker exec -it padaria_postgres bash

# Acessar o psql (terminal SQL)
docker exec -it padaria_postgres psql -U padaria_user -d padaria_db
```

---

## 🎯 Atividades para os Alunos

### 🥉 Nível 1 — Banco de Dados (pgAdmin)
1. Conectar ao banco no pgAdmin
2. Executar as queries de exemplo deste README
3. Criar uma nova tabela `funcionarios` com pelo menos 5 colunas
4. Inserir 5 funcionários via SQL
5. Criar uma tabela `fornecedores` e relacioná-la com `produtos`

### 🥈 Nível 2 — Backend (Node.js)
1. Criar o arquivo `funcionarios.controller.js` com CRUD completo
2. Criar as rotas `funcionarios.routes.js`
3. Registrar as rotas no `server.js`
4. Criar um **terceiro microsserviço** para `funcionarios` no `docker-compose.yml`
5. Adicionar autenticação JWT (middleware de autenticação)

### 🥇 Nível 3 — Frontend (React)
1. Criar a página `Funcionarios.js` com listagem e cadastro
2. Adicionar paginação na listagem de produtos
3. Criar filtro de busca por nome nos produtos
4. Implementar dashboard com gráficos (sugestão: Chart.js ou Recharts)
5. Criar tela de relatório de vendas por período

### 🏆 Nível Extra — Arquitetura
1. Adicionar um API Gateway (ex: nginx) para unificar as chamadas
2. Implementar cache com Redis
3. Adicionar mensageria com RabbitMQ
4. Configurar monitoramento com Grafana + Prometheus
5. Escrever testes automatizados com Jest

---

## 📚 Conceitos que Você Vai Aprender

- **Docker & Docker Compose** — Containerização de aplicações
- **PostgreSQL** — Banco de dados relacional robusto
- **pgAdmin** — Interface gráfica para gerenciar PostgreSQL
- **Node.js + Express** — Backend JavaScript
- **React** — Frontend moderno com componentes
- **MVC Pattern** — Model, View, Controller
- **REST API** — Comunicação entre serviços
- **Microsserviços** — Arquitetura distribuída
- **CRUD** — Create, Read, Update, Delete
- **SQL Joins** — Relacionamentos entre tabelas
- **Transações** — Garantia de integridade dos dados

---

*Projeto desenvolvido para fins educacionais — Disciplina de Arquitetura de Software*
