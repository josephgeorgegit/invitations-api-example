import { secretKey, apiUrl } from "../config.js";

let invitations = []


/**
 * List Invitations
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
async function getInvitations(){
    await fetch(`${apiUrl}/invitations?page=1`,{
        method: "GET",
        headers: {
            "Vpply-Skey": secretKey
        }
    }).then(res => res.json())
    .then(data => {
        invitations = data
        console.log(invitations)
        injectInvitations()
    })
}

function injectInvitations(){
    let invitationsContainer = document.createElement('div')
    invitations.data.forEach((invitation) => {
        let container = document.createElement('div')
        container.classList.add('invitation-item')
        let title = document.createElement('p')
        let published = document.createElement('p')
        let link = document.createElement('a')

        link.href = `/invitation/?id=${invitation.id}`

        title.innerText = invitation.title
        published.innerText = invitation.status == 'Published' ? "Published" : "Draft"
        link.innerText = "View"
        container.appendChild(title)
        container.appendChild(published)
        container.appendChild(link)

        invitationsContainer.appendChild(container)
    })

    document.getElementById('invitations').appendChild(invitationsContainer)

}

getInvitations()