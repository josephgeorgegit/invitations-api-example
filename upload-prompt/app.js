import { apiUrl, secretKey, primaryKey } from "../config.js";
import { FileToUpload } from "./FileToUpload.js";

/**
 * 
 * In this app we will upload a file with a prompt at the same time.
 * 
 * FileToUpload uploads the file in parts as required by the API
 * 
 * See FileToUpload.js for more details on its usage.
 */

document.getElementById('file-input').onchange = (event) => {
    const prompt = {
        text_prompt: "My Test API Prompt",
        max_response_length: 60,
        prompt_type: "video"
    }
    let video = event.target.files[0]
    console.log(video)
    let regex = new RegExp("[^.]+$");
    let prefix = Date.now().toString()
    let filename = prefix + "." + video.name.match(regex);

    /* **INCOMPLETE** 
     *  Make sure to get the video duration
     */ 
    let payload = new FileToUpload(video, filename, 10, '', 0, prompt)
    
    payload.uploadFile()
}