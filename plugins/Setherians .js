let handler = async (m, { args, usedPrefix }) => {

  let user = global.db.data.users[m.sender]

  // 🔐 Inicialización
  if (!user.terianx) user.terianx = null
  if (!user.terianxGenero) user.terianxGenero = null

  // 📌 Si ya tiene Therian
  if (user.terianx) {
    return m.reply(`❌ Ya tienes un Therian asignado

🧠 Therians » ${user.terianx}
⚧ Tipo » ${user.terianxGenero}

Si quieres cambiarlo, necesitarás un reset.`)
  }

  // 📌 Uso del comando
  if (args.length < 2) {
    return m.reply(`🐾 *SETHERIANS - CREA TU THERIAN*

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

  // 📌 Obtener datos
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

  // 💾 Guardar
  user.terianx = animal
  user.terianxGenero = genero

  // ✅ Confirmación
  m.reply(`✅ Therian creado correctamente

🧠 Therians » ${animal}
⚧ Tipo » ${genero.charAt(0).toUpperCase() + genero.slice(1)}

🔥 Ahora aparece en tu perfil`)
}

handler.help = ['setherians <animal> <macho/hembra>']
handler.tags = ['rpg']
handler.command = ['setherians']

export default handler
