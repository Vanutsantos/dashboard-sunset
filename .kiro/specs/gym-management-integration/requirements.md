# Requirements Document

## Introduction

O Dashboard Sunset é um sistema de agregação de dados que consome informações da API do Next Fit (plataforma de gestão para academias) e as exibe em um dashboard centralizado. O sistema permite que administradores visualizem dados consolidados de clientes, professores e vendas, enquanto professores têm acesso restrito aos dados dos seus próprios alunos. O Firebase é utilizado para armazenar dados de acesso de usuários e informações de professores. O sistema também suporta upload de planilhas para associação com dados vindos da API.

## Glossary

| Termo     | Definição                                                                         |
| --------- | --------------------------------------------------------------------------------- |
| Next Fit  | Plataforma externa de gestão para academias cuja API é consumida pelo dashboard   |
| Dashboard | Painel de visualização de dados agregados do sistema                              |
| Admin     | Usuário administrador com acesso completo a todos os dados                        |
| Professor | Usuário instrutor com acesso restrito aos dados dos seus próprios alunos          |
| Planilha  | Arquivo (CSV/Excel) enviado via upload para associação com dados da API           |
| Firebase  | Serviço de backend utilizado para autenticação e armazenamento de dados de acesso |

## Requirements

### Requirement 1: Autenticação e Controle de Acesso

**User Story:** Como administrador ou professor, eu quero fazer login no sistema de forma segura, para que eu possa acessar os dados da academia conforme meu perfil de permissão.

#### Acceptance Criteria

1. IF o usuário não está autenticado, THEN O Sistema SHALL redirecionar o usuário para a tela de login ao tentar acessar qualquer rota do dashboard, em no máximo 2 segundos.
2. WHEN o usuário submete o formulário de login com email e senha válidos (email em formato válido e senha correspondente a uma conta ativa), O Sistema SHALL autenticar o usuário via Firebase Auth e redirecionar para o dashboard em no máximo 3 segundos.
3. IF o usuário submete o formulário de login com credenciais inválidas (email não cadastrado ou senha incorreta), THEN O Sistema SHALL exibir uma mensagem de erro indicando falha na autenticação, sem revelar qual campo está incorreto, e manter o usuário na tela de login.
4. IF o usuário falha na autenticação 5 vezes consecutivas dentro de um período de 15 minutos, THEN O Sistema SHALL bloquear temporariamente novas tentativas de login para aquele email por 5 minutos e exibir mensagem indicando o bloqueio temporário.
5. WHILE o usuário está autenticado com perfil admin, O Sistema SHALL exibir todos os dados disponíveis no dashboard (clientes, professores, vendas).
6. WHILE o usuário está autenticado com perfil professor, O Sistema SHALL exibir apenas os dados dos alunos vinculados a esse professor, ocultando dados de outros alunos, professores e vendas.
7. IF o usuário com perfil professor tenta acessar uma rota restrita ao perfil admin, THEN O Sistema SHALL negar o acesso e redirecionar o usuário para o dashboard do professor, exibindo mensagem indicando permissão insuficiente.
8. WHEN o usuário autenticado clica no botão "Sair", O Sistema SHALL encerrar a sessão (invalidando o token de autenticação e removendo dados de sessão do navegador) e redirecionar o usuário para a tela de login em no máximo 2 segundos.
9. IF a sessão do usuário permanece inativa por mais de 30 minutos, THEN O Sistema SHALL encerrar a sessão automaticamente e redirecionar o usuário para a tela de login na próxima interação.

### Requirement 2: Integração com a API do Next Fit

**User Story:** Como administrador, eu quero que o sistema consuma dados da API do Next Fit automaticamente, para que eu possa visualizar informações atualizadas de clientes, professores e vendas no dashboard.

#### Acceptance Criteria

1. WHEN o dashboard é carregado, THE Sistema SHALL iniciar requisições à API do Next Fit para obter dados de clientes, professores e vendas, e exibir um indicador de carregamento até que todas as requisições sejam concluídas ou atinjam o timeout de 10 segundos.
2. WHEN as requisições à API do Next Fit são concluídas com sucesso, THE Sistema SHALL exibir os dados de clientes, professores e vendas em suas respectivas seções do dashboard, incluindo no mínimo: quantidade total de registros retornados para cada categoria.
3. WHEN o dashboard permanece aberto, THE Sistema SHALL atualizar os dados consumidos da API do Next Fit a cada 5 minutos, sem necessidade de recarga manual da página.
4. IF uma requisição à API do Next Fit não receber resposta dentro de 10 segundos, THEN THE Sistema SHALL exibir uma mensagem de erro indicando indisponibilidade do serviço na seção correspondente aos dados não carregados, preservando os dados das demais seções que foram carregadas com sucesso.
5. IF as credenciais da API do Next Fit estiverem inválidas ou expiradas, THEN THE Sistema SHALL exibir uma mensagem de erro indicando falha de autenticação e não exibir dados parciais ou desatualizados nas seções afetadas.
6. WHILE o Sistema exibe dados previamente carregados, IF uma atualização automática falhar, THEN THE Sistema SHALL manter os dados da última consulta bem-sucedida visíveis e exibir um indicador informando a data e hora da última atualização bem-sucedida.

