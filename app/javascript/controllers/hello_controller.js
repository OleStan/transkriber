import { Controller } from "@hotwired/stimulus";

export  class extends Controller {
  connect() {
    this.element.textContent = "Hello World!";
  }
}
