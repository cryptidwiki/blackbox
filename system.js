const terminal = document.getElementById("terminal");
const commandInput = document.getElementById("command-input");
const prompt = document.getElementById("prompt");
const bootScreen = document.getElementById("boot-screen");

let systemBooted = false;

const commands = {
    help: `
AVAILABLE COMMANDS

DIR        List directory contents
OPEN       Open a file
WHOAMI     Display current user
STATUS     Display system status
CLEAR      Clear terminal
`,

    dir: `
VOLUME BBX_RECOVERY

DIRECTORY OF C:\\RECOVERY

10/31/1996  02:41 AM       1,284  diary.txt
10/31/1996  03:02 AM       4,891  system.log
10/30/1996  11:17 PM       <DIR>  archive
10/29/1996  08:44 PM       <DIR>  photos

4 ITEM(S)
`,

    whoami: `
USER: UNKNOWN
AUTHORIZATION: NONE
SESSION ORIGIN: UNRESOLVED
`,

    status: `
NODE: BBX-07
CONNECTION: ACTIVE
SYSTEM INTEGRITY: 63%
RECOVERY MODE: ENABLED
`
};

function printLine(text) {
    const output = document.createElement("div");
    output.className = "output";
    output.textContent = text;

    terminal.insertBefore(
        output,
        document.getElementById("input-line")
    );
}

function loadRecoveryTerminal() {
    bootScreen.remove();

    printLine(`
BLACKBOX SYSTEMS
REMOTE RECOVERY INTERFACE

NODE: BBX-07
STATUS: DEGRADED
LAST CONNECTION: 10/31/1996 03:17:42

Type HELP for available commands.
`);

    prompt.textContent = "C:\\RECOVERY>";
    systemBooted = true;
}

function runBootCommand(command) {
    const answer = command.trim().toLowerCase();

    printLine("> " + command);

    if (answer === "y" || answer === "yes") {
        printLine(`
LOADING RECOVERY ENVIRONMENT...

ACCESS GRANTED.
`);

        setTimeout(loadRecoveryTerminal, 800);
        return;
    }

    if (answer === "n" || answer === "no") {
        printLine(`
SESSION TERMINATED.

ERROR: DISCONNECT FAILED.

REMOTE SESSION REMAINS ACTIVE.
`);
        return;
    }

    printLine("INVALID RESPONSE. ENTER Y OR N.");
}

function runCommand(command) {
    const originalCommand = command;
    command = command.trim().toLowerCase();

    printLine("C:\\RECOVERY> " + originalCommand);

    if (command === "") {
        return;
    }

    if (command === "clear") {
        const outputs = terminal.querySelectorAll(".output");
        outputs.forEach(output => output.remove());
        return;
    }

    if (commands[command]) {
        printLine(commands[command]);
        return;
    }

    if (command === "open diary.txt") {
        printLine(`
RECOVERING FILE...

diary.txt

October 31, 1996

Something is wrong with the system.

Files keep appearing that I didn't create.

I disconnected BBX-07 from the network at 2:13 AM.

It shouldn't still be online.
`);
        return;
    }

    if (command === "open system.log") {
        printLine(`
BBX SYSTEM LOG

02:13:04  NETWORK ADAPTER DISABLED
02:13:09  REMOTE CONNECTION TERMINATED
02:14:32  INCOMING CONNECTION DETECTED
02:14:32  SOURCE: UNKNOWN
02:14:33  ACCESS GRANTED

WARNING: EVENT SEQUENCE INVALID
`);
        return;
    }

    printLine(
        "'" + originalCommand +
        "' is not recognized as an internal or external command."
    );
}

commandInput.addEventListener("keydown", function(event) {
    if (event.key !== "Enter") {
        return;
    }

    const value = commandInput.value;
    commandInput.value = "";

    if (!systemBooted) {
        runBootCommand(value);
    } else {
        runCommand(value);
    }

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
});

document.addEventListener("click", function() {
    commandInput.focus();
});

commandInput.focus();
