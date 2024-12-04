class ProjetctInput {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;

  constructor() {
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

new ProjetctInput();