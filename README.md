# Bingo

Gerador de cartelas de bingo para eventos em geral: festas, bazares, ações comunitárias, confraternizações e qualquer sorteio presencial. A ideia é vender **uma folha A4 com 6 cartelas** para cada pessoa: juntas, elas cobrem todos os números de **1 a 90**, sem repetição. Assim, quem compra a folha acompanha o sorteio inteiro e joga com as seis cartelas ao mesmo tempo.

O app roda no navegador. Você gera as folhas, ajusta o visual e imprime (ou salva em PDF) no tamanho A4.

## Como as cartelas funcionam

Cada cartela segue o bingo clássico de 90:

- grade de **3 linhas × 9 colunas**
- **5 números** por linha (4 casas vazias)
- no máximo **2 números** na mesma coluna
- colunas por dezena: 1–9, 10–19, …, 80–90

Na mesma folha, os 90 números aparecem **uma vez só**. A cada geração, o algoritmo redistribui ao acaso quais números vão para qual cartela e em qual linha, sem usar um gabarito fixo.

## Personalização

Antes de imprimir, dá para:

- definir o título do evento
- escolher quantas folhas gerar
- usar A4 **vertical** ou **horizontal**
- mostrar ou esconder o cabeçalho da folha
- mudar as cores de borda, texto, listrado e fundo das casas vazias
- trocar a cor do papel ou colocar uma imagem de fundo

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço local do Vite, clique em **Gerar cartelas** e depois em **Imprimir A4**. Na caixa de impressão, use o tamanho A4, a orientação certa (retrato ou paisagem) e deixe os gráficos de fundo ligados se houver cor ou imagem no papel.

Para conferir o gerador:

```bash
npm test
```

## Stack

React, TypeScript e Vite.

Desenvolvido por [bretzke.dev](https://bretzke.dev).
