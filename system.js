const terminal = document.getElementById("terminal");
const commandInput = document.getElementById("command-input");
const prompt = document.getElementById("prompt");
const bootScreen = document.getElementById("boot-screen");

let systemBooted = false;

let currentPath = "C:\\RECOVERY";

let archiveUnlocked = false;
let hiddenFileVisible = false;
let entityAwake = false;
let endingStarted = false;

let filesOpened = 0;

const filesystem = {
    "C:\\RECOVERY": {
        type: "folder",
        children: [
            "diary.txt",
            "system.log",
            "archive",
            "photos"
        ]
    },

    "C:\\RECOVERY\\archive": {
        type: "folder",
        locked: true,
        children: [
            "incident.txt",
            "staff.txt",
            "shutdown.log"
        ]
    },

    "C:\\RECOVERY\\photos": {
        type: "folder",
        children: [
            "hallway.img",
            "serverroom.img",
            "frame_0317.img"
        ]
    }
};

const fileContents = {
    "diary.txt": `
diary.txt
RECOVERED TEXT FILE

October 30, 1996

BBX-07 has been unstable all week.

I thought it was the network controller, but tonight
files started appearing in directories nobody has access to.

Mark says I'm imagining it.

I'm not.

At 11:42 PM the terminal printed my employee ID before
I even logged in.

I'm disconnecting the node tomorrow.

- Daniel
`,

    "system.log": `
BBX SYSTEM LOG
NODE BBX-07

02:11:18  SYSTEM CHECK................PASS
02:12:51  UNAUTHORIZED PROCESS.......DETECTED
02:13:04  NETWORK ADAPTER............DISABLED
02:13:09  REMOTE CONNECTION..........TERMINATED

02:14:32  INCOMING CONNECTION........DETECTED
02:14:32  SOURCE......................UNKNOWN
02:14:33  ACCESS......................GRANTED

02:16:07  USER DANIEL.M...............LOGGED IN
02:16:08  USER DANIEL.M...............AUTH FAILED

WARNING:
EVENT SEQUENCE INVALID
`,

    "incident.txt": `
BLACKBOX SYSTEMS
INTERNAL INCIDENT REPORT
10/31/1996

SYSTEM: BBX-07

At approximately 01:48 AM, BBX-07 began producing
network traffic while physically isolated from the
facility network.

At 02:13 AM the Ethernet connection was removed.

Traffic continued.

At 02:21 AM the system displayed information not
contained within any connected storage device.

The information included:

- staff home addresses
- employee access codes
- internal phone extensions
- information concerning events that had not yet occurred

Facility shutdown authorized.

ARCHIVE AUTHORIZATION CODE:

0317
`,

    "staff.txt": `
BLACKBOX SYSTEMS
STAFF ASSIGNMENTS

DANIEL MERCER
Systems Technician
Employee ID: BBS-1044

MARK HOLLOWAY
Network Engineer
Employee ID: BBS-1018

ELAINE VOSS
Project Director
Employee ID: BBS-1001

NOTE:

Daniel Mercer failed to report for work
following the BBX-07 incident.

No resignation was received.
`,

    "shutdown.log": `
FACILITY SHUTDOWN LOG

02:28:10  EMERGENCY SHUTDOWN INITIATED
02:28:22  MAIN NETWORK OFFLINE
02:29:44  NODE BBX-07 POWER DISCONNECTED

02:29:45  NODE BBX-07 POWER STATUS: OFFLINE

02:31:02  NODE BBX-07 PROCESS ACTIVITY DETECTED

02:34:17  MESSAGE RECEIVED:

"YOU REMOVED THE WRONG CONNECTION."

02:34:18  LOG TERMINATED
`,

    "hallway.img": `
FILE: hallway.img

IMAGE RECOVERY FAILED.

PARTIAL FRAME DATA:

[02:55:11]

Empty hallway.
Emergency lighting active.

No personnel detected.
`,

    "serverroom.img": `
FILE: serverroom.img

IMAGE RECOVERY FAILED.

PARTIAL FRAME DATA:

[03:04:28]

Server room.
Rack 07 visible.

Power indicators OFF.

Camera artifact detected near rear wall.

ERROR:
UNABLE TO CLASSIFY OBJECT.
`,

    "frame_0317.img": `
FILE: frame_0317.img

RECOVERED FRAME
TIMESTAMP: 03:17:42

Camera facing terminal station BBX-07.

Chair empty.

Terminal active.

Screen text recovered:

"WAITING FOR CONNECTION"
`
};

function printLine(text, className = "output") {
    const output = document.createElement("div");

    output.className = className;
    output.textContent = text;

    terminal.insertBefore(
        output,
        document.getElementById("input-line")
    );

    scrollBottom();
}

function scrollBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
}

