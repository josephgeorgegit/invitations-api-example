import { apiUrl, secretKey} from "../config.js";
import { buildResponses, createInvitation, makeShareContainer } from './element.js'

let query = new URLSearchParams(window.location.search)
let invitationId = query.get("id")
let invitation = null
let email_list = []

async function getInvitation(id){
    await fetch(`${apiUrl}/invitation/${id}`, {
        method: "GET",
        headers: {
            "Vpply-Skey": secretKey
        }
    }).then(res => res.json())
    .then((data) => {
        let invitation = data.invitation
        let prompts = data.prompts

        createInvitation(invitation, prompts)
        getReceivables()

        if(invitation.status == "Draft"){
            document.getElementById('publish').onclick = publishInvitation
        }
    })
}

/**
 * Here we need to get the current list of receivables and create the email_list array
 * 
 * The API will dispose of the old list and generate a new one 
 * each time the invitation/:id/update-emails endpoint is called.
 */
async function getReceivables(){
    await fetch(`${apiUrl}/invitation/${invitationId}/receivables`, {
        method: "GET",
        headers: {
            "Vpply-Skey": secretKey
        }
    }).then(res => res.json())
    .then(data => {
        buildResponses(data)
        /**
         * If we do not do this, each update will delete the old receivables
         */
        data.forEach((receivable) => {
            email_list.push(`${receivable.receivable.email},${receivable.receivable.first_name},${receivable.receivable.last_name}`)
        })
    })
}


/**
 * 
 * This function creates the individual share link buttons.
 * 
 * Each button containes data pertaining to its related response.
 * 
 * on click the getShareLink function is triggered 
 */
export async function createShare(receivable){
    await fetch(`${apiUrl}/bundle/${receivable.receivable.bundle_id}`, {
        method: "GET",
        headers: {
            "Vpply-Skey": secretKey
        }
    }).then(res => res.json())
    .then(data => {
        makeShareContainer(data, receivable)
    })
}

/**
 * Creates a share link per individual response.
 * Each link has a code which expires in 1 week.
 * 
 * Options to limit amount of views will come in a future update.
 */
export async function getShareLink(event){
    let receivableid = event.target.dataset.receivableid
    let responseid = event.target.dataset.responseid

    let body = {
        receivable_id: parseInt(receivableid),
        response_id: parseInt(responseid),
        is_response: true
    }

    await fetch(`${apiUrl}/create-share-link`, {
        method: "POST",
        headers: {
            "Vpply-Skey": secretKey
        },
        body: JSON.stringify(body)
    }).then(res => res.json())
    .then(data => {
        console.log(data)
    })
}


/**
 * This will publish an invitation.
 * 
 * If you do not want to send the email Vpply generates, make sure to use the
 * 'noemail' query paramater set to true
 * 
 * this will return an array of receivables container the persons details
 * as well as a link to their invitation
 */
async function publishInvitation(){
    await fetch(`${apiUrl}/invitation/${invitationId}/publish?noemail=true`, {
        method: "PATCH",
        headers: {
            "Vpply-Skey": secretKey
        }
    }).then(res => res.json())
    .then(data => {
        console.log(data)
    })
}


getInvitation(invitationId) 

document.getElementById('add-receivable').onclick = () => {
    let fnameInput = document.getElementById('r-fname')
    let lnameInput = document.getElementById('r-lname')
    let emailInput = document.getElementById('r-email')

    const string = `${emailInput.value},${fnameInput.value},${lnameInput.value}`

    email_list.push(string)

    createReceivable(email_list)
    fnameInput.value = ''
    lnameInput.value = ''
    emailInput.value = ''
}

/**
 * 
 * When we create receivables, the api will dispose of the old list and create an brand new one
 * 
 * Make sure before you call this endpoint you insert any current emails into the email_list.
 * 
 * this is done for you above, if you change this code make sure you are aware of this behaviour. 
 */

async function createReceivable(emailList){
    await fetch(`${apiUrl}/invitation/${invitationId}/update-emails`, {
        method: "PATCH",
        headers: {
            "Vpply-Skey": secretKey
        },
        body: JSON.stringify({email_list: emailList})
    }).then(res => res.json())
    .then(data => {
        console.log(data)
    })
}