### Requirement 3: Armazenamento de Dados no Firebase

**User Story:** Como administrador, eu quero que os dados de acesso de usuários e informações de professores sejam armazenados no Firebase, para que o sistema tenha persistência própria independente da API externa.

#### Acceptance Criteria

1. WHEN o cadastro de um novo usuário (admin ou professor) é concluído, THE sistema SHALL armazenar no Firebase Firestore os seguintes dados de acesso: e-mail, perfil (admin ou professor), data de criação e UID do Firebase Authentication.
2. WHEN o administrador aciona a sincronização de professores a partir da API do Next Fit, THE sistema SHALL salvar ou atualizar no Firebase Firestore as informações dos professores retornadas pela API (nome, e-mail, telefone, e identificador na API externa), prevalecendo os dados da API em caso de divergência com os dados existentes no Firebase, em no máximo 30 segundos para até 200 registros.
3. WHEN os dados de um professor cadastrado no Firebase são consultados, THE sistema SHALL retornar todos os campos armazenados (nome, e-mail, telefone, perfil, identificador da API externa e data da última sincronização) com valores idênticos aos gravados no Firestore.
4. WHEN o administrador acessa a tela de gestão de usuários, THE sistema SHALL exibir a lista de todos os usuários cadastrados contendo nome, e-mail e perfil (admin ou professor), com suporte a até 500 registros.
5. IF a gravação no Firebase Firestore falhar durante o cadastro ou sincronização, THEN THE sistema SHALL exibir uma mensagem de erro indicando a falha na persistência e preservar os dados já existentes sem alteração.
6. IF um professor existente no Firebase não for retornado pela API do Next Fit durante a sincronização, THEN THE sistema SHALL manter o registro do professor no Firebase sem alterá-lo ou removê-lo.

### Requirement 4: Upload e Associação de Planilhas

**User Story:** Como administrador, eu quero fazer upload de planilhas com dados complementares, para que eu possa associá-los aos dados vindos da API do Next Fit e enriquecer as informações disponíveis no dashboard.

#### Acceptance Criteria

1. WHEN o admin acessa a funcionalidade de upload, THE Sistema SHALL exibir uma área de drag-and-drop e um botão de seleção de arquivo que aceita exclusivamente arquivos nos formatos CSV (.csv) e Excel (.xls, .xlsx) com tamanho máximo de 5 MB.
2. WHEN o admin confirma o upload de um arquivo válido, THE Sistema SHALL processar o arquivo, armazenar os dados e exibir uma mensagem de sucesso indicando a quantidade de registros importados em até 30 segundos.
3. IF o admin envia um arquivo com formato diferente de CSV ou Excel, ou com tamanho superior a 5 MB, THEN THE Sistema SHALL rejeitar o upload e exibir uma mensagem de erro indicando o motivo da rejeição (formato não suportado ou tamanho excedido).
4. WHEN o sistema processa a associação dos dados importados, THE Sistema SHALL vincular cada registro da planilha ao registro correspondente da API do Next Fit utilizando como chave de associação um identificador presente em ambas as fontes (ex.: ID do aluno ou e-mail), e exibir um resumo com a quantidade de registros associados com sucesso.
5. IF a planilha contém registros cujo identificador não corresponde a nenhum registro da API do Next Fit, THEN THE Sistema SHALL exibir uma lista dos registros não associados contendo o número da linha e o valor do identificador utilizado na tentativa de correspondência.
6. IF a planilha contém linhas com dados obrigatórios ausentes ou com valores em formato inválido, THEN THE Sistema SHALL ignorar as linhas com erro, completar a importação das linhas válidas e exibir um resumo indicando a quantidade de linhas com erro e os números das linhas rejeitadas.

### Requirement 5: Visualização de Dados no Dashboard (Admin)

**User Story:** Como administrador, eu quero visualizar os dados agregados de clientes, professores e vendas em um painel centralizado, para que eu possa ter uma visão geral da operação da academia.

#### Acceptance Criteria

