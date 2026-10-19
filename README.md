# Precifica Assistente — MVP 0.1

Extensão local para Chrome (Manifest V3). Captura título, preço e imagem de uma página de anúncio aberta e oferece preenchimento assistido da tela de precificação.

## Instalação
1. Extraia o ZIP para uma pasta local.
2. Abra `chrome://extensions`.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e selecione a pasta `precifica-assistente`.
5. Fixe a extensão na barra do Chrome, se desejar.

## Uso
1. Abra a página completa do anúncio.
2. Clique na extensão e em **Capturar anúncio desta aba**.
3. Confira e corrija título, preço e URL da imagem.
4. Abra a tela de precificação.
5. Clique na extensão e em **Preencher sistema nesta aba**.
6. Revise todos os campos e finalize o cadastro manualmente pelo sistema oficial.

## Limitações importantes
- O MVP tenta ler metadados Open Graph, Product JSON-LD e o título da página. Alguns sites ocultam ou não publicam esses dados; revise sempre.
- O preenchimento só atua em campos visíveis de texto com nomes/IDs/labels reconhecíveis. Se não identificar exatamente um campo, deixa-o sem preencher.
- Categoria/select, upload real de arquivo, botão de adicionar produto, modal de etiquetas e impressão continuam manuais.
- Uma URL de imagem não equivale a enviar um arquivo local. O MVP não tenta preencher campos `type=file`.
- Nenhum botão de cadastro é acionado e nenhuma requisição é enviada a um servidor pela extensão.
- A permissão `activeTab` limita a execução à aba que você aciona. Não há acesso persistente a todos os sites.
- Teste primeiro em uma página não produtiva ou com cadastro de teste autorizado. Não use preços capturados sem validar variante, voltagem, condição, frete e unidade.
- Se a tela usa componentes React/Vue customizados, os eventos podem não ser suficientes; adapte os seletores depois de confirmar o HTML real, sem compartilhar credenciais ou dados internos.

## Próxima etapa
Para ajustar a captura e os seletores com segurança, precisamos conhecer apenas os nomes/labels dos campos da tela de precificação. Use dados fictícios e oculte informações internas antes de compartilhar uma captura de tela.



Buscar via link
classe ds-search-input
(primeiro de tudo é inserir o link do anuncio nesse campo e clicar no button com o texto "Buscar"

Nome
label (texto do label)="Nome"
tambem é um textarea o input

Categoria
label (texto do label)="Categoria ML "
é um select

Preço
label (texto do label)="Preço base (R$)"
é un input 

Quantidade
label (texto do label)="Quantidade"

Botão de cadastro
button (atributo "tittle")="Cadastrar + Adicionar ao Palete"

a imagem é inserida após clicar em
button atributo "title": Colar imagem manualmente e surgir um modal
para dar ctrl + v no aria-label=Área para colar imagem

e para definir a imagem basta clicar no botão com o texto "Usar imagem"

e para finalizar o cadastro basta clicar no button com atributo title: Cadastrar + Adicionar ao Palete

