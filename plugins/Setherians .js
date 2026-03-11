let handler = async (m, { args, usedPrefix }) => {

  let user = global.db.data.users[m.sender]

  // 🔐 Inicialización
  if (!user.terianx) user.terianx = null
  if (!user.terianxGenero) user.terianxGenero = null

  // 📌 Uso correcto
  if (args.length < 2) {
    return m.reply(`🐾 *SETHERIANS - CREA O CAMBIA TU THERIAN*

Usa:
${usedPrefix}setherians animal genero

Ejemplos:
${usedPrefix}setherians lobo macho
${usedPrefix}setherians dragon hembra
${usedPrefix}setherians tigre macho

⚧ Género permitido:
• macho
• hembra`)
  }

  // 📌 Datos
  let genero = args[args.length - 1].toLowerCase()
  let animal = args.slice(0, -1).join(" ")

  // 📌 Validar género
  if (!["macho", "hembra"].includes(genero)) {
    return m.reply(`❌ Género inválido

Usa: macho o hembra

Ejemplo:
${usedPrefix}setherians lobo macho`)
  }

  // 📌 Validar animal
  if (!animal || animal.length < 2) {
    return m.reply(`❌ Debes escribir un animal válido`)
  }

  // ✨ Formato bonito
  animal = animal.charAt(0).toUpperCase() + animal.slice(1)

  // 📌 Verificar si ya tenía uno
  let anterior = user.terianx

  // 💾 Guardar
  user.terianx = animal
  user.terianxGenero = genero

  // ✅ Mensaje dinámico
  if (anterior) {
    return m.reply(`🔁 Therian actualizado

📌 Antes » ${anterior}
🧠 Ahora » ${animal}
⚧ Tipo » ${genero.charAt(0).toUpperCase() + genero.slice(1)}

🔥 Se actualizó en tu perfil`)
  } else {
    return m.reply(`✅ Therian creado

🧠 Therians » ${animal}
⚧ Tipo » ${genero.charAt(0).toUpperCase() + genero.slice(1)}

🔥 Ya aparece en tu perfil`)
  }
}

handler.help = ['setherians <animal> <macho/hembra>']
handler.tags = ['rpg']
handler.command = ['setherians']

export default handler