1. WHEN o admin autenticado acessa o dashboard, THE System SHALL exibir um resumo dos clientes cadastrados no Next Fit contendo no mínimo: quantidade total de clientes ativos, quantidade de clientes inativos e a lista dos últimos 10 clientes cadastrados com nome e data de cadastro.
2. WHEN o admin autenticado acessa o dashboard, THE System SHALL exibir um resumo dos professores contendo no mínimo: quantidade total de professores e a lista dos professores cadastrados com nome e status (ativo/inativo).
3. WHEN o admin autenticado acessa o dashboard, THE System SHALL exibir informações de vendas da academia contendo no mínimo: valor total de vendas do mês corrente, quantidade de vendas do mês corrente e a lista das últimas 10 vendas com data e valor.
4. WHILE os dados estão sendo carregados da API Next Fit, THE System SHALL exibir um indicador de carregamento (skeleton ou spinner) em cada seção do dashboard até que os dados estejam disponíveis para exibição.
5. WHEN o admin navega entre as seções do dashboard, THE System SHALL exibir o conteúdo da nova seção sem recarregamento completo da página (navegação SPA) em no máximo 300ms após o clique.
6. WHEN o admin aplica um filtro ou termo de busca, THE System SHALL atualizar os resultados exibidos em no máximo 500ms após a última entrada do usuário, sem recarregamento da página.
7. IF a API Next Fit retornar erro ou estiver indisponível durante o carregamento do dashboard, THEN THE System SHALL exibir uma mensagem de erro indicando a indisponibilidade dos dados na seção afetada e oferecer uma opção para tentar novamente, preservando os dados já carregados nas demais seções.

### Requirement 6: Visualização de Dados no Dashboard (Professor)

**User Story:** Como professor, eu quero visualizar os dados dos meus alunos no dashboard, para que eu possa acompanhar as informações relevantes ao meu trabalho.

#### Acceptance Criteria

1. WHEN o professor autenticado acessa o dashboard, THE sistema SHALL exibir uma lista contendo exclusivamente os alunos vinculados a esse professor, apresentando para cada aluno no mínimo: nome completo, identificador do aluno e status de matrícula, em até 3 segundos após o acesso.
2. IF não houver nenhum aluno vinculado ao professor autenticado, THEN THE sistema SHALL exibir uma mensagem informando que não há alunos vinculados, sem exibir dados de outros professores.
3. WHEN o professor autenticado tenta acessar dados de alunos que não estão vinculados a ele, THE sistema SHALL negar o acesso e exibir uma mensagem indicando permissão insuficiente, mantendo o professor na sua área restrita do dashboard.
4. WHEN o professor autenticado insere ao menos 2 caracteres no campo de busca de alunos, THE sistema SHALL filtrar e exibir apenas os alunos vinculados a esse professor cujo nome ou identificador correspondam ao termo pesquisado, apresentando os resultados em até 2 segundos.
5. IF a busca realizada pelo professor não retornar nenhum resultado dentro do seu escopo de alunos, THEN THE sistema SHALL exibir uma mensagem indicando que nenhum aluno foi encontrado para o termo pesquisado, limitando a exibição de resultados a no máximo 50 registros por página.

### Requirement 7: Interface Responsiva com Tailwind CSS

**User Story:** Como usuário (admin ou professor), eu quero que o dashboard tenha uma interface moderna e responsiva, para que eu possa acessá-lo confortavelmente em diferentes dispositivos.

#### Acceptance Criteria

1. WHEN o usuário acessa o dashboard em uma viewport com largura >= 1024px, THE Sistema SHALL exibir uma navegação lateral fixa visível e o conteúdo principal em layout de múltiplas colunas lado a lado, sem necessidade de rolagem horizontal.
2. WHEN o usuário acessa o dashboard em uma viewport com largura entre 768px e 1023px, THE Sistema SHALL ocultar a navegação lateral e disponibilizá-la por meio de um botão de menu, exibindo o conteúdo principal em no máximo duas colunas sem rolagem horizontal.
3. WHEN o usuário acessa o dashboard em uma viewport com largura inferior a 768px, THE Sistema SHALL exibir o conteúdo em coluna única, disponibilizar a navegação por meio de um botão de menu, e garantir que todos os elementos interativos possuam área de toque mínima de 44x44px.
4. THE Sistema SHALL renderizar todas as páginas sem rolagem horizontal em qualquer viewport com largura entre 320px e 1920px.
5. WHILE a navegação estiver oculta em viewports inferiores a 1024px, WHEN o usuário aciona o botão de menu, THE Sistema SHALL exibir o painel de navegação em até 300ms.
6. THE Sistema SHALL utilizar exclusivamente classes utilitárias do Tailwind CSS para estilização, sendo permitido CSS customizado apenas para animações ou integrações de terceiros não cobertas pelo Tailwind.
