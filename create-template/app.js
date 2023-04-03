import {apiUrl, secretKey} from '../config.js'


document.getElementById('save-template').onclick = saveTemplate

let selectedPrompts = []


function buildSelected(){
    let selectedContainer = document.getElementById('selected')
    while (selectedContainer.firstChild){
        selectedContainer.firstChild.remove()
    }
    document.getElementById('selected').appendChild(createPrompts(selectedPrompts))
}

/**
 * When we create a template we only need a title. 
 * 
 * To add prompts we can use the post request @/template-prompt
 */
async function saveTemplate(){
    let title = document.getElementById('template-title')

    let req = {title: title.value}
    await fetch(`${apiUrl}/template`, {
        method: "POST",
        headers: {
            "Vpply-Skey": secretKey
        },
        body: JSON.stringify(req)
    }).then(res => res.json())
    .then(data => {
        const prompts = selectedPrompts.map((prompt, index) => {
            return {
                prompt_id: parseInt(prompt.id),
                prompt_order: parseInt(index + 1),
                template_id: parseInt(data.id)
            }
        })

        console.log(prompts)

        prompts.forEach(async (prompt) => {
            await createTemplatePrompts(prompt)
        })
    })
}

/**
 * 
 * This function uploads 1 templats prompts at a time
 * 
 * Currently there are no endpoints to update or delete
 * template-prompts, these will be added in future updates 
 */
async function createTemplatePrompts(prompt){

    await fetch(`${apiUrl}/template-prompt`, {
        method: "POST",
        headers: {
            "Vpply-Skey": secretKey
        },
        body: JSON.stringify(prompt)
    }).then(res => res.json())
    .then(data => {
        console.log(data)
    })
}

/**
 * Get the prompts to create the template
 * 
 * Retrieves a list up to 25
 * 
 * you can use the below query params 
 * 
 * page: integer specifying page number
 * keyword: narrows seach by keyword in the title of the invitation
 * user: specify a user id as an integer 
 * 
 * e.g. ?page=1&keyword=sales&user=20
 * 
 * note: for integration users all invitations & prompts are attatched to 
 * the root user, meaning the user param has no use
 */
async function getPrompts(){

    await fetch(`${apiUrl}/prompts`, 
        {
            method: "GET",
            headers: {
                "Vpply-Skey": secretKey
            }
        }
    ).then(res => res.json())
    .then(data => {
        document.getElementById('prompts').appendChild(createPrompts(data.data))
    })
}

function createPrompts(prompts){
    let promptsContainer = document.createElement('div')
    prompts.forEach((prompt) => {
        let container = document.createElement('div')
        container.classList.add('prompt-item')
        let question = document.createElement('p')
        let responseLength = document.createElement('p')
        let hasVideo = document.createElement('p')
        let checkBox = document.createElement('input')
        checkBox.setAttribute('type', 'checkbox')
        checkBox.dataset.promptid = prompt.id
        checkBox.dataset.prompttext = prompt.text_prompt
        checkBox.onchange = selectPrompt


        question.innerText = prompt.text_prompt
        responseLength.innerText = `Max Response Length: ${prompt.max_response_length}`
        hasVideo.innerText = prompt.video_url ? "Has video question" : "No Video Question"
        container.appendChild(question)
        container.appendChild(responseLength)
        container.appendChild(hasVideo)
        container.appendChild(checkBox)

        promptsContainer.appendChild(container)
    })

    return promptsContainer

}

function selectPrompt(event){
    console.log(event)
    if(event.target.checked){
        let obj = {id: event.target.dataset.promptid, text_prompt: event.target.dataset.prompttext} 
        selectedPrompts.push(obj)
    }
    if(!event.target.checked){
        selectedPrompts = selectedPrompts.filter((el) => el .id!= event.target.dataset.promptid)
    }
    buildSelected()
}

getPrompts()
