import { createShare, getShareLink } from "./app.js"

export function createInvitation(invitation, prompts){
    let container = document.createElement('div')
    container.classList.add('invitation')
    let title = document.createElement('h1')
    let message = document.createElement('p')
    let published = document.createElement('p')
    let end_date = document.createElement('a')
    
    title.innerText = invitation.title
    message.innerText = invitation.message
    end_date.innerText = `end date: ${invitation.end_date}`
    published.innerText = invitation.status == 'Published' ? "Published" : "Draft"
    container.appendChild(title)
    container.appendChild(message)
    container.appendChild(published)
    if(invitation.status == "Draft"){
        let publishBtn = document.createElement('button')
        publishBtn.innerText = "Publish"
        publishBtn.id = "publish"
        container.appendChild(publishBtn)
    }
    container.appendChild(end_date)
    
    if(prompts && prompts.length){
        let promptContainer = document.createElement('div')
        promptContainer.id = 'prompts'
        let promptsContainer = createPrompts(prompts)
        container.appendChild(promptsContainer)
    }else{
        let noPrompts = document.createElement('p')
        noPrompts.innerText = 'No Prompts in this Invitation'
        container.appendChild(noPrompts)
    }

    document.getElementById("invitation").appendChild(container)
    
    const iframeContainer = document.createElement('div')
    iframeContainer.id = "iframe-container"
    document.body.appendChild(iframeContainer)

    // if(invitation.status == 'Published'){
        //get receivables
        

}

export function buildResponses(receivables){

    let awaiting = []
    let responses = []

    if(receivables){
            awaiting = receivables.filter(e => e.receivable.bundle_id == null)
            responses = receivables.filter(e => e.receivable.bundle_id != null)
    }
    let responseContainer = document.createElement('div')
    
    responses.forEach((receivable) => {
        let response = document.createElement('div')
        let name = document.createElement('p')
        let email = document.createElement('p')
        let completedAt = document.createElement('p')


        response.classList.add('response-item')
        response.onclick = () => {
            let frameContainer = document.getElementById('iframe-container')
            if(frameContainer.firstChild){
                frameContainer.firstChild.remove()
            }
            let frame = document.createElement('iframe')
            frame.id = "iframe-container"
            frame.height = 800
            frame.width = 800
            frame.frameBorder = 0
            frame.src = `http://interview.staging.vpply.com/embed/${receivable.receivable.id}`
            frameContainer.appendChild(frame)

            createShare(receivable)

        }

        name.innerText = `${receivable.receivable.first_name} ${receivable.receivable.last_name}`
        email.innerText = receivable.receivable.email
        completedAt.innerText = receivable.receivable.created_at
        
        response.appendChild(name)
        response.appendChild(email)
        response.appendChild(completedAt)
        
        responseContainer.appendChild(response)
    })
    
    let awaitingContainer = document.createElement('div')
    awaiting.forEach((receivable) => {
        let response = document.createElement('div')
        let name = document.createElement('p')
        let email = document.createElement('p')

        name.innerText = `${receivable.receivable.first_name} ${receivable.receivable.last_name}`
        email.innerText = receivable.receivable.email

        response.appendChild(name)
        response.appendChild(email)

        awaitingContainer.appendChild(response)
    })

    let responsesHeader = document.createElement('h1')
    responsesHeader.innerText = "Responses"
    document.body.appendChild(responsesHeader)
    document.body.appendChild(responseContainer)
    let awaitingHeader = document.createElement('h1')
    awaitingHeader.innerText = "Awaiting"
    document.body.appendChild(awaitingHeader)
    document.body.appendChild(awaitingContainer)

}

function createPrompts(prompts){
    let promptsContainer = document.createElement('div')
    prompts.forEach((prompt) => {
        let container = document.createElement('div')
        container.classList.add('prompt-item')
        let question = document.createElement('p')
        let responseLength = document.createElement('p')
        let hasVideo = document.createElement('p')


        question.innerText = prompt.text_prompt
        responseLength.innerText = `Max Response Length: ${prompt.max_response_length}`
        hasVideo.innerText = prompt.video_url ? "Has video question" : "No Video Question"
        container.appendChild(question)
        container.appendChild(responseLength)
        container.appendChild(hasVideo)

        promptsContainer.appendChild(container)
    })

    return promptsContainer
}

export function makeShareContainer(data, receivable){
    let shareContainer = document.createElement('div')
        data.responses.forEach((response, index) => {
            let container = document.createElement('div')
            let question = document.createElement('p')
            let button = document.createElement('button')

            question.innerText = response.text_prompt
            button.innerText = "Get Share Link"
            button.id = `share-response-${index}`
            button.dataset.responseid = response.id
            button.dataset.receivableid = receivable.receivable.id
            button.onclick = getShareLink

            container.appendChild(question)
            container.appendChild(button)

            shareContainer.appendChild(container)
        })

        document.getElementById('iframe-container').appendChild(shareContainer)
}