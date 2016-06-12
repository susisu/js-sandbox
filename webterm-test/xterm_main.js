window.addEventListener("load", () => {
    let container = window.document.getElementById("terminal");
    let term = new Terminal();
    term.open(container);

    const SHELL_PROMPT = "> \u001b[1;32mtest\u001b[1;39m "
    function prompt() {
        term.write(SHELL_PROMPT);
    }
    prompt();

    term.on("key", (key, event) => {
        let printable = !event.altKey && !event.altGraphKey && !event.ctrlKey && !event.metaKey;
        if (event.keyCode === 13) {
            term.write("\r\n");
            prompt();
        }
        else if (event.keyCode === 8) {
            if (term.x > SHELL_PROMPT.length) {
                term.write("\b \b");
            }
        }
        else if (printable) {
            term.write(key);
        }
    });

    term.on("paste", (data, event) => {
        console.log(data);
        term.write(data);
    });
});
