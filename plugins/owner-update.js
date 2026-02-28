import { execSync } from 'child_process'

var handler = async (m, { conn, text, isROwner }) => {
    if (!isROwner) return
    await m.react('🕒')

    try {
        // Verifica si estamos en un repositorio Git
        execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' })

        // Ejecuta git pull
        const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''), { encoding: 'utf-8' })
        let messager = stdout.toString()

        if (messager.includes('Already up to date')) messager = '❀ Los datos ya están actualizados a la última versión.'
        else if (messager.toLowerCase().includes('updating')) messager = '❀ Procesando, espere un momento mientras me actualizo.\n\n' + stdout.toString()

        await m.react('✔️')
        conn.reply(m.chat, `*ര ׄ 🌿 ׅ  Actualización completada con éxito.*\n\n\`\`\`${messager}\`\`\``, m)
        
    } catch (error) {
        // Si no es un repositorio Git
        if (error.message && error.message.includes('not a git repository')) {
            await conn.reply(m.chat, '⚠︎ No se pudo actualizar: este directorio no es un repositorio Git.', m)
            await m.react('✖️')
            return
        }

        // Si hay conflictos locales
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf-8' })
            if (status.length > 0) {
                const conflictedFiles = status.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes('database.json') || line.includes('sessions/Principal/') || line.includes('npm-debug.log')) return null
                        return '*→ ' + line.slice(3) + '*'
                    })
                    .filter(Boolean)
                if (conflictedFiles.length > 0) {
                    const errorMessage = `\`⚠︎ No se pudo realizar la actualización:\`\n\n> *Se han encontrado cambios locales en los archivos del bot que entran en conflicto con las nuevas actualizaciones del repositorio.*\n\n${conflictedFiles.join('\n')}.`
                    await conn.reply(m.chat, errorMessage, m)
                    await m.react('✖️')
                    return
                }
            }
        } catch (e) {
            console.error(e)
        }

        // Otros errores inesperados
        console.error(error)
        let errorMessage2 = '⚠︎ Ocurrió un error inesperado.'
        if (error.message) {
            errorMessage2 += '\n⚠︎ Mensaje de error: ' + error.message
        }
        await conn.reply(m.chat, errorMessage2, m)
    }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'fix', 'actualizar']

export default handler
