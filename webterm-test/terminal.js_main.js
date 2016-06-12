window.addEventListener("load", () => {
    let container = window.document.getElementById("terminal");
    let term = new Terminal({ columns: 80, rows: 20 });
    let input = term.dom(container);
    input.on("data", event => console.log(event));
    input.pipe(term);
});
