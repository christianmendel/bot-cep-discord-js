import Discord, { Channel } from 'discord.js'
import axios from 'axios'

const client = new Discord.Client()

client.on('ready', () => {
    console.log(`Bot foi iniciado, com sucesso!`)
    client.user.setActivity(`/cep`)
})

const { MessageEmbed } = require('discord.js')

// inside a command, event listener, etc.

let usuarios = []

let usuariosBloqueados = []

const getFromApi = async url => {
    const response = await axios({
        url: `https://ws.apicep.com/cep/${url}.json`,

        //url: `https://ws.apicep.com/cep/${url}.json`
    })
    return `O cep buscado corresponde a cidade: ${response.data.city}-${response.data.state}`

    //response.data.city + response.data.state
}

client.on('message', async message => {
    //verificar se não é um bot mandando msg
    if (message.author.bot) return

    const comando = message.content

    let user = { id: message.author.id, time: Date.now(), msg: message.content }

    if (usuariosBloqueados.some(usuario => usuario.id === user.id)) return

    function addUser(usuario) {
        return usuarios.push(usuario)
    }

    if (message.author.id) {
        addUser(user)
    }

    const mensagensUsuario = usuarios.filter(user => user.id === message.author.id).reverse()
    if (mensagensUsuario.length >= 4) {
        if (Date.now() - mensagensUsuario[3].time <= 5000) {
            usuariosBloqueados.push(user)
            message.channel.send('Bot bloqueado!')
            setTimeout(() => {
                message.channel.send('Bot desbloqueado!')
                usuariosBloqueados = usuariosBloqueados.filter(({ id }) => id !== user.id)
                usuarios = usuarios.filter(({ id }) => id !== user.id)
            }, 10000)
            return
        }
    }

    const args = message.content.split(' ')
    const argsNumber = args[1]

    if (argsNumber == undefined) {
        if (args[0] === '/cep') {
            const help = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Para buscar um CEP use "/cep numeros do cep"')
                .setURL('https://discord.js.org/')
                .setAuthor(`${message.author.username}`)
                .setDescription('Exemplo: /cep 99999999')
                .setThumbnail('https://i.pinimg.com/originals/91/af/33/91af33a460f56a9f3cb6d93e182b3a79.gif')
            message.reply(help)
        }
    }

    if (args[0] === '/cep') {

        if (argsNumber == undefined) return

        const cep = argsNumber.length === 8
        if (cep) {
            const msg = await getFromApi(argsNumber)

            const buscarCEP = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(msg)
                .setURL('https://discord.js.org/')
                .setAuthor(`${message.author.username} localizei seu CEP`)
                .setThumbnail('https://static.wixstatic.com/media/0ed6a7_b03528275fd2411eb404e0f8b2d08ca1~mv2.gif')

            message.reply(buscarCEP)
        }
    }
})

client.login('')
