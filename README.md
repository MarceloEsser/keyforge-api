# keyforge-api
Api simples criada para controlar histórico e contas referente ao card game keyforge (https://www.keyforgegame.com/)

# Sobre o projeto
A ideia surgiu na falta de um app descente que fizesse esse trabalho. Keyforge conta com um sistema de contadores um pouco mais complexo do que o comum.
Assim deixando um desafio considerável desde como modular os dados no banco até a como controlar os tokens na tela do app.
Projeto feito todo com a ajuda do firebase, foram utilizados os seguintes frameworks: Firebase authentication, firestore e cloud functions, hospedados no google cloud.
O Intuito principal do projeto é aprender e intender como funciona a construção e implementação de uma API Rest e trabalhar com sistema de Auth.

# Engenharia
Projeto feito em Node, foi utilizado a linguagem Typescript e alguns frameworks do firebase, para criar as funções que salvariam as dados e/ou consumiriam os dados.

## @POST /createAccount
Antes do login esse é o primeiro método a ser chamado. Um post usado para criar uma conta no firebase Auuthentication e salvar alguns dados no banco como o email, nick do usuário
exemplo de request body necessário para criar um usuário:
