import { secretKey, apiUrl } from "../config.js"

let invitation = null
let selectedPrompts = []

const titleEl = document.getElementById('title')
const messageEl = document.getElementById('message')
const dateEl = document.getElementById('end-date')
const saveInvitationBtn = document.getElementById('save-1')
const savePromptsBtn = document.getElementById('save-2')

dateEl.onchange = (e) => {
    console.log(e.target.value)
}

saveInvitationBtn.onclick = () => {
    let d = dateEl.value
    let dateVal = d.split('-')
    console.log(dateVal)
    let date = new Date(`${dateVal[2]}-${dateVal[1] - 1}-${dateVal[0]}T00:00:00`);
    console.log(date)
    const res = 
    {
        title: titleEl.value,
        message: messageEl.value,
        end_date: date,
        hide_videos: false,
        disguise_audio: false,
        emails: []
    }

    createInvitation(res)
}

savePromptsBtn.onclick = () => {
    console.log(selectedPrompts)
    const prompts = selectedPrompts.map((prompt, index) => {
        return {
            prompt_id: parseInt(prompt.id),
            prompt_order: parseInt(index + 1),
            invitation_id: parseInt(invitation.id)
        }
    })

    console.log(prompts)

    setInvitationPrompts({prompts: prompts})
}

/**
 * Create an Invitation
 */
async function createInvitation(data){
    await fetch(`${apiUrl}/invitation`, {
        method: "POST",
        headers: {
            "Vpply-Skey": secretKey
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
    .then((data) => {
        document.getElementById('step-1').style.display = 'none'
        document.getElementById('step-2').style.display = 'block'
        invitation = data
    })
}

/**
 * 
 * This function will dispose of all the current prompts and replace it with
 * the list specified in the request body
 */
async function setInvitationPrompts(prompts){
    await  fetch(`${apiUrl}/invitation/${invitation.id}/update-promtps`, {
        method: "PATCH",
        headers: {
            "Vpply-Skey": secretKey
        },
        body: JSON.stringify(prompts)
    }).then(res => res.json())
    .then((data) => {
        document.getElementById('step-2').style.display = 'none'
        document.getElementById('step-3').style.display = 'block'
        setInvitationDetails()
        location.href(`/invitation/?id=${invitation.id}`)
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
        createPrompts(data)
    })
}
/**
 * Gets a list of tempaltes
 * 
 * In a future update pagination for templates and search queries 
 * will be added
 */
async function getTemplates(){
    await fetch(`${apiUrl}/templates`, 
        {
            method: "GET",
            headers: {
                "Vpply-Skey": secretKey
            }
        }
    ).then(res => res.json())
    .then(data => {
        console.log(data)
        createTemplates(data)
    })
}

/**
 * 
 * When we select a template we need to get the prompts 
 * and add them to selectedprompts
 * 
 * once the template is inserted, the prompts behave like if they
 * were added from the Prompts list.
 */
async function selectTemplate(event){
    await fetch(`${apiUrl}/template/${event.target.dataset.templateid}`, {
        method: "GET",
        headers: {
            "Vpply-Skey": secretKey
        }
    }).then(res => res.json())
    .then(data => {
        console.log(data.prompts)
        if(data.prompts){
            data.prompts.forEach((prompt) => {
                selectedPrompts.push({id: prompt.id, text_prompt: prompt.text_prompt})
            })
        }
    })
}


/**
 * 
 * Select the promtps for use in this invitation
 *   
 */
function selectPrompt(event){
    if(event.target.checked){
        selectedPrompts.push({id: event.target.dataset.promptid, text_prompt: event.target.dataset.prompttext})
    }
    if(!event.target.checked){
        selectedPrompts = selectedPrompts.filter((el) => el .id!= event.target.dataset.promptid)
    }
}


/**
 * Utility function to create HTML elements for prompts and templates
 */
function createPrompts(prompts){
    let promptsContainer = document.createElement('div')
    prompts.data.forEach((prompt) => {
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

    document.getElementById('prompts').appendChild(promptsContainer)

}

function createTemplates(templates){
    console.log(templates)
    let templatesContainer = document.createElement('div')
    templates.forEach((template) => {
        let container = document.createElement('div')
        container.classList.add('prompt-item')
        let title = document.createElement('p')
        let questions = document.createElement('p')
        
        let checkBox = document.createElement('input')
        checkBox.setAttribute('type', 'checkbox')
        checkBox.dataset.templateid = template.id
        checkBox.onchange = selectTemplate


        title.innerText = template.title
        questions.innerText = `Total Questions: ${template.prompts}`
        container.appendChild(title)
        container.appendChild(questions)
        container.appendChild(checkBox)

        templatesContainer.appendChild(container)
    })

    document.getElementById('templates').appendChild(templatesContainer)
}






getPrompts()
getTemplates()

