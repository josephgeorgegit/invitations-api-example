import { apiUrl, primaryKey, secretKey} from '../config.js'



/**
 * To us the recoreder embed, you need to specify your domains root addres
 * to allow the recorder to emit event listeners to your page.
 */
window.addEventListener('message', function(event){
    if(event.origin !== 'http://dev.vpply.com:3000'){return}
    console.log(event.data) //these are the new prompts
})
let frame = document.createElement('iframe')
frame.height = 800
frame.width = 800
frame.frameBorder = 0
frame.src = `http://dev.vpply.com:3000/embed/create-question?api_key=${primaryKey}`
document.body.appendChild(frame)

function promptsCreated(event){
    console.log(event)
    alert('hi')
}