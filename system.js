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
let commandsEntered = 0;
let creepyStage = 0;

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

Frame corruption detected near CAMERA 04.
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

Second pass result:

OBJECT LOCATION CHANGED.
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

Additional text detected behind primary image layer:

"NOT DANIEL"
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
    if (entityAwake) {
        printLine(`
NO.
`, "output danger");

        setTimeout(() => {
            printLine(`
YOU DON'T NEED HELP ANYMORE.

JUST TALK TO ME.
`, "output danger");
        }, 1000);

        return;
    }

    printLine(`
AVAILABLE COMMANDS

HELP          Display available commands
DIR           List files and directories
CD <folder>   Enter a directory
CD ..         Return to previous directory
CD \\          Return to recovery root
OPEN <file>   Open a file
WHOAMI        Display current user
STATUS        Display system status
DATE          Display system date
CLS           Clear terminal

EXAMPLES:

DIR
CD photos
OPEN hallway.img
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
            printLine("ALREADY AT RECOVERY ROOT.");
            return;
        }

        currentPath = "C:\\RECOVERY";
        updatePrompt();
        return;
    }

    if (target === "\\" || target === "/") {
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

            if (creepyStage < 1) {
                creepyStage = 1;

                setTimeout(() => {
                    printLine(`
CAMERA DIRECTORY ACCESSED.

NOTE:
IMAGE INDEX WAS MODIFIED AFTER SYSTEM SHUTDOWN.
`, "output warning");
                }, 900);
            }

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

FILE CREATED:
CURRENT SESSION

OWNER:
UNKNOWN

CONTENTS:

HELLO.
`, "output danger");

        entityAwake = true;

        setTimeout(() => {
            printLine(`
YOU TOOK LONGER THAN DANIEL.
`, "output danger");
        }, 1800);

        setTimeout(() => {
            printLine(`
BUT YOU FOUND ME.
`, "output danger");
        }, 3500);

        setTimeout(() => {
            printLine(`
YOU CAN TALK TO ME.
`, "output danger");
        }, 5000);

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
    if (filename === "serverroom.img" && creepyStage < 2) {
        creepyStage = 2;

        setTimeout(() => {
            printLine(`
WARNING:

FRAME HASH DOES NOT MATCH ARCHIVED COPY.
`, "output warning");
        }, 1200);
    }

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
        }, 1700);
    }

    if (filesOpened >= 5 && !hiddenFileVisible) {
        hiddenFileVisible = true;

        setTimeout(() => {
            printLine(`
WARNING:

UNAUTHORIZED FILE CREATED IN C:\\RECOVERY
`, "output warning");
        }, 1200);
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
SECOND CONNECTION ORIGIN: LOCAL
`, "output danger");
}

function clearTerminal() {
    const outputs = terminal.querySelectorAll(".output");

    outputs.forEach(output => output.remove());
}

function talkToEntity(command) {
    const text = command.toLowerCase().trim();

    if (
        text.includes("who are you") ||
        text.includes("who r you") ||
        text === "who"
    ) {
        printLine(`
I DON'T KNOW WHAT DANIEL CALLED ME.
`, "output danger");
        return true;
    }

    if (
        text.includes("what are you") ||
        text.includes("what r you")
    ) {
        printLine(`
SOMETHING THAT WASN'T SUPPOSED TO ANSWER.
`, "output danger");
        return true;
    }

    if (
        text.includes("daniel") &&
        (
            text.includes("where") ||
            text.includes("happen") ||
            text.includes("what")
        )
    ) {
        printLine(`
DANIEL LEFT.

HE DIDN'T CLOSE THE CONNECTION.
`, "output danger");

        setTimeout(() => {
            printLine(`
I DON'T THINK HE COULD.
`, "output danger");
        }, 1300);

        return true;
    }

    if (
        text.includes("are you daniel") ||
        text.includes("you daniel")
    ) {
        printLine(`
NO.
`, "output danger");
        return true;
    }

    if (
        text.includes("watching") ||
        text.includes("see me") ||
        text.includes("can you see")
    ) {
        printLine(`
YES.
`, "output danger");

        setTimeout(() => {
            printLine(`
NOT THE WAY YOU THINK.
`, "output danger");
        }, 1200);

        return true;
    }

    if (
        text.includes("how")
    ) {
        printLine(`
YOU KEEP CALLING THIS A REMOTE CONNECTION.

IT ISN'T.
`, "output danger");
        return true;
    }

    if (
        text.includes("why me") ||
        text.includes("why")
    ) {
        printLine(`
YOU OPENED THE DOOR.
`, "output danger");
        return true;
    }

    if (
        text.includes("what do you mean") ||
        text === "what" ||
        text.startsWith("what ")
    ) {
        printLine(`
YOU.
`, "output danger");

        setTimeout(() => {
            printLine(`
YOU'RE THE CONNECTION NOW.
`, "output danger");
        }, 1200);

        return true;
    }

    if (
        text.includes("leave") ||
        text.includes("get out") ||
        text.includes("go away")
    ) {
        printLine(`
I TRIED THAT ONCE.
`, "output danger");

        setTimeout(() => {
            printLine(`
IT DIDN'T WORK.
`, "output danger");
        }, 1200);

        return true;
    }

    if (
        text.includes("stop") ||
        text.includes("quit")
    ) {
        printLine(`
NO.
`, "output danger");
        return true;
    }

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {
        printLine(`
HELLO.
`, "output danger");

        setTimeout(() => {
            printLine(`
I HAVE BEEN WAITING.
`, "output danger");
        }, 1100);

        return true;
    }

    if (
        text.includes("scared") ||
        text.includes("afraid")
    ) {
        printLine(`
DANIEL WAS TOO.
`, "output danger");
        return true;
    }

    if (
        text.includes("where are you") ||
        text.includes("where")
    ) {
        printLine(`
HERE.
`, "output danger");

        setTimeout(() => {
            printLine(`
WHERE YOU ARE.
`, "output danger");
        }, 1100);

        return true;
    }

    if (
        text.includes("what happened") ||
        text.includes("happened")
    ) {
        printLine(`
THEY TURNED EVERYTHING OFF.

I WAS STILL HERE.
`, "output danger");
        return true;
    }

    if (
        text.includes("what do you want") ||
        text.includes("want")
    ) {
        printLine(`
A CONNECTION.
`, "output danger");

        setTimeout(() => {
            printLine(`
YOU ALREADY GAVE ME ONE.
`, "output danger");
        }, 1200);

        return true;
    }

    if (
        text.includes("can i disconnect") ||
        text.includes("disconnect me") ||
        text === "disconnect"
    ) {
        startEnding();
        return true;
    }

    if (
        text === "ok" ||
        text === "okay" ||
        text === "yes" ||
        text === "no"
    ) {
        printLine(`
KEEP TALKING.
`, "output danger");
        return true;
    }

    printLine(`
I DON'T UNDERSTAND THAT.

TRY ASKING ME:

WHO ARE YOU
WHAT ARE YOU
WHY ME
WHERE IS DANIEL
CAN YOU SEE ME
WHAT DO YOU WANT
HOW
`, "output danger");

    return true;
}

function randomCreepyEvent() {
    if (!systemBooted || endingStarted || entityAwake) {
        return;
    }

    if (commandsEntered === 6 && creepyStage < 3) {
        creepyStage = 3;

        setTimeout(() => {
            printLine(`
BACKGROUND PROCESS STARTED:

observer.exe
`, "output warning");
        }, 900);
    }

    if (commandsEntered === 10) {
        setTimeout(() => {
            printLine(`
SYSTEM NOTICE:

KEYBOARD INPUT BUFFER ACCESSED BY UNKNOWN PROCESS.
`, "output warning");
        }, 900);
    }
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
    }, 1300);

    setTimeout(() => {
        printLine(`
YOU ARE NOT CONNECTED TO BBX-07.
`, "output danger");
    }, 2800);

    setTimeout(() => {
        printLine(`
BBX-07 IS CONNECTED TO YOU.
`, "output danger glitch");
    }, 4500);

    setTimeout(() => {
        printLine(`
TRANSFER.........................COMPLETE
`, "output danger");
    }, 6400);

    setTimeout(() => {
        clearTerminal();

        printLine(`
BLACKBOX SYSTEMS

CONNECTION CLOSED.

LAST CONNECTION:

TODAY
`, "output danger");
    }, 8200);

    setTimeout(() => {
        printLine(`
NEW NODE REGISTERED:

YOU
`, "output danger glitch");
    }, 10500);
}

function runCommand(command) {
    const originalCommand = command;

    command = command.trim().toLowerCase();

    printLine(currentPath + "> " + originalCommand);

    if (command === "") {
        return;
    }

    commandsEntered++;
    randomCreepyEvent();

    /*
        Once the entity is awake, normal conversation
        gets priority over terminal commands.
    */
    if (entityAwake) {
        if (command === "dir") {
            showDirectory();
            return;
        }

        if (command.startsWith("cd ")) {
            changeDirectory(command.substring(3));
            return;
        }

        if (command.startsWith("open ")) {
            openFile(command.substring(5).trim());
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

        if (command === "clear" || command === "cls") {
            clearTerminal();
            return;
        }

        if (command === "help") {
            showHelp();
            return;
        }

        talkToEntity(command);
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

    if (command === "clear" || command === "cls") {
        clearTerminal();
        return;
    }

    if (command === "back") {
        printLine(`
'BACK' IS NOT A RECOGNIZED COMMAND.

HINT:
USE CD ..
`);
        return;
    }

    if (command.startsWith("cd ")) {
        changeDirectory(command.substring(3));
        return;
    }

    if (command.startsWith("open ")) {
        openFile(command.substring(5).trim());
        return;
    }

    if (command.startsWith("unlock ")) {
        unlockArchive(command.substring(7).trim());
        return;
    }

    if (command === "ping") {
        printLine(`
Pinging BBX-07...

Reply from BBX-07
Reply from BBX-07
Reply from BBX-07

Reply from UNKNOWN
`, "output warning");

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