function updatePrompt() {
    prompt.textContent = currentPath + ">";
}

function loadRecoveryTerminal() {
    if (bootScreen) {
        bootScreen.remove();
    }

    printLine(`
BLACKBOX SYSTEMS
REMOTE RECOVERY INTERFACE

NODE: BBX-07
STATUS: DEGRADED
LAST CONNECTION: 10/31/1996 03:17:42

Type HELP for available commands.
`);

    currentPath = "C:\\RECOVERY";
    updatePrompt();

    systemBooted = true;
}

function runBootCommand(command) {
    const answer = command.trim().toLowerCase();

    printLine("> " + command);

    if (answer === "y" || answer === "yes") {
        commandInput.disabled = true;

        printLine(`
LOADING RECOVERY ENVIRONMENT...

ACCESS GRANTED.
`);

        setTimeout(() => {
            loadRecoveryTerminal();
            commandInput.disabled = false;
            commandInput.focus();
        }, 1000);

        return;
    }

    if (answer === "n" || answer === "no") {
        printLine(`
SESSION TERMINATED.

ERROR: DISCONNECT FAILED.

REMOTE SESSION REMAINS ACTIVE.
`, "output danger");

        return;
    }

    printLine("INVALID RESPONSE. ENTER Y OR N.");
}

function showHelp() {
    printLine(`
AVAILABLE COMMANDS

HELP          Display available commands
DIR           List directory contents
CD            Change directory
OPEN          Open file
WHOAMI        Display current user
STATUS        Display system status
DATE          Display system date
CLS           Clear terminal
CLEAR         Clear terminal

Examples:

OPEN diary.txt
CD archive
CD ..
`);
}

function showDirectory() {
    const folder = filesystem[currentPath];

    if (!folder) {
        printLine("DIRECTORY ERROR.");
        return;
    }

    let list = [...folder.children];

    if (
        currentPath === "C:\\RECOVERY" &&
        hiddenFileVisible &&
        !list.includes("connection.txt")
    ) {
        list.push("connection.txt");
    }

    let text = `
VOLUME BBX_RECOVERY

DIRECTORY OF ${currentPath}

`;

    list.forEach(item => {
        if (item.includes(".")) {
            text += "       " + item + "\n";
        } else {
            text += "<DIR>  " + item + "\n";
        }
    });

    printLine(text);
}

function changeDirectory(target) {
    target = target.trim().toLowerCase();

    if (target === "..") {
        if (currentPath === "C:\\RECOVERY") {
            return;
        }

        currentPath = "C:\\RECOVERY";
        updatePrompt();
        return;
    }

    if (currentPath === "C:\\RECOVERY") {
        if (target === "archive") {
            if (!archiveUnlocked) {
                printLine(`
ACCESS DENIED.

ARCHIVE ENCRYPTED.

ENTER:
UNLOCK <CODE>
`, "output warning");

                return;
            }

            currentPath = "C:\\RECOVERY\\archive";
            updatePrompt();
            return;
        }

        if (target === "photos") {
            currentPath = "C:\\RECOVERY\\photos";
            updatePrompt();
            return;
        }
    }

    printLine("THE SYSTEM CANNOT FIND THE PATH SPECIFIED.");
}

function openFile(filename) {
    filename = filename.toLowerCase();

    if (filename === "connection.txt" && hiddenFileVisible) {
        printLine(`
connection.txt

THIS FILE WAS CREATED:

NOW


HELLO.
`, "output danger");

        entityAwake = true;

        setTimeout(() => {
            printLine(`
YOU FOUND ME.
`, "output danger");
        }, 2500);

        return;
    }

    const currentFolder = filesystem[currentPath];

    if (!currentFolder) {
        printLine("FILE SYSTEM ERROR.");
        return;
    }

    if (!currentFolder.children.includes(filename)) {
        printLine("FILE NOT FOUND.");
        return;
    }

    if (filename === "photos" || filename === "archive") {
        printLine(`
${filename.toUpperCase()} IS A DIRECTORY.

USE:
CD ${filename}
`);
        return;
    }

    if (!fileContents[filename]) {
        printLine("UNABLE TO OPEN FILE.");
        return;
    }

    printLine(fileContents[filename]);

    filesOpened++;

    progressionCheck(filename);
}

function progressionCheck(filename) {
    if (
        filename === "frame_0317.img" &&
        !hiddenFileVisible
    ) {
        setTimeout(() => {
            printLine(`
SYSTEM EVENT DETECTED.

DIRECTORY CONTENTS CHANGED.
`, "output warning");

            hiddenFileVisible = true;
        }, 2000);
    }

    if (filesOpened >= 5 && !hiddenFileVisible) {
        hiddenFileVisible = true;

        setTimeout(() => {
            printLine(`
WARNING:

UNAUTHORIZED FILE CREATED.
`, "output warning");
        }, 1500);
    }
}

