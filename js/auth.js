function esperarLogin(aoLogar) {
  auth.onAuthStateChanged((user) => {
    if (user) aoLogar(user);
    else location.href = "login.html";
  });
}

function esperarVisitante() {
  auth.onAuthStateChanged((user) => {
    if (user) location.href = "index.html";
  });
}

const entrar = (email, senha) => auth.signInWithEmailAndPassword(email, senha);
const criarConta = (email, senha) => auth.createUserWithEmailAndPassword(email, senha);
const recuperarSenha = (email) => auth.sendPasswordResetEmail(email);
const sair = () => auth.signOut();

function traduzirErro(codigo) {
  const erros = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/missing-password": "Digite a senha.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Este e-mail já tem uma conta. Clique em Entrar.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
    "auth/network-request-failed": "Sem conexão com a internet."
  };
  return erros[codigo] || "Algo deu errado. Tente novamente.";
}
