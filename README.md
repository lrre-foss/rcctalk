# rcctalk
Powerful command line utility to communicate with RCCService instances

# Screenshot
![](https://github.com/kiseki-lol/rcctalk/raw/trunk/screenshot.png)

# Usage
rcctalk is a console application that can be installed by cloning the repository and then running the command `npm i -g` to install it system-wide. You can then easily open the rcctalk shell from the command line by entering `rcctalk`. For further instructions, please run `rcctalk --help` or type `help` into the shell.

## Example operations
- `OpenJob("sampleJobId123", "return 'Hello world!'")` -> Opens a job and returns `Hello world!`
- `CloseAllJobs()` -> Closes every job on the connected RCCService instance
- `Execute("sampleJobId123", "local a, b = ...; return b .. a;", ["spaghetti", "cook"])` -> Will return `cook spaghetti` assuming a job with ID `sampleJobId123` exists

Optional parameters are denoted with a question mark and don't always have to be set, but if there are multiple optional parameters in a sequence then they must be inputted according to their order denoted in the help menu.

## Eval
rcctalk uses JavaScript's inbuilt `eval` function to parse operation parameters, allowing you to take advantage of JavaScript functions and utilize mathematical operators to achieve even more powerful access to RCCService. Here are some examples:
- `Execute("sampleJobId123", "return " + Math.pow(6, 2))` -> Will return `36`
- `Execute("sampleJobId123", fs.readFileSync("c:\\gameserver.txt"))` -> Will read from `c:\gameserver.txt` and send that script to RCCService

# License
Copyright (c) Kiseki 2023. All rights reserved.