import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="clipboard"
export default class extends Controller {
  static targets = ["toCopy"]
  connect() {

  }

  copy() {
    event.preventDefault();
    navigator.clipboard.writeText(this.toCopyTarget.value);

  }
}
