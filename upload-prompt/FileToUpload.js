import { apiUrl, secretKey, primaryKey } from "../config.js";
export class FileToUpload {
    constructor(file, file_name, duration, transcript, index, prompt){
      this.index = index
      this.request = new XMLHttpRequest();
      this.chunkSize = 3 * 1024 * 1024;
      this.chunkStart = 0;
      this.transcript = transcript
      this.file = file
      this.uploadUrl = `${apiUrl}/video-prompt`
      this.chunkEnd = this.chunkSize > this.file.size ? this.file.size : this.chunkSize;
      this.file_name = file_name
      this.duration = duration
      this.upload_complete = false
      this.request.overrideMimeType("application/octet-stream");
      this.prompt = prompt
    }
    
     uploadFile(){
        const config = {
          headers: {
            "content-type": "multipart/form-data",
          },
        };
        
        let chunk = this.file.slice(this.chunkStart, this.chunkEnd);
        
        this.request.open("POST", this.uploadUrl, true);

        this.request.setRequestHeader(
          "Content-Range",
          `bytes ${this.chunkStart}-${this.chunkEnd}/${this.file.size}`);
        
        this.request.onload = () => {
          const remainingBytes = this.file.size - this.chunkEnd;
    
          if (this.chunkEnd === this.file.size) {
            this.uploadComplete(JSON.parse(this.request.response));
            return;
          } else if (remainingBytes < this.chunkSize) {
            this.chunkStart = this.chunkEnd;
            this.chunkEnd = this.chunkStart + remainingBytes;
          } else {
            this.chunkStart = this.chunkEnd;
            this.chunkEnd = this.chunkStart + this.chunkSize;
          }
          this.uploadFile();
        };
        
        
        this.request.onerror = this.handleError

        this.request.onabort = this.handleError

        const formData = new FormData();
        formData.append("file", chunk, this.file_name);
        formData.append("filesize", this.file.size.toString());
        formData.append("duration", Math.floor(this.duration).toString());
        formData.append("transcript", this.transcript);
        formData.append("max_response_length", this.prompt.max_response_length);
        formData.append("text_prompt", this.prompt.text_prompt);
        formData.append("prompt_type", this.prompt.prompt_type);

        this.request.setRequestHeader("Vpply-Skey", secretKey)
        this.request.setRequestHeader("Vp-Primary-Key", primaryKey)
        this.request.send(formData, config);
        let evt = new CustomEvent(`remainingchunks-${this.index}`, { detail: {
          width: (this.chunkEnd / this.file.size),
          index: this.index 
        }
      });

      window.dispatchEvent(evt);
      }

      uploadComplete(res) {
        this.upload_complete = true
        let evt = new CustomEvent(`finisheduploadingvideo-${this.index}`, { detail: {
            res: res,
            index: this.index 
          }
        });
        window.dispatchEvent(evt);
      }

      handleError = () => {
        let ev = new CustomEvent(`uploaderror-${this.index}`, {detail: {index: this.index, message: `Error Uploading Video ${this.index}`}})
          window.dispatchEvent(ev)
      }
}