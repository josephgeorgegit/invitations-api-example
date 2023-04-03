import { apiUrl, primaryKey, secretKey} from '../config.js'



/**
 * To us the recoreder embed, you need to specify your domains root addres
 * to allow the recorder to emit event listeners to your page.
 */
window.addEventListener('message', function(event){
    if(event.origin !== 'https://interview.staging.vpply.com'){return}
    console.log(event.data) //these are the new prompts
})
let frame = document.createElement('iframe')
frame.height = 800
frame.width = 800
frame.frameBorder = 0
frame.src = `https://interview.staging.vpply.com/embed/create-question?api_key=${primaryKey}`
document.body.appendChild(frame)

function promptsCreated(event){
    console.log(event)
    alert('hi')
}