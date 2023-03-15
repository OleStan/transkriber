import { Controller } from "@hotwired/stimulus"


export default class extends Controller {

  static targets = ["submitTranscribe"]
  connect() {
    let submitTranscribe = this.submitTranscribeTarget;

    submitTranscribe.addEventListener("click", (event) => {
      // if (this.data.get("confirm") && this.element.disabled === false) {
      //   if (!confirm(submitTranscribe.get("confirm"))) {
      //     event.preventDefault();
      //   } else {
      //     this.element.disabled = true;
      //   }
      // }
    });
  }

  confirm() {
    if (!confirm(this.submitTranscribeTarget.get("message"))) {
      event.preventDefault()
    }
  }
}
