let _timer = null;

function mostrarStatus(texto) {
  const el = document.getElementById("status");
  if (el) el.textContent = texto;
}

async function carregarDaNuvem(uid) {
  const doc = await db.collection("listas").doc(uid).get();
  return doc.exists ? JSON.parse(doc.data().dados) : null;
}

function salvarNaNuvem(estado) {
  const user = auth.currentUser;
  if (!user) return;

  clearTimeout(_timer);
  mostrarStatus("Salvando…");

  _timer = setTimeout(() => {
    db.collection("listas").doc(user.uid)
      .set({
        dados: JSON.stringify(estado),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => mostrarStatus("Salvo na nuvem ✓"))
      .catch(() => mostrarStatus("Não foi possível salvar. Verifique a conexão."));
  }, 400);
}