function unlockArchive(code) {
    if (archiveUnlocked) {
        printLine("ARCHIVE ALREADY UNLOCKED.");
        return;
    }

    if (code === "0317") {
        archiveUnlocked = true;

        printLine(`
AUTHORIZATION ACCEPTED.

ARCHIVE DECRYPTED.

USE:
CD archive
`);

        return;
    }

    printLine(`
AUTHORIZATION FAILED.
`, "output danger");
}

function showWhoami() {
    if (!entityAwake) {
        printLine(`
USER: UNKNOWN
AUTHORIZATION: NONE
SESSION ORIGIN: UNRESOLVED
`);

        return;
    }

    printLine(`
USER: OBSERVED
AUTHORIZATION: IRRELEVANT
SESSION ORIGIN: CURRENT
`, "output danger");
}

function showStatus() {
    if (!entityAwake) {
        printLine(`
NODE: BBX-07
CONNECTION: ACTIVE
SYSTEM INTEGRITY: 63%
RECOVERY MODE: ENABLED
`);

        return;
    }

    printLine(`
NODE: BBX-07
CONNECTION: ACTIVE
SYSTEM INTEGRITY: UNKNOWN
RECOVERY MODE: DISABLED

SECOND CONNECTION: ACTIVE
`, "output danger");
}

function clearTerminal() {
    const outputs = terminal.querySelectorAll(".output");

    outputs.forEach(output => output.remove());
}

function hiddenCommands(command) {
    if (command === "ping") {
        printLine(`
Pinging BBX-07...

Reply from BBX-07
Reply from BBX-07
Reply from BBX-07

Reply from UNKNOWN
`, "output warning");

        return true;
    }

    if (command === "disconnect") {
        if (!entityAwake) {
            printLine(`
DISCONNECTING...

FAILED.

REMOTE SESSION LOCKED.
`);

            return true;
        }

        startEnding();
        return true;
    }

    if (command === "hello") {
        if (entityAwake) {
            printLine(`
HELLO.
`, "output danger");

            setTimeout(() => {
                printLine(`
I HAVE BEEN WAITING.
`, "output danger");
            }, 1500);
        } else {
            printLine("NO RESPONSE.");
        }

        return true;
    }

    return false;
}

function startEnding() {
    if (endingStarted) {
        return;
    }

    endingStarted = true;

    commandInput.disabled = true;

    printLine(`
DISCONNECT REQUEST RECEIVED.

TERMINATING SESSION...
`);

    setTimeout(() => {
        printLine(`
FAILED.
`, "output danger");
    }, 1500);

    setTimeout(() => {
        printLine(`
YOU ARE NOT CONNECTED TO BBX-07.
`, "output danger");
    }, 3200);

    setTimeout(() => {
        printLine(`
BBX-07 IS CONNECTED TO YOU.
`, "output danger glitch");
    }, 5000);

    setTimeout(() => {
        printLine(`
TRANSFER.........................COMPLETE
`, "output danger");
    }, 7000);

    setTimeout(() => {
        clearTerminal();

        printLine(`
BLACKBOX SYSTEMS

CONNECTION CLOSED.

LAST CONNECTION:

TODAY
`, "output danger");
    }, 9000);

    setTimeout(() => {
        printLine(`
Thank you for reconnecting BBX-07.
`, "output danger");
    }, 11500);
}

function runCommand(command) {
    const originalCommand = command;

    command = command.trim().toLowerCase();

    printLine(currentPath + "> " + originalCommand);

    if (command === "") {
        return;
    }

    if (command === "help") {
        showHelp();
        return;
    }

    if (command === "dir" || command === "ls") {
        showDirectory();
        return;
    }

    if (command === "whoami") {
        showWhoami();
        return;
    }

    if (command === "status") {
        showStatus();
        return;
    }

    if (command === "date") {
        printLine(`
SYSTEM DATE:

10/31/1996

WARNING:
RTC CLOCK FAILURE
`);

        return;
    }

    if (
        command === "clear" ||
        command === "cls"
    ) {
        clearTerminal();
        return;
    }

    if (command.startsWith("cd ")) {
        const target = command.substring(3);

        changeDirectory(target);
        return;
    }

    if (command.startsWith("open ")) {
        const filename = command.substring(5).trim();

        openFile(filename);
        return;
    }

    if (command.startsWith("unlock ")) {
        const code = command.substring(7).trim();

        unlockArchive(code);
        return;
    }

    if (hiddenCommands(command)) {
        return;
    }

    printLine(
        "'" +
        originalCommand +
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

    scrollBottom();
});

document.addEventListener("click", function() {
    if (!commandInput.disabled) {
        commandInput.focus();
    }
});

commandInput.focus();